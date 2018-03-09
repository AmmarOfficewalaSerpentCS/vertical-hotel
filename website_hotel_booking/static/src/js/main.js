 odoo.define('website_hotel_booking.website_hotel_booking', function (require) {
"use strict";

var core = require('web.core');
var ajax = require('web.ajax');
var website = require('website.website');

$(document).ready(function(){

    $("#drop_hotels").select2();

    ajax.jsonRpc("/park_details", 'call',{
            'park_id' : $("#drop_hotels").val()
    }).then(function(data){
            $('main').find('.dynamic_park_info').fadeOut("slow", function() {
                $('main').find('.dynamic_park_info').html(data).fadeIn("slow");
        });
        
    });

    $("#drop_hotels").change(function() {
        ajax.jsonRpc("/park_details", 'call',{
            'park_id' : $(this).val()
        }).then(function(data){
            $('main').find('.dynamic_park_info').fadeOut("slow", function() {
                $('main').find('.dynamic_park_info').html(data).fadeIn("slow");
            });
            
        });
      
    });
	
	function ajaxindicatorstart(text)
    {
        if(jQuery('body').find('#resultLoading').attr('id') != 'resultLoading'){
        jQuery('body').append('<div id="resultLoading" style="display:none"><div><img src="/website_hotel_booking/static/src/img/ajax-loader.gif"><div>'+text+'</div></div><div class="bg"></div></div>');
        }
        
        jQuery('#resultLoading').css({
            'width':'100%',
            'height':'100%',
            'position':'fixed',
            'z-index':'10000000',
            'top':'0',
            'left':'0',
            'right':'0',
            'bottom':'0',
            'margin':'auto'
        }); 
        
        jQuery('#resultLoading .bg').css({
            'background':'#000000',
            'opacity':'0.7',
            'width':'100%',
            'height':'100%',
            'position':'absolute',
            'top':'0'
        });
        
        jQuery('#resultLoading>div:first').css({
            'width': '250px',
            'height':'75px',
            'text-align': 'center',
            'position': 'fixed',
            'top':'0',
            'left':'0',
            'right':'0',
            'bottom':'0',
            'margin':'auto',
            'font-size':'16px',
            'z-index':'10',
            'color':'#ffffff'
            
        });

        jQuery('#resultLoading .bg').height('100%');
        jQuery('#resultLoading').fadeIn(300);
        jQuery('body').css('cursor', 'wait');
    }

    function ajaxindicatorstop()
    {
        jQuery('#resultLoading .bg').height('100%');
        jQuery('#resultLoading').fadeOut(300);
        jQuery('body').css('cursor', 'default');
    }

	
	
	
//    ajaxindicatorstart('Loading');
	
	$(document).on('click', '.disable_btn', function(e){
		  alert("aaaaaa");
		});
	
	$(document).on('change', '.select_count', function(e){
	    var sum = 0;
	    var count_no_room = $('#mytbody').children('tr').length;
	    count_no_room
	    $("input[name='totalrooms']").val(count_no_room);
	    $('select :selected').each(function() {
	        sum += Number($(this).val());
	    });
	     $("#room_guest").val( count_no_room + ' Campsites, '+sum + ' Guests, ' + '2 Pets') ;
	     
	});

	
	$(document).on('click', '.mobileSelect-control', function(e){
		  $( this ).toggleClass( "selected" );
		  if($('.mobileSelect-control').hasClass("selected")){
			  	  $("#btn_select_room").removeClass('custom_btn_disable');
			  } else {
				  $("#btn_select_room").addClass('custom_btn_disable');
			  };
		});
	
	$(window).scroll(function () {
   	 $('#portfolio').tooltip('hide');
           if ($(this).scrollTop() > 50) {
               $('#portfolio').fadeIn();
           } else {
               $('#portfolio').fadeOut();
           }
       });
       $('#portfolio').click(function () {
           $('#portfolio').tooltip('hide');
           $('body,html').animate({
               scrollTop: 0
           }, 800);
           return false;
       });
//       $('#back-to-top').tooltip('show');
       $('#portfolio').tooltip({ 'content': 'I should appear beneath "Foo"', 'items': '*' })

	
	$(".dropdown_room").hover(            
	        function() {
	            $('.dropdown-menu', this).not('.in .dropdown-menu').stop(true,true).slideDown("400");
	            $(this).toggleClass('open');        
	        },
	        function() {
	            $('.dropdown-menu', this).not('.in .dropdown-menu').stop(true,true).slideUp("400");
	            $(this).toggleClass('open');       
	        }
    );
	
	$('.toggle').on('click', function() {
	  $('.container').stop().addClass('active');
	});

	$('.close').on('click', function() {
	  $('.container').stop().removeClass('active');
	});

	});



$(document).ready(function() {
	
	$("#btn_select_room").addClass('custom_btn_disable');
	var counter = 1;

    $("#add_room").on("click", function () {
        counter = $('#myTable tr').length - 1;
        var newRow = $("<tr>");
        var cols = "";
        
        cols += '<td class="font_18">Campsite '+counter+'</td>';
        cols += '<td><div class="col-md-12 col-sm-8"><select class="adult_counter adult_select_box select_count" id="adult_selectable_' + counter +'"><option name="adult_zero_' + counter + '" class="btn_adult btn-lg btn-link select_adult" value="0">0 Adult</option><option name="adult_one_' + counter + '" class="btn_adult btn-lg btn-link select_adult" value="1">1</option><option name="adult_two_' + counter + '" class="btn_adult btn-lg btn-link select_adult" value="2">2</option><option name="adult_three_' + counter + '" class="btn_adult btn-lg btn-link select_adult" value="3">3</option><option name="adult_four_' + counter + '" class="btn_adult btn-lg btn-link select_adult" value="4">4</option><option name="adult_five_' + counter + '" class="btn_adult btn-lg btn-link select_adult" value="5">5</option><option name="adult_six_' + counter + '" class="btn_adult btn-lg btn-link select_adult" value="6">6</option></select></div></td>'
        cols += '<td><div class="col-md-12 col-sm-8"><select class="child_counter child_select_box select_count" id="child_selectable_' + counter +'"><option name="child_zero_' + counter + '" class="btn_adult btn-lg btn-link" value="0">0 Children</option><option name="child_one_' + counter + '" class="btn_adult btn-lg btn-link" value="1">1</option><option name="child_two_' + counter + '"class="btn_adult btn-lg btn-link" value="2">2</option><option name="child_three_' + counter + '"class="btn_adult btn-lg btn-link" value="3">3</option><option name="child_four_' + counter + '"class="btn_adult btn-lg btn-link" value="4">4</option></select></div></td>'
        cols += '<td><div class="col-md-12 col-sm-8"><select class="pet_counter pet_select_box select_count" id="pet_selectable_' + counter +'"><option name="pet_zero_' + counter + '" class="btn_adult btn-lg btn-link" value="0">0 Pets</option><option name="pet_one_' + counter + '" class="btn_adult btn-lg btn-link" value="1">1</option><option name="pet_two_' + counter + '"class="btn_adult btn-lg btn-link" value="2">2</option><option name="pet_three_' + counter + '"class="btn_adult btn-lg btn-link" value="3">3</option><option name="pet_four_' + counter + '"class="btn_adult btn-lg btn-link" value="4">4</option></select></div></td>'
        cols += '<td><button type="button" class="button-custom fa fa-trash-o ibtnDel" value="Delete"></td>';
        newRow.append(cols);
        if (counter == 50) $('#add_room').attr('disabled', true).prop('value', "You've reached the limit");
        $("table.order-list").append(newRow);
        counter++;
    });

    $("table.order-list").on("change", 'input[name^="price"]', function (event) {
        calculateRow($(this).closest("tr"));
    });

    $("table.order-list").on("click", ".ibtnDel", function (event) {
    	$(this).closest("tr").remove();
    	var sum = 0;
	    var count_no_room = $('#mytbody').children('tr').length;
	    $("input[name='totalrooms']").val(count_no_room);
	    $('select :selected').each(function() {
	        sum += Number($(this).val());
	    });
	     $("#room_guest").val( count_no_room + ' Campsites, '+sum + ' Guests, ' + '2 Pets') ;
        counter -= 1
        $('#add_room').attr('disabled', false).prop('value', "Add Row");
    });
    
    $(document).on('keyup', '.select_adult',function(){ // run anytime the value changes
    	var firstValue = $(this).val(); 
    	$(this).parent().parent().find('.baf_ammount').val(firstValue / 2); // add them and output it
 });
	
	
    $('.box').hide();
	$(".select_room_guest").click(function(){
		$('.box').slideToggle('fast');
    });

	var mql = window.matchMedia("screen and (max-width: 748px)");
	var mlq2 = window.matchMedia("screen and (max-width : 480px)");
	var mql3 = window.matchMedia("screen and (max-width: 768px)");
	
	if (mql3.matches){
		$('.find_rooms_form .input-group').css('width','100%');
		$('.input-group[class*="col-"]').css('float','initial');
		$('.form_inputs .padding_3').css('padding','');
	}
	if (mql.matches){
		$('.find_rooms_form .input-group').css('width','100%');
		$('.input-group[class*="col-"]').css('float','initial');
		$('.form_inputs .padding_3').css('padding','');
	}
	if (mlq2.matches){ 
		$('.find_rooms_form .input-group').css('width','100%');
		$('.input-group[class*="col-"]').css('float','initial');
		$('.form_inputs .padding_3').css('padding','');
	}
	
	var nowDate = new Date();
	var today = new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate(), 0, 0, 0, 0);
	
	 $('#check_in').datetimepicker({
		 format: 'DD/MM/YYYY 14:00:00',
		 minDate: today,
		 showTodayButton: true,
		 showClear: true,
		 useCurrent: false,
	 });
     $('#check_out').datetimepicker({
    	 format: 'DD/MM/YYYY 12:00:00',
    	 minDate: today,
    	 showTodayButton: true,
    	 showClear: true,
    	 useCurrent: false
     });
     $("#check_in").on("dp.change", function (e) {
    	 $( "#check_out" ).focus();
         $('#check_out').data("DateTimePicker").minDate(e.date);
     });
     $("#check_out").on("dp.change", function (e) {
         $('#check_in').data("DateTimePicker").maxDate(e.date);
     });
  
});


$(window).resize(function() {

	var mql = window.matchMedia("screen and (max-width: 748px)");
	var mlq2 = window.matchMedia("screen and (max-width : 480px)");
	var mql3 = window.matchMedia("screen and (max-width: 768px)");
	
	if (mql3.matches){
		$('.find_rooms_form .input-group').css('width','100%');
		$('.input-group[class*="col-"]').css('float','initial');
		$('.form_inputs .padding_3').css('padding','');
	}
	if (mql.matches){
		$('.find_rooms_form .input-group').css('width','100%');
		$('.input-group[class*="col-"]').css('float','initial');
		$('.form_inputs .padding_3').css('padding','');
	}
	if (mlq2.matches){ 
		$('.find_rooms_form .input-group').css('width','100%');
		$('.input-group[class*="col-"]').css('float','initial');
		$('.form_inputs .padding_3').css('padding','');
	}
});

var total_selected_room_ids = [];
$(document).on('click', '.select_room', function(e){
    e.preventDefault();
    var $this = $(this);
    var room_id = $this.data('room_id');
    if ($this.hasClass('select_object_color')){
        $this.removeClass('select_object_color');
        total_selected_room_ids = jQuery.grep(total_selected_room_ids, function(value) {
            return value != room_id;
        });
    }
    else{
        $(this).addClass('select_object_color');
        total_selected_room_ids.push(room_id);
    }
    if (total_selected_room_ids.length == parseInt($("input[name='totalrooms']").val())){
    	var scrollBottom = $(document).height() - $(window).height() - $(window).scrollTop();
    }
});

$(document).on('click', '.submit_btn', function(e){
	if (total_selected_room_ids.length == 0){
		alert('Please select your Campsites!');
		return false
	}
//	submit_btn select_continue
	if (total_selected_room_ids.length != parseInt($("input[name='totalrooms']").val())){
		alert('Please select rooms as your need');
		return false
	}
	
	
    var main = $(this).parent('div').parent('div');
    ajax.jsonRpc("/book_now", 'call',{
        'selected_rooms' : total_selected_room_ids,
        'app_adults': $("input[name='adult']").val(),
        'app_child': $("input[name='child']").val(),
        'checkin': $("input[name='check_IN']").val(),
        'checkout': $("input[name='check_OUT']").val(),
        'rooms_guest':$("input[name='rooms_guest']").val(),
    }).then(function(data){
    	if (data['select_more_rooms']){
    		$('#room_alert').css('display','block');
    		return 
    	}
    	$('#room_alert').css('display','none');
        $('#app_ammount').val(data['total_selected_room_price']);
        $('#total_ammount').val(data['total_selected_room_price']);
//        $('#myModal').modal()
        $('main').fadeOut("slow", function() {
            $('main').html(data).fadeIn("slow");
        });
        
    });
});


$(document).on('click', '#paypal_pay_now', function(e){
	$('#form_paypal').validator('validate');
	if ($('#form_paypal').find('.has-error:visible').size() > 0) return;
    var selected_rooms =  total_selected_room_ids
    ajax.jsonRpc("/create_partner", 'call',{
        'app_fname': $("input[name='app_fname']").val(),
        'app_email': $("input[name='app_email']").val(),
        'app_mobile': $("input[name='app_mobile']").val(),
        'app_message': $("textarea[name='app_message']").val(),
        'app_booking': $("input[name='app_booking']").val(),
        'arrival_date': $("input[name='check_IN']").val(),
        'depature_date': $("input[name='check_OUT']").val(),
        'app_adults': $("input[name='app_adults']").val(),
        'app_child': $("input[name='app_child']").val(),
        'app_ammount': $("input[name='app_ammount']").val(),
        'selected_rooms':selected_rooms,
        'app_room_type':$("input[name='app_room_type']").val(),
        'country_id' : $("select[name='country_id']").val(),
    }).then(function(data){
        $('#get_partner_data').val(data['reservation_no']);
    	$('#invoice').val(data['reservation_no']);
        $('#form_paypal').submit();
    });
});


$(document).on('click', '#wire_pay_now', function(e){
	$('#form_paypal').validator('validate');
	if ($('#form_paypal').find('.has-error:visible').size() > 0) return;
    var selected_rooms =  total_selected_room_ids;
    ajax.jsonRpc("/create_partner_1", 'call',{
        'app_fname': $("input[name='app_fname']").val(),
        'app_email': $("input[name='app_email']").val(),
        'app_mobile': $("input[name='app_mobile']").val(),
        'app_message': $("textarea[name='app_message']").val(),
        'app_booking': $("input[name='app_booking']").val(),
        'arrival_date': $("input[name='check_IN']").val(),
        'depature_date': $("input[name='check_OUT']").val(),
        'app_adults': $("input[name='app_adults']").val(),
        'app_child': $("input[name='app_child']").val(),
        'app_ammount': $("input[name='app_ammount']").val(),
        'selected_rooms':selected_rooms,
        'app_room_type':$("input[name='app_room_type']").val(),
        'country_id' : $("select[name='country_id']").val(),
    }).then(function(data){
    	$('#myModal').modal('hide');
    	$('main').fadeOut("slow", function() {
            $('main').html(data).fadeIn("slow");
        });
    });
});


$(document).on('click', '#pay_options_paypal', function(e){
	$('#wire_btn').css('display', 'none');
	$('#paypal_btn').css('display', 'block');
});
$(document).on('click', '#pay_options_wire', function(e){
	$('#paypal_btn').css('display', 'none');
	$('#wire_btn').css('display', 'block');
});

$(document).on('click', '#check_avail_room', function(e){
		$('#contactForm').validator('validate');
    	if ($('#contactForm').find('.has-error:visible').size() > 0) return;
    	ajax.jsonRpc("/check_availability", 'call',{
            'park_id' : $("#drop_hotels").val(),
            'checkin': $("input[name='checkin']").val(),
            'checkout': $("input[name='checkout']").val(),
            'rooms_guest':$("input[name='rooms_guest']").val(),
            'adult': $("select[id='adult_selectable_1']").val(),
            'child': $("select[id='child_selectable_1']").val(),
            'room_types': $("select[id='room_types']").val(),
            'totalrooms': $("input[name='totalrooms']").val(),
        }).then(function(data) {
            $('main').fadeOut("slow", function() {
                $('main').html(data).fadeIn("slow");
            });
        });
});


$( function() {
    $( ".adult_counter" ).selectable({
    	selected: function (event, ui) {
    	    if ($(ui.selected).hasClass('selectedfilter')) {
    	        $(ui.selected).removeClass('selectedfilter').removeClass('ui-selected');
    	        // do unselected stuff
    	    } else {            
    	        $(ui.selected).addClass('selectedfilter').addClass('ui-selected');
    	        // do selected stuff
    	    }
    	}
    });
    
    $( ".child_counter" ).selectable({
    	selected: function (event, ui) {
    	    if ($(ui.selected).hasClass('selectedfilter')) {
    	        $(ui.selected).removeClass('selectedfilter').removeClass('ui-selected');
    	        // do unselected stuff
    	    } else {            
    	        $(ui.selected).addClass('selectedfilter').addClass('ui-selected');
    	        // do selected stuff
    	    }
    	}
    });

    $( ".pet_counter" ).selectable({
        selected: function (event, ui) {
            if ($(ui.selected).hasClass('selectedfilter')) {
                $(ui.selected).removeClass('selectedfilter').removeClass('ui-selected');
                // do unselected stuff
            } else {            
                $(ui.selected).addClass('selectedfilter').addClass('ui-selected');
                // do selected stuff
            }
        }
    });
});

$(".adult_counter").on("click", "li", function(e){
	e.preventDefault();
    var $this = $(this);
    var child_selectable_value = $(".select_child.select").data("value") ? parseInt($(".select_child.select").data("value")) : 0;
    var adult_selectable_value =  parseInt($this.data("value"));
    var total_guest = adult_selectable_value + child_selectable_value;
    $this.addClass("select").siblings().removeClass("select");
    $("#room_guest").val(total_guest + ' guests');
})
$(".child_counter").on("click", "li", function(e){
	e.preventDefault();
    var $this = $(this);
    var adult_selectable_value  = $(".select_adult.select").data("value") ? parseInt($(".select_adult.select").data("value")) : 0;
    var child_selectable_value =  parseInt($this.data("value"));
    var total_guest = adult_selectable_value + child_selectable_value;
    $this.addClass("select").siblings().removeClass("select");
    $("#room_guest").val(total_guest + ' guests');
})
$(".pet_counter").on("click", "li", function(e){
    e.preventDefault();
    var $this = $(this);
    var adult_selectable_value  = $(".select_adult.select").data("value") ? parseInt($(".select_adult.select").data("value")) : 0;
    var child_selectable_value =  parseInt($this.data("value"));
    var total_guest = adult_selectable_value + child_selectable_value;
    $this.addClass("select").siblings().removeClass("select");
    $("#room_guest").val(total_guest + ' guests');
})

 });
