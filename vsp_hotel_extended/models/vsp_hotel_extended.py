# -*- coding: utf-8 -*-
# See LICENSE file for full copyright and licensing details.

from odoo import models, fields, api, _


class HotelRoomExtended(models.Model):

    _inherit = 'hotel.room'

    site_type_id = fields.Many2one('hotel.room.site',string="Site type")
    size = fields.Integer(string="Size Of the Campsite")
    proximity_to_water = fields.Integer(string="Proximity To Water")
    proximity_to_bathrooms = fields.Integer(string="Number Of Vehicles Allowed")
    id_pets_allowed = fields.Boolean(string="Are pets allowed ?")
    no_pets_allowed = fields.Integer(string="Number Of Vehicles Allowed") 
    max_people_allowed = fields.Integer(string="Number Of Vehicles Allowed")
    access_type = fields.Selection([('vehicle','Vehicle'),
        ('walk_in','Walk In')], string="How to Access this site ?")
    surface = fields.Char(string="Surface")
    sun = fields.Char(string="Sun")
    is_hookups = fields.Boolean(string="Hookups allowed ?")
    hookup_types = fields.Many2many('hotel.room.hookup.types', string="Hookup Types")
    no_of_vehicles = fields.Integer(string="Number Of Vehicles Allowed")
    nature_features = fields.Many2many('hotel.room.nature.features', string="Nature Features")
    sort_code = fields.Char(string="Sort Code")

class HotelRoomSite(models.Model):

    _name = 'hotel.room.site'

    name = fields.Char(string="Site")


class HotelRoomHookupTypes(models.Model):

    _name = 'hotel.room.hookup.types'

    name = fields.Char(string="Hookup types")


class HotelRoomNatureFeatures(models.Model):

    _name = 'hotel.room.nature.features'

    name = fields.Char(string="Nature Features")
