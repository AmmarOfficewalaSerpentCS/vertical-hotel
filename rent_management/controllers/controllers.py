# -*- coding: utf-8 -*-
from odoo import http

# class RentManagement(http.Controller):
#     @http.route('/rent_management/rent_management/', auth='public')
#     def index(self, **kw):
#         return "Hello, world"

#     @http.route('/rent_management/rent_management/objects/', auth='public')
#     def list(self, **kw):
#         return http.request.render('rent_management.listing', {
#             'root': '/rent_management/rent_management',
#             'objects': http.request.env['rent_management.rent_management'].search([]),
#         })

#     @http.route('/rent_management/rent_management/objects/<model("rent_management.rent_management"):obj>/', auth='public')
#     def object(self, obj, **kw):
#         return http.request.render('rent_management.object', {
#             'object': obj
#         })