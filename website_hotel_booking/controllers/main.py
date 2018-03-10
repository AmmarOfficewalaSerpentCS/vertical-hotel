# -*- coding: utf-8 -*-
# See LICENSE file for full copyright and licensing details.

import werkzeug
import odoo.addons.website_sale.controllers.main
from odoo.tools.translate import _
from odoo.addons.website.models.website import slug
from odoo import http
from odoo.http import request
from datetime import datetime
from odoo import tools
from odoo.http import request
from odoo.addons.payment_paypal.controllers.main import PaypalController
import urlparse
import logging
import urllib2
from odoo import http, SUPERUSER_ID

_logger = logging.getLogger(__name__)


class PaypalController(odoo.addons.payment_paypal.controllers.main.PaypalController):

    def paypal_validate_data(self, **post):
        """ Paypal IPN: three steps validation to ensure data correctness

         - step 1: return an empty HTTP 200 response -> will be done at the end
           by returning ''
         - step 2: POST the complete, unaltered message back to Paypal (preceded
           by cmd=_notify-validate), with same encoding
         - step 3: paypal send either VERIFIED or INVALID (single word)

        Once data is validated, process it. """
        res = False
        new_post = dict(post, cmd='_notify-validate')
        reference = post.get('item_number')
        tx = None
        if reference:
            tx_ids = request.env['payment.transaction'].search(
                [('reference', '=', reference)])
            if tx_ids:
                tx = request.env['payment.transaction'].browse(tx_ids[0])
        paypal_urls = request.env['payment.acquirer']._get_paypal_urls(
            tx and tx.acquirer_id and tx.acquirer_id.environment or 'prod')
        validate_url = paypal_urls['paypal_form_url']
        urequest = urllib2.Request(validate_url, werkzeug.url_encode(new_post))
        uopen = urllib2.urlopen(urequest)
        resp = uopen.read()
        if resp == 'VERIFIED':
            _logger.info('Paypal: validated data')
            res = request.env['payment.transaction'].form_feedback(
                post, 'paypal')
            # change state in transaction
            change_state = request.env['payment.transaction'].write(
                int(post.get('new_transaction_id')), {'state': 'done'})
            reservation_id = request.env['hotel.reservation'].search(
                [('reservation_no', '=', str(post.get('item_number')))])
            # Create new Move
            create_new_move = request.env['hotel.reservation'].confirmed_reservation(
                reservation_id)
            create_new_move_folio = request.env['hotel.reservation']._create_folio(
                reservation_id)

        elif resp == 'INVALID':
            _logger.warning('Paypal: answered INVALID on data verification')
        else:
            _logger.warning(
                'Paypal: unrecognized paypal answer, received %s instead of VERIFIED or INVALID' % resp.text)
        return res

    @http.route('/payment/paypal/dpn', type='http', auth="none", methods=['POST'])
    def paypal_dpn(self, **post):
        #         cr, uid, context, pool = request.cr, request.uid, request.context, request.registry
        reference = str(post.get('item_number'))
        resv_id = request.env['hotel.reservation'].sudo().search(
            [('reservation_no', '=', reference)])
        if resv_id:
            # Create new transaction in odoo
            new_transaction_id = request.env['payment.transaction'].create({
                'acquirer_id': request.env['payment.acquirer'].search([('name', '=', 'Paypal')])[0],
                'type': 'form',
                'amount': float(post.get('mc_gross')),
                'currency_id': request.env['res.currency'].search([('name', '=', str(post.get('mc_currency')))])[0],
                'reservation_no': post.get('invoice'),
                'partner_id': resv_id.partner_id.id,
                'reference': reference,
            })
            post.update({'new_transaction_id': new_transaction_id,
                         'new_transaction_name': reference})
        return super(PaypalController, self).paypal_dpn(**post)


class Websitehotelbooking(http.Controller):

    @http.route(['/page/reserve'], type='http', auth='public', csrf=False, website=True)
    def get_data(self, *args, **kwargs):
        room_type = request.env['product.category'].sudo().search([
            # ('isroomtype','=',True)
        ])
        company_id = request.env['res.users'].sudo().browse(
            request.uid).company_id
        company_ids = request.env['res.company'].sudo().search([])
        values = {
            'company_id': company_id,
            'company_ids': company_ids,
            'room_type': request.env['product.category'].sudo().search([
                # ('isroomtype','=',True),
                ('parent_id', '!=', False)])
        }
        return http.request.render('website_hotel_booking.reserved_rooms', values)

    @http.route(['/park_details'], type='json', auth='public', csrf=False, website=True)
    def park_details(self, **post):
        if post.get('park_id'):
            company_id = int(post.get('park_id'))
            partner_rec = request.env['res.partner'].sudo().search(
                [('id', '=', company_id), ('active', '=', True)])
            return request.env['ir.ui.view'].render_template("website_hotel_booking.park_info_details", {
                'partner_rec': partner_rec})

    @http.route(['/check_availability'], type='json', auth='public', website=True)
    def check_availability(self, **post):
        values = {}
        roomprice = 0.0
        assigned = False
        room_ids = []
        current_date_time = datetime.now()
        today_date = current_date_time.strftime('%d/%m/%Y %H:%M:%S')
        room_type = request.env['product.category'].sudo().search(
            [('id', '=', post.get('room_types'))])
        if post.get('park_id'):
            hotel_room_ids = request.env['hotel.room'].sudo().search(
                [('isroom', '=', True), ('partner_id.id', '=', int(post.get('park_id')))])
            hotel_reservation_ids = request.env['hotel.reservation']
            for i in hotel_room_ids:
                roomprice = i.list_price
            get_checkin = post.get('checkin')
            get_checkout = post.get('checkout')
            get_total_guests = post.get('rooms_guest')
            reserved_rooms = []
            unreserved_rooms = []
            for room in hotel_room_ids:
                assigned = False
                for line in room.room_reservation_line_ids:
                    if(line.check_in >= get_checkin and
                       line.check_in <= get_checkout or
                       line.check_out <= get_checkout and
                       line.check_out >= get_checkin):
                        assigned = True
                        reserved_rooms.append(room.id)
                if not assigned:
                    unreserved_rooms.append(room.id)
                    room_ids.append(room.id)
                    obj = request.env['hotel_reservation.line'].sudo().search(
                        [('id', 'in', room_ids)])
            if reserved_rooms:
                reserved_hotel_room = hotel_room_ids.sudo().search(
                    [('id', 'in', reserved_rooms)])
                values.update({'reserved_rooms': reserved_hotel_room})
            if unreserved_rooms:
                unreserved_hotel_room = hotel_room_ids.sudo().search(
                    [('id', 'in', unreserved_rooms)])
                values.update({'unreserved_rooms': unreserved_hotel_room})
            all_room_type = request.env['product.category'].sudo().search([])
            values.update({
                'hotel_room': hotel_room_ids,
                'checkin': get_checkin,
                'checkout': get_checkout,
                'rooms_guest': get_total_guests,
                'adult': post.get('adult'),
                'child': post.get('child'),
                'room_types': post.get('room_types'),
                'totalrooms': post.get('totalrooms'),
                'roomprice': roomprice,
                'today_date': today_date,
                'countries': request.env['res.country'].sudo().search([]),
                'room_type': request.env['product.category'].sudo().search([
                    # ('isroomtype','=',True),
                    ('parent_id', '!=', False)]),
            })

            payment_acquirer_obj = request.env['payment.acquirer']
            acquirer_id = payment_acquirer_obj.sudo().search(
                [('name', '=', 'Paypal')])
            base_url = payment_acquirer_obj.env['ir.config_parameter'].get_param(
                'web.base.url')
            acquirer = payment_acquirer_obj.browse(acquirer_id)
            tx_url = acquirer_id.get_form_action_url(),
            values.update({
                'tx_url': tx_url[0],
                'business': acquirer_id.paypal_email_account,
                'cmd': '_xclick',
                'item_name': acquirer_id.company_id.name,
                'return_url': '%s' % urlparse.urljoin(base_url, PaypalController._return_url),
                'notify_url': '%s' % urlparse.urljoin(base_url, PaypalController._notify_url),
                'cancel_return': '%s' % urlparse.urljoin(base_url, PaypalController._cancel_url),
            })
            return request.env['ir.ui.view'].render_template("website_hotel_booking.check_room_availability", values)

    @http.route(['/book_now'], type='json', auth='public', website=True)
    def book_now(self, **post):
        selected_room_ids = post.get('selected_rooms')
        total_selected_room_price = 0.0
        total_adults = 0
        get_checkin = post.get('checkin')
        get_checkout = post.get('checkout')
        get_total_guests = post.get('rooms_guest')

        selected_rooms = request.env['hotel.room'].sudo().search(
            [('id', 'in', selected_room_ids)])
        for one_room in selected_rooms:
            total_selected_room_price += one_room.list_price
            total_adults += one_room.capacity
        values = {
            'selected_rooms': selected_rooms,
            'total_selected_room_price': total_selected_room_price,
            'countries': request.env['res.country'].sudo().search([]),
            'checkin': get_checkin,
            'checkout': get_checkout,
            'rooms_guest': get_total_guests,
        }
        payment_acquirer_obj = request.env['payment.acquirer']
        acquirer_id = payment_acquirer_obj.search([('name', '=', 'Paypal')])
        base_url = payment_acquirer_obj.env['ir.config_parameter'].get_param(
            'web.base.url')
        acquirer = payment_acquirer_obj.sudo().browse(acquirer_id.id)
        tx_url = acquirer.get_form_action_url()
        values.update({
            'tx_url': tx_url,
            'business': acquirer.paypal_email_account,
            'cmd': '_xclick',
            'item_name': acquirer.company_id.name,
            'return_url': '%s' % urlparse.urljoin(base_url, PaypalController._return_url),
            'notify_url': '%s' % urlparse.urljoin(base_url, PaypalController._notify_url),
            'cancel_return': '%s' % urlparse.urljoin(base_url, PaypalController._cancel_url),
            'app_adults': post.get('app_adults'),
            'app_child': post.get('app_child'),
        })
        if post.get('app_adults') or post.get('app_child'):
            total_guest = 0
            if post.get('app_adults') and post.get('app_child'):
                total_guest = int(post.get('app_adults')) + \
                    int(post.get('app_child'))
            if post.get('app_adults') and not post.get('app_child'):
                total_guest = int(post.get('app_adults'))
            if post.get('app_child') and not post.get('app_adults'):
                total_guest = int(post.get('app_child'))
            if total_guest > total_adults:
                values.update({
                    'select_more_rooms': 'Please Select more Rooms',
                    'countries': request.env['res.country'].sudo().search([]),
                })
        return request.env['ir.ui.view'].render_template("website_hotel_booking.book_registration", values)

    @http.route(['/create_partner'], type='json', auth='public', csrf=False, website=True)
    def create_partner(self, **post):
        partner_ids = request.env['res.partner'].sudo().search(
            [('email', '=', post['app_email'])])
        vals = {
            'name': post.get('app_fname'),
            'email': post.get('app_email'),
            'mobile': post.get('app_mobile'),
            'country_id': post.get('country_id'),
            'comment': post.get('app_message'),
        }
        vals_hotel_rec = {}
        pid = request.env['product.pricelist'].sudo().search([])[0]
        if not partner_ids:
            res_partner = request.env['res.partner'].sudo().create(vals)
            rooms_types = post.get('app_room_type')
            room_types_id = request.env['product.category'].sudo().search(
                [('id', '=', rooms_types)])
            room_type_id = post.get('room_type_id')
