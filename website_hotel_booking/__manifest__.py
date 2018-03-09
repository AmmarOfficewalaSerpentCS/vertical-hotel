# -*- coding: utf-8 -*-
# See LICENSE file for full copyright and licensing details.

{
    'name': 'Website Hotel Booking',
    'category': 'Website',
    'summary': 'Online Hotel Booking',
    'version': '1.0',
    'description': "This is a frond end module for Hotel Management",
    'author': 'Serpent Consulting Services Pvt. Ltd.',
    'depends': ['website','hotel_reservation','payment_paypal',
                'hotel','vsp_hotel_extended'],
    'data': [
        'security/ir.model.access.csv',
        'views/hotel_room_view.xml',
        'views/templates.xml',
        'views/homepage.xml',
    ],
    'installable': True,
    'auto_install': False,
}

# vim:expandtab:tabstop=4:softtabstop=4:shiftwidth=4: