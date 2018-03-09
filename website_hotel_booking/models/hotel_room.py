# -*- coding: utf-8 -*-
# See LICENSE file for full copyright and licensing details.

from odoo import models, fields, api, _

class HotelRoom(models.Model):
    
    _inherit = 'hotel.room'

    room_tags_ids = fields.Many2many('hotel.room.tags', string='Hotel Room Tags', help="Those tags are used to display on room image.")
    color = fields.Integer(string='Color Index')

class HotelRoomTags(models.Model):
    
    _name = 'hotel.room.tags'
    
    name = fields.Char(string="Name")
    color = fields.Integer(string='Color Index')