#             if room_types_id:
            vals_hotel_rec.update({
                #                          'reservation_line':  [[0, 0, {'categ_id': room_types_id.id, 'reserve': [[6, 0, post.get('selected_rooms')]]}]]
                'reservation_line':  [[0, 0, {'reserve': [[6, 0, post.get('selected_rooms')]]}]]
            })
            addr = res_partner.address_get(['delivery', 'invoice',
                                            'contact'])
            vals_hotel_rec.update({'partner_invoice_id': addr['invoice'],
                                   'partner_order_id': addr['contact'],
                                   'partner_shipping_id': addr['delivery']
                                   })
            if pid:
                vals_hotel_rec.update({'pricelist_id': pid.id})
        else:
            rooms_types = post.get('app_room_type')
            room_types_id = request.env['product.category'].sudo().search(
                [('id', '=', rooms_types)])
            room_type_id = post.get('room_type_id')
            if room_types_id:
                vals_hotel_rec.update({
                    'reservation_line':  [[0, 0, {'categ_id': room_types_id.id, 'reserve': [[6, 0, post.get('selected_rooms')]]}]]
                })
            addr = partner_ids.address_get(['delivery', 'invoice',
                                            'contact'])
            vals_hotel_rec.update({'partner_invoice_id': addr['invoice'],
                                   'partner_order_id': addr['contact'],
                                   'partner_shipping_id': addr['delivery']
                                   })
            if pid:
                vals_hotel_rec.update({'pricelist_id': pid.id})
        get_checkin_date = datetime.strptime(
            post.get('arrival_date'), "%m/%d/%Y %H:%M:%S")
        get_checkout_date = datetime.strptime(
            post.get('depature_date'), "%m/%d/%Y %H:%M:%S")
        vals_hotel_rec.update({
            'partner_id': partner_ids.id or res_partner.id,
            'checkin': get_checkin_date.strftime('%Y-%m-%d %H:%M:%S'),
            'checkout': get_checkout_date.strftime('%Y-%m-%d %H:%M:%S'),
            'adults': post.get('app_adults'),
            'children': post.get('app_child'),
        })
        hotel_reservation_id = request.env['hotel.reservation'].sudo().create(
            vals_hotel_rec)
        vals_reservation = {
            'partner_id': partner_ids.id or res_partner.id,
            'reservation_no': hotel_reservation_id.reservation_no
        }
        return {
            'partner_id': partner_ids.id or res_partner.id,
            'reservation_no': hotel_reservation_id.reservation_no
        }

    @http.route(['/create_partner_1'], type='json', auth='public', website=True)
    def create_partner_1(self, **post):
        partner_ids = request.env['res.partner'].sudo().search(
            [('email', '=', post['app_email'])])
        vals = {
            'name': post.get('app_fname'),
            'email': post.get('app_email'),
            'mobile': post.get('app_mobile'),
            'country_id': post.get('country_id'),
            'comment': post.get('app_message'),
        }
        vals_hotel_rec = {}
        pid = request.env['product.pricelist'].sudo().search([])[0]
        if not partner_ids:
            res_partner = request.env['res.partner'].sudo().create(vals)
            rooms_types = post.get('app_room_type')
            room_types_id = request.env['product.category'].sudo().search(
                [('id', '=', rooms_types)])
            room_type_id = post.get('room_type_id')
            vals_hotel_rec.update({
                'reservation_line':  [[0, 0, {'categ_id': room_types_id.id, 'reserve': [[6, 0, post.get('selected_rooms')]]}]]
            })
            addr = res_partner.address_get(['delivery', 'invoice',
                                            'contact'])
            vals_hotel_rec.update({'partner_invoice_id': addr['invoice'],
                                   'partner_order_id': addr['contact'],
                                   'partner_shipping_id': addr['delivery']
                                   })
            if pid:
                vals_hotel_rec.update({'pricelist_id': pid.id})
        else:
            rooms_types = post.get('app_room_type')
            room_types_id = request.env['product.category'].sudo().search(
                [('id', '=', rooms_types)])
            room_type_id = post.get('room_type_id')
