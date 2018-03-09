# -*- coding: utf-8 -*-
# See LICENSE file for full copyright and licensing details.

from odoo import models, fields, api, _


class HotelRoomExtended(models.Model):
    """
         This class is inherit in hotel.room
         ------------------------------------------------------------
    """
    _inherit = 'hotel.room'


    site_type_id = fields.Many2one('hotel.room.site',string="Site type")
    size = fields.Integer(string="Size Of the Campsite")
    proximity_to_water = fields.Integer(string="Proximity To Water")
    proximity_to_bathrooms = fields.Integer(string="Number Of Vehicles Allowed")
    is_pets_allowed = fields.Boolean(string="Are pets allowed ?")
    no_pets_allowed = fields.Integer(string="Number Of Vehicles Allowed") 
    max_people_allowed = fields.Integer(string="Number Of Vehicles Allowed")
    access_type = fields.Selection([('vehicle','Vehicle'),
        ('walk_in','Walk In')], string="How to Access this site ?")
    surface = fields.Char(string="Surface")
    sun = fields.Char(string="Sun")
    is_hookups = fields.Boolean(string="Hookups allowed ?")
    hookup_types = fields.Many2many('hotel.room.hookup.types',
                                    string="Hookup Types")
    no_of_vehicles = fields.Integer(string="Number Of Vehicles Allowed")
    nature_features = fields.Many2many('hotel.room.nature.features',
                                       string="Nature Features")
    sort_code = fields.Char(string="Sort Code")
    partner_id  = fields.Many2one('res.partner', string='Park',
                    help="Assign the park where this campsite is situated !")


class HotelRoomSite(models.Model):
    """
      This class is create hotel.room.site
    ------------------------------------------------------------
    """
    _name = 'hotel.room.site'

    name = fields.Char(string="Site")


class HotelRoomHookupTypes(models.Model):
    """
       This class  is inherit in hotel.room.amenities
       because res.partner in add icon functionality
       ------------------------------------------------------------
    """
    _name = 'hotel.room.hookup.types'

    name = fields.Char(string="Hookup types")


class HotelRoomNatureFeatures(models.Model):
    """
           This class  is inherit in HotelRoomNatureFeatures
           ------------------------------------------------------------
    """
    _name = 'hotel.room.nature.features'

    name = fields.Char(string="Nature Features")


class HotelRoomAmenitiesExtended(models.Model):
    """
         This class  is inherit in hotel.room.amenities
         because res.partner in add icon functionality
         ------------------------------------------------------------
    """
    _inherit = 'hotel.room.amenities'

    icon = fields.Binary(string='Icon')


class HotelRoomAmenitiesDescriptionExtended(models.Model):
    """
           This class  is create
           because all company has different Description
        ------------------------------------------------------------
    """

    _name = 'hotel.room.amenities.description'
    _rec_name = 'amenities_id'

    amenities_id = fields.Many2one('hotel.room.amenities',string="Amenities")
    partner_id = fields.Many2one('res.partner',string="Company Name")
    description = fields.Text(string='Description')


class ResPartnerInherited(models.Model):
    """
         This class  is inherit in res.partner
         because res.partner in add functionality to use our project releted
         ------------------------------------------------------------
         @param self: The object pointer
    """

    _inherit = 'res.partner'
    
    campsite_ids = fields.One2many('hotel.room','partner_id',
                                   string='Campsites',
                                help="Assign the Campsites for this Park !")
    amenities_ids = fields.One2many('hotel.room.amenities.description',
                                    'partner_id',
                                       string='Amenities'
                                      , help="Assign Amenities for this Park !")
    is_park = fields.Boolean(string='Park',help="can be a park?")

    season = fields.Char(string="Season")
    day_use_hours = fields.Char(String="Day Use Hours")
    camping = fields.Char(string="Camping")
    pets = fields.Char(string="Pets")
    images_ids = fields.One2many('ir.attachment','partner_id',string="images")

    @api.model
    def default_get(self,fields):
        """
            This method is for Default value set for res Partner
            .when park name Action is called then is_company True
            ------------------------------------------------------------
            @param self: The object pointer
            @param fields: all default fields are return
            @return: default value of dictionary.
        """
        res = super(ResPartnerInherited, self).default_get(fields)
        print ".......................................",res
        res['is_company'] = 'True'

        return res

    @api.onchange('company_type')
    def change_park(self):
        """
           This method is for is_park field True
           .when costumer select in coustmer-type
           ------------------------------------------------------------
           @param self: The object pointer
        """
        self.is_park = False
        if self.company_type == 'company':
             self.is_park = True


class IrAttachmentInherited(models.Model):
    """
              This class  is inherit in ir.attachment
              because ir.attachment is not contain res.partner reltion ship
              ------------------------------------------------------------
              @param self: The object pointer
     """
    _inherit="ir.attachment"

    partner_id = fields.Many2one('res.partner',string='Partner')
