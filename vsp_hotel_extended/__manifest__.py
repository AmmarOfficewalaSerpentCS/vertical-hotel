# -*- coding: utf-8 -*-
# See LICENSE file for full copyright and licensing details.

{

    'name': 'Board for Hotel Room FrontDesk',
    'version': '10.0.1.0.0',
    'author': 'Odoo Community Association (OCA), Serpent Consulting\
                Services Pvt. Ltd., ODOO S.A.',
    'category': 'Board/Hotel Room FrontDesk',
    'license': 'AGPL-3',
    'website': 'http://www.serpentcs.com',
    'depends': ['board',
                'report_hotel_reservation',
                ],
    'data': ['views/vsp_hotel_extended.xml',
            'views/board_frontdesk_view.xml'],
    'installable': True,
}