#             if room_types_id:
            vals_hotel_rec.update({
                'reservation_line':  [[0, 0, {'categ_id': room_types_id.id, 'reserve': [[6, 0, post.get('selected_rooms')]]}]]
            })
            addr = partner_ids.address_get(['delivery', 'invoice',
                                            'contact'])
            vals_hotel_rec.update({'partner_invoice_id': addr['invoice'],
                                   'partner_order_id': addr['contact'],
                                   'partner_shipping_id': addr['delivery']
                                   })
            if pid:
                vals_hotel_rec.update({'pricelist_id': pid.id})
        get_checkin_date = datetime.strptime(
            post.get('arrival_date'), "%m/%d/%Y %H:%M:%S")
        get_checkout_date = datetime.strptime(
            post.get('depature_date'), "%m/%d/%Y %H:%M:%S")
        vals_hotel_rec.update({
            'partner_id': partner_ids.id or res_partner.id,
            'checkin': get_checkin_date.strftime('%Y-%m-%d %H:%M:%S'),
            'checkout': get_checkout_date.strftime('%Y-%m-%d %H:%M:%S'),
            'adults': post.get('app_adults'),
            'children': post.get('app_child'),
        })

        hotel_reservation_id = request.env['hotel.reservation'].sudo().create(
            vals_hotel_rec)
        return request.env['ir.ui.view'].render_template("website_hotel_booking.book_confirm", {
            'partner_id': partner_ids.id or res_partner.id,
            'reservation_no': hotel_reservation_id.reservation_no
        })

    @http.route(['/campsites/<model("hotel.room"):campsite>'],
                type='http', auth="public", website=True)
    def campsite(self, campsite, **kw):
        values = {
            'campsite': campsite,
        }
        return request.render("website_hotel_booking.rent_select_property", values)
