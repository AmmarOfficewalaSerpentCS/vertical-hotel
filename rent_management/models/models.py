# -*- coding: utf-8 -*-

from datetime import datetime
from odoo import models, fields, api
from odoo.tools import DEFAULT_SERVER_DATETIME_FORMAT as DTF
from odoo.exceptions import UserError, ValidationError


class ProductProduct(models.Model):
    """This will inherit the product.template and add company_ids to
    store the individual quantity of product based on park, rent_id to
    store the rental history of product, rent_price to store and calculate
    the rent."""
    _inherit = "product.template"

    company_ids = fields.One2many("res.company",
                                  "product_id", string="Parks")
    rent_id = fields.Many2one("rent.product", "Rent")
    rent_price = fields.Float(
        "Rent Price", help="Enter Hourly rent of Product")

    # Make product stockable and trackable when it's on rent
    @api.onchange("rental")
    def check_onrent(self):
        """Set product type to stockable and enable
        tracking by serial number  when rental is True"""
        for rec in self:
            if rec.rental:
                rec.type = "product"
                rec.tracking = "serial"

    # set rental to true when called from rent products menu
    @api.model
    def default_get(self, fields):
        """override the default_get method to set the rental to
        True when form view is called from Rent Products menu"""
        res = super(ProductProduct, self).default_get(fields)
        if self._context.get("rental"):
            res["rental"] = "True"
        return res


class ResCompany(models.Model):
    """inherit res.company to add product_id to store the
    products of company and quantity to store the quantity
    available on that company"""
    _inherit = "res.company"

    product_id = fields.Many2one("product.template")
    quantity = fields.Integer("Product Quentity")


class RentProduct(models.Model):
    """rent a product to a customer and save the record
    in folio as well as in sale order. The detail of the products
    rented by customer are stored in rent.product.line"""
    _name = "rent.product"
    _description = "Rent Product Detail"
    _rec_name = "customer_id"

    folio_id = fields.Many2one("hotel.folio",
                               string="Folio",
                               required=True,
                               readonly=True)
    customer_id = fields.Many2one(
        "res.partner", "Guest Name",
        related="folio_id.partner_id",
        store=True)
    product_lines = fields.One2many("rent.product.line",
                                    "rent_id",
                                    string="Products")
    state = fields.Selection([
        ("draft", "Draft"),
        ("confirm", "Confirm"),
        ("done", "Done"),
        ("paid", "Paid")], string="State", default="draft")

    @api.multi
    def set_confirm(self):
        """Set the state in confirm and add detail in folio as well as
        sale order line"""
        hotel_folio_obj = self.env["hotel.folio"]
        hsl_obj = self.env["hotel.service.line"]
        so_line_obj = self.env["sale.order.line"]
        for order_obj in self:
            hotelfolio = order_obj.folio_id.order_id.id
            if order_obj.folio_id:
                for order1 in order_obj.product_lines:
                    values = {"order_id": hotelfolio,
                              "name": order1.product_id.name,
                              "product_id": order1.product_id.id,
                              "product_uom_qty": order1.quantity,
                              "price_unit": order1.product_id.rent_price,
                              "price_subtotal": order1.total_amount,
                              }
                    sol_rec = so_line_obj.create(values)
                    hsl_obj.create({"folio_id": order_obj.folio_id.id,
                                    "service_line_id": sol_rec.id})
            self.state = "confirm"
        return True

    def set_draft(self):
        """Set the record state to draft"""
        self.state = "draft"


class RentalProductLine(models.Model):
    """save the rental product detail. calculate the rent
    according to product rent price and duration."""
    _name = "rent.product.line"
    _description = "Rent product line"

    rent_id = fields.Many2one("rent.product")
    product_id = fields.Many2one(
        "product.template", string="Product", required=True)
    quantity = fields.Integer("Quantity")
    start_date = fields.Datetime(
        "Start Date", default=lambda self: fields.Datetime.now())
    end_date = fields.Datetime("End Date")
    rent_price = fields.Float(
        "Rent Price", related="product_id.rent_price", readonly=True)
    total_amount = fields.Float(
        "Total Amount", readonly=True, store=True)
    duration = fields.Char("Duration", store=False)
    status = fields.Selection(
        [('rent', 'On Rent'), ('return', 'Returned')],
        string="Status", default='rent')

    @api.onchange("product_id", "quantity", "start_date", "end_date")
    def compute_total(self):
        """Compute the total according to product rent price, it's
        quantity and duration"""
        if self.product_id:
            # start_date = datetime.strptime(self.start_date, DTF)
            # end_date = datetime.strptime(self.end_date, DTF)
            # diff = end_date - start_date
            # days, seconds = diff.days, diff.seconds
            # hours = days * 24 + seconds // 3600
            # self.duration = str(hours) + 'Hours'
            self.total_amount = self.quantity * self.rent_price
        if self.product_id and self.quantity:
            if self.quantity > int(self.product_id.qty_available):
                self.quantity = 0
                raise ValidationError("Sorry! Not enough quantity.")


class ReturnRentProduct(models.Model):
    _name = "return.rent.product"
    _description = "Return a rented product"
    _rec_name = 'customer_id'

    folio_id = fields.Many2one("hotel.folio",
                               string="Folio",
                               required=True)
    customer_id = fields.Many2one(
        "res.partner", "Guest Name",
        related="folio_id.partner_id",
        store=True)
    product_id = fields.Many2one("product.template", "Product")
    start_date = fields.Datetime('Start Date', store=True)
    end_date = fields.Datetime(
        'End Date', default=lambda self: fields.Datetime.now())
    quantity = fields.Integer('Quantity', readonly=True, store=True)

    @api.onchange('folio_id')
    def get_date(self):
        for rec in self:
            if rec.folio_id:
                product_ids = []
                rent_datas = self.env['rent.product'].search(
                    [('folio_id', '=', rec.folio_id.id)])
                for data in rent_datas:
                    for product_line in data.product_lines:
                        for product in product_line.product_id:
                            product_ids.append(product.id)
                return {
                    'domain': {
                        'product_id': [('id', 'in', product_ids)],
                    }}

    @api.onchange('product_id')
    def get_product_detail(self):
        for rec in self:
            if rec.product_id:
                rent_datas = self.env['rent.product'].search(
                    [('folio_id', '=', rec.folio_id.id)])
                for data in rent_datas:
                    for product_line in data.product_lines:
                        if product_line.product_id == rec.product_id:
                            rec.start_date = product_line.start_date
                            rec.quantity = product_line.quantity

    @api.model
    def create(self, vals):
        rent_datas = self.env['rent.product'].search(
            [('folio_id', '=', vals.get('folio_id'))])
        for data in rent_datas:
            for product_line in data.product_lines:
                if product_line.product_id.id == vals.get('product_id'):
                    product_line.status = 'return'
                    product_line.end_date = vals.get('end_date')
                    start_date = datetime.strptime(
                        product_line.start_date, DTF)
                    end_date = datetime.strptime(vals.get('end_date'), DTF)
                    diff = end_date - start_date
                    days, seconds = diff.days, diff.seconds
                    hours = days * 24 + seconds // 3600
                    product_line.duration = str(hours) + 'Hours'
                    product_line.total_amount = product_line.quantity * \
                        product_line.rent_price * hours
        return super(ReturnRentProduct, self).create(vals)
