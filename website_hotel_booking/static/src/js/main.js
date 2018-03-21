 odoo.define('website_hotel_booking.website_hotel_booking', function(require) {
 	"use strict";
 	// Import requirements
 	var core = require('web.core');
 	var ajax = require('web.ajax');
 	var website = require('website.website');
 	var Dialog = require('web.Dialog');
 	var web_utils = require("web.utils")
 	var _t = core._t;
 	var time = require('web.time');
 	var Model = require('web.Model');
 	var QWeb = core.qweb;

 	$(document).ready(function() {
 		//  To get the campsite detail
 		$(document).on('click', '.campsite_details', function(e) {
 			e.preventDefault();
 			ajax.jsonRpc("/campsite_details", 'call', {
 					'campsite_id': $(this).data('room_id'),
 					'park_id': $("input[name='park_id']").val(),
 					'app_adults': $("input[name='adult']").val(),
 					'app_child': $("input[name='child']").val(),
 					'app_pets': $("input[name='pets']").val(),
 					'checkin': $("input[name='check_IN']").val(),
 					'checkout': $("input[name='check_OUT']").val(),
 					'rooms_guest': $("input[name='rooms_guest']").val(),
 					'totalrooms': $("input[name='totalrooms']").val(),
 				})
 				.then(function(data) {
 					$('main').fadeOut(300, function() {
 						$('main').html(data).fadeIn(300);
 					});
 				});
 		});

 		// After selecting the campsite, redirect to booking form
 		$(document).on('click', '.book_campsite_now', function(e) {
 			var self = this;
 			var campsite_id = $(".property_name_selected_property").data("campsite_id");
            // If user is not registered, alert to login
            if(!$("input[name='user_id']").val()){
                $('#myModal').modal('show');
                return false;
            }
 			total_selected_room_ids.push(campsite_id)
 			if (total_selected_room_ids.length != parseInt($("input[name='totalrooms']").val())) {
 				alert('Please select rooms as your need');
 				return false
 			}
 			ajax.jsonRpc("/book_now", 'call', {
 				'selected_rooms': total_selected_room_ids,
 				'app_adults': $("input[name='app_adults']").val(),
 				'app_child': $("input[name='app_child']").val(),
 				'app_pets': $("input[name='app_pets']").val(),
 				'checkin': $("input[name='check_IN']").val(),
 				'checkout': $("input[name='check_OUT']").val(),
 				'rooms_guest': $("input[name='rooms_guest']").val(),
 			}).then(function(data) {
 				if (data['select_more_rooms']) {
 					$('#room_alert').css('display', 'block');
 					return
 				}
 				$('#room_alert').css('display', 'none');
 				$('#app_ammount').val(data['total_selected_room_price']);
 				$('#total_ammount').val(data['total_selected_room_price']);
 				$('main').fadeOut(300, function() {
 					$('main').html(data).fadeIn(300);
 				});
 			});

 			// Show the rental products with quantity
 			$(document).on('click', '.rental_show', function() {
 				$(".rental_line").removeClass("hidden")
 				$(".rental_line").css("margin-top", "20px")
 				$(".rental_show").addClass("hidden")
 			})

            // To display the state accordint to Country
            $(document).on('change', '#country_id',function() {
                var filter = $(this).val();
                $("#state_id").val('');
                if(filter){
                    var count = 0
                    $('#state_id option').each(function() {
                        if ($(this).data("country_id") == filter) {
                            count++;
                            $(this).show();
                        } else {
                            $(this).hide();
                        }
                    })
                    if(count == 0){
                        $(".err_no_country").removeClass("hidden")
                        $("#state_id").prop("disabled","disabled")
                        $("#state_id").css("border-color", "#a94442")
                        $("#state_id").css("box-shadow","inset 0 1px 1px rgba(0, 0, 0, 0.075)")
                    }
                    else{
                        $(".err_no_country").addClass("hidden")
                        $("#state_id").removeProp("disabled")
                        $("#state_id").removeProp("style")
                    }
                }
                else{
                    $(".err_state").removeClass("hidden")
                    $("#state_id").prop("disabled","disabled")
                    $("#state_id").css("border-color", "#a94442")
                    $("#state_id").css("box-shadow","inset 0 1px 1px rgba(0, 0, 0, 0.075)")
                }
            })

 			// Add new rent product and quantity field
 			$(document).on('click', '#add_rent', function() {
 				if ($(".product:last").val() && $(".quantity:last").val()) {
 					var id = $(".rent_date").length + 1;
 					var options = '';
 					// Get the options of from loaded data
 					$("#product-1 option").each(function() {
 						options += "<option value='" + $(this).val() + "'>" + $(this).text() + "</option>";
 					});
 					var html = '<div class="rent_date" id="rent-' + id + '"><div class="form-group row m0 input_row col-md-5 col-sm-12 col-xs-12 mt16"><label class="control-label" for="product">Product</label><select id="product-' + id + '" name="product[]" title="Select a Product" class="form-control selectpicker picker product" data-hide-disabled="true" data-live-search="true" required="required">' + options + '</select></div><div class="form-group row m0 input_row col-md-5 col-sm-12col-xs-12 mt16"><label class="control-label" for="city">Quantity</label><input type="number" class="form-control quantity" id="quantity-' + id + '" name="quantity[]" required="required"/></div><div class="form-group row m0 input_row col-md-1 col-sm-12 col-xs-12" style="margin-top:40px"><a id="remove_rent-' + id + '" type="button" class="btn btn-danger remove_rent"><i class="fa fa-trash"></i></a></div></div>'
 					$(".rental_line").append(html);
 				} else {
 					Dialog.alert(self, _t("Please select a Product and Quantity"), {
 						title: _t('Alert'),
 					});
 					return false;
 				}
 				calculate();
 			})

 			// To remvoe a rental line
 			$(document).on('click', '.remove_rent', function() {
 				var data_id = $(this).prop("id")
 				var rent_id = data_id.split("-")[1];
 				if ($(".rent_date").length == 2) {
 					$("#remove_rent-1").removeClass("hidden")
 				}
 				if (rent_id == 1) {
 					$("#product-1").val('')
 					$("#quantity-1").val('')
 					$(".rental_line").addClass("hidden")
 					$(".rental_show").removeClass("hidden")
 					$(".product_line").addClass("hidden")
 				} else {
 					$("#rent-" + rent_id).remove()
 				}
 				calculate()
 			})

 			// To calculate and print the rental details
 			function calculate() {
 				var count = 1
 				var init_total = $("#room_price").val()
 				var total = parseFloat(init_total)
 				var arr_quantity = []
 				var temp = 0
 				$('.quantity').each(function() {
 					if ($(this).val() > 0) {
 						arr_quantity.push($(this).val())
 					}
 				})
 				$(".rent_products").html('')
 				$(".rent_quantity").html('')
 				$(".rent_total").html('')
 				$('.product :selected').each(function() {
 					var prod = $(this).val()
 					var product_price = $("#" + prod).val()
 					var quantity = arr_quantity[temp]
 					if (quantity > 0) {
 						$(".product_line").removeClass("hidden")
 						$(".rent_products").append("<p>" + $(this).html().split("-")[0] + "</p>")
 						$(".rent_quantity").append("<p><span class='pull-left'>x</span>" + quantity + "</p>")
 						$(".rent_total").append("<span class='pull-left'>=</span><p>$ " + parseFloat(product_price) * quantity + "</p>")
 						total += (parseFloat(product_price) * quantity);
 					}
 					count++
 					temp++
 				});
 				$(".total_room_price .oe_currency_value").text(total);
 				$("#total_ammount").val(total);
 			}

 			// Calculate the rental detail onchange of product
 			$(document).on('change', '.product', function() {
 				calculate();
 			})

 			// Calculate the rental detail onchange of quantity
 			$(document).on('change', '.quantity', function() {
 				calculate();
 			})

 			// Alert if user tries to enter invalud quantity
 			$(document).on('keyup', '.quantity', function() {
 				if ($(this).val() <= 0) {
 					Dialog.alert(self, _t("Please enter the valid Quantity"), {
 						title: _t('Alert'),
 					});
 					$(this).val("1");
 					return false;
 				}
 			})
 		});

 		// Go back to display all campsides
 		$(document).on('click', '.back_to_campsites', function(e) {
 			e.preventDefault();
 			ajax.jsonRpc("/check_availability", 'call', {
 				'park_id': $("input[name='park_id']").val(),
 				'checkin': $("input[name='check_IN']").val(),
 				'checkout': $("input[name='check_OUT']").val(),
 				'rooms_guest': $("input[name='rooms_guest']").val(),
 				'adult': $("input[name='app_adults']").val(),
 				'child': $("input[name='app_child']").val(),
 				'pets': $("select[name='pet_selectable_1']").val(),
 				'totalrooms': $("input[name='totalrooms']").val(),
 			}).then(function(data) {
 				$('main').fadeOut(300, function() {
 					$('main').html(data).fadeIn(300);
 				});
 			});
 		});

 		// Display wheelchair field when Need Wheelchair is true
 		$(document).on('change', '#wheelchair_bool', function(e) {
 			if ($("#wheelchair_bool").is(':checked')) {
 				$("#wheelchair").removeClass('hidden');
 			} else {
 				$("#wheelchair").addClass('hidden');
 			}
 		});

 		//  To Edit the basic detail of user from my reservation menu
 		$('.btn_basic_detail_edit').on('click', function() {
 			if ($('.txt_name')[0]) {
 				$('.txt_name')[0].readOnly = false;
 				$('.txt_name')[0].focus()
 			}
 			if ($('.txt_email')[0]) {
 				$('.txt_email')[0].readOnly = false;
 			}
 			if ($('.txt_company_name')[0]) {
 				$('.txt_company_name')[0].readOnly = false;
 			}
 			if ($('.txt_website_address')[0]) {
 				$('.txt_website_address')[0].readOnly = false;
 			}
 			if ($('.txt_phone')[0]) {
 				$('.txt_phone')[0].readOnly = false;
 			}
 			if ($('.txt_mobile')[0]) {
 				$('.txt_mobile')[0].readOnly = false;
 			}
 			if ($('.txt_city')[0]) {
 				$('.txt_city')[0].readOnly = false;
 			}
 			if ($('.txt_zip_code')[0]) {
 				$('.txt_zip_code')[0].readOnly = false;
 			}
 			if ($('.txt_s_name')[0]) {
 				$('.txt_s_name').addClass('txt_hidden')
 				$('.drop_state_dtails').removeClass('txt_hidden')
 			}
 			if ($('.txt_c_name')[0]) {
 				$('.txt_c_name').addClass('txt_hidden')
 				$('.drop_country_dtails').removeClass('txt_hidden')
 			}
 			if ($('.txt_street')[0]) {
 				$('.txt_street')[0].readOnly = false;
 			}
 			$('.profile_img').on('mouseover', function() {
 				$('.chng_profile_lbl').removeClass('txt_hidden')
 				$('.chng_profile_lbl').css('color', '#503B5A')
 				$('.profile_img').css({
 					'border': '2px solid #503B5A',
 					'opacity': '0.3'
 				})
 			})
 			$('.profile_img').on('mouseout', function() {
 				$('.chng_profile_lbl').addClass('txt_hidden')
 				$('.profile_img').css('border', 'none')
 				$('.profile_img').css('opacity', '1')
 			})
 			$('.profile_img').on('click', function() {
 				$('#profile_photo_account').click()
 			})
 			$('.chng_profile_lbl').on('click', function() {})
 			$('.btn_basic_detail_edit').addClass('txt_hidden')
 			$('.btn_basic_detail_save').removeClass('txt_hidden')
 		})

 		// To save the changes done by the user from my reservation menu
 		$('.btn_basic_detail_save').on('click', function() {
 			var img = $("#image_src").val()
 			new Model('res.partner')
 				.call("write", [
 					[parseInt($('.txt_uid').val())], {
 						name: $('.txt_name').val(),
 						phone: $('.txt_phone').val(),
 						mobile: $('.txt_mobile').val(),
 						email_from: $('.txt_email').val(),
 						street: $('.txt_street').val(),
 						company_name: $('.txt_company_name').val(),
 						city: $('.txt_city').val(),
 						zip: $('.txt_zip_code').val(),
 						state_id: parseInt($('.drop_state_dtails option:selected')[0].value),
 						country_id: parseInt($('.drop_country_dtails option:selected')[0].value),
 						website: $('.txt_website_address').val(),
 						image: img
 					}
 				])
 				.fail(function(err) {
 					Dialog.alert(self, _t("Sorry! There is some problem in Profile data. Try again!"), {
 						title: _t('Alert'),
 					});
 				})
 				.done(function() {
 					$('.txt_s_name').val($('.drop_state_dtails option:selected')[0].text)
 					$('.txt_s_id').val($('.drop_state_dtails option:selected')[0].value)
 					$('.txt_c_name').val($('.drop_country_dtails option:selected')[0].text)
 					$('.txt_c_id').val($('.drop_country_dtails option:selected')[0].value)
 					$('.btn_basic_detail_save').addClass('txt_hidden')
 					$('.btn_basic_detail_edit').removeClass('txt_hidden')
 					$('.drop_state_dtails').addClass('txt_hidden')
 					$('.txt_s_name').removeClass('txt_hidden')
 					$('.drop_country_dtails').addClass('txt_hidden')
 					$('.txt_c_name').removeClass('txt_hidden')
 					_.each($('.tbl_body').find('input'), function(ele) {
 						$(ele)[0].readOnly = true;
 					})
 					$('.profile_img').off('mouseenter');
 					$('.profile_img').off('mouseleave');
 					$('.profile_img').off('click');
 					window.location.reload();
 				});
 		})

 		// To make the states according to selected country
 		var state_options = $("select[name='state_id_dropdown']:enabled option:not(:first)");
 		$('.drop_country_dtails').on('change', function() {
 			var select = $("select[name='state_id_dropdown']");
 			state_options.detach();
 			var displayed_state = state_options.filter("[data-country_id=" + ($(this).val() || 0) + "]");
 			var nb = displayed_state.appendTo(select).show().size();
 			select.parent().toggle(nb >= 1);
 			//for displaying label of state when country have no child state
 			if (nb == 0) {
 				$('.lbl_state').addClass('txt_hidden')
 			} else {
 				$('.lbl_state').removeClass('txt_hidden')
 			}
 		})

 		//For editing profile picture
 		$('.my_img_fp').on('change', function() {
 			var file = $(this)[0].files[0];
 			var imageType = /image.*/;
 			var img = document.createElement("img");
 			img.classList.add("obj");
 			img.file = file;
 			var reader = new FileReader();
 			reader.onload = (function(aImg) {
 				return function(e) {
 					aImg.src = e.target.result;
 					$('.image_src').val((e.target.result).split(',')[1]).change();
 				};
 			})(img);
 			if (file) {
 				reader.readAsDataURL(file);
 			}
 		})
 		$('.image_src').change(function() {
 			$('.preview_image').attr('src', "data:image/png;base64," + $('.image_src').val());
 			//            $('.fileinput').text("<i class='fa-camera'/>");
 			$('.error_photo').addClass('hidden');
 			$('.error_photo_doctor').addClass('hidden');
 			$('.remove_photo').removeClass('hidden').css('width', '192px');
 			$('.remove_photo_doctor').removeClass('hidden');
 		}).change();

 		//For view record of each history
 		$('.td_b_eye').on('click', function() {
 			var self = this;
 			var ele = $($(self).parent().children('.td_b_number'))[0].textContent
 			ajax.jsonRpc('/page/page_booking_detail', 'call', {
 				'booking_no': ele
 			}).done(function(result) {
 				$('#modal_record_details').modal('show')
 				$('#service_line_record tr').has('td').remove();
 				$('#modal_record_details').find('#booking_no').val(result.booking_no)
 				$('#modal_record_details').find('#booking_date').val(result.booking_dt)
 				$('#modal_record_details').find('#booking_state').val(result.state)
 				if (result.check_in) {
 					$('.check_in').removeClass('txt_hidden')
 					$('#modal_record_details').find('#booking_check_in').val(result.check_in)
 				} else {
 					$('.check_in').addClass('txt_hidden')
 				}
 				if (result.check_out) {
 					$('.check_out').removeClass('txt_hidden')
 					$('#modal_record_details').find('#booking_check_out').val(result.check_out)
 				} else {
 					$('.check_out').addClass('txt_hidden')
 				}
 				if (result.payment_status) {
 					$('.pay_status').removeClass('txt_hidden')
 					$('#modal_record_details').find('#booking_payment_status').val(result.payment_status)
 				} else {
 					$('.pay_status').addClass('txt_hidden')
 				}
 				if (result.total_amount) {
 					$('.pay_amount').removeClass('txt_hidden')
 					$('#modal_record_details').find('#booking_total_amount').val(result.total_amount)
 				} else {
 					$('.pay_amount').addClass('txt_hidden')
 				}
 				if (result.service_lines) {
 					$('.service_detail_tbl').removeClass('txt_hidden')
 					_.each(result.service_lines, function(line) {
 						$("#service_line_record").css('display', 'block')
 						$("#service_line_record").append("<tr><td>" + line.beautician_name + "</td><td>" + line.pos_categ_name + "</td><td>" + line.serv_name + "</td><td >" + line.price_unit + "</td><td>" + line.qty + "</td><td>" + line.service_st_date + "</td><td>" + line.service_end_date + "</td></tr>")
 					})
 				} else {
 					$('.service_detail_tbl').addClass('txt_hidden')
 				}
 				//$('.service_line_record').paging({limit:5});
 			});
 		})

 		// To let the user see the detauls of the reservation
 		$('.td_m_eye').on('click', function() {
 			var self = this;
 			var ele = $($(self).parent().children('.td_m_id'))[0].textContent
 			ajax.jsonRpc('/page/page_membership_detail', 'call', {
 				'membership_line_id': ele
 			}).done(function(result) {
 				if (result) {
 					$('#modal_membership_record_details').modal('show')
 					$('#membership_line_record tr').has('td').remove();
 					$('.membership_detail_tbl').removeClass('txt_hidden')
 					_.each(result, function(line) {
 						$("#membership_line_record").append("<tr><td>" + line.s_name + "</td><td>" + line.s_start_date + "</td><td>" + line.s_end_date + "</td><td>" + line.s_total_sitting + "</td></tr>")
 					})
 				}
 			})
 		});
 	})


 	$(document).ready(function() {

 		// Initialise the select park dropdown
 		$("#drop_hotels").select2();

 		// Hide the second sign up button on the login form
 		$($('.btn-link')[0]).hide();

 		// Fetch and print selected park details
 		ajax.jsonRpc("/park_details", 'call', {
 			'park_id': $("#drop_hotels").val()
 		}).then(function(data) {
 			$('main').find('.dynamic_park_info').fadeOut("slow", function() {
 				$('main').find('.dynamic_park_info').html(data).fadeIn("slow");
 			});
 		});

 		// Fetch the park details of selected park from dropdown
 		$("#drop_hotels").change(function() {
 			ajax.jsonRpc("/park_details", 'call', {
 				'park_id': $(this).val()
 			}).then(function(data) {
 				$('main').find('.dynamic_park_info').fadeOut("slow", function() {
 					$('main').find('.dynamic_park_info').html(data).fadeIn("slow");
 				});
 			});
 		});

 		// To count the total number guests and pets in reservation page
 		$(document).on('change', '.select_count', function(e) {
 			var sum = 0;
 			var pets = 0;
 			var count_no_room = $('#mytbody').children('tr').length;
 			count_no_room
 			$("input[name='totalrooms']").val(count_no_room);
 			$('.adult_counter :selected').each(function() {
 				sum += Number($(this).val());
 			});
 			$('.child_counter :selected').each(function() {
 				sum += Number($(this).val());
 			});
 			$('.pet_counter :selected').each(function() {
 				pets += Number($(this).val());
 			});
 			$("#pets").val(pets)
 			$("#room_guest").val(count_no_room + ' Campsites, ' + sum + ' Guests, ' + pets + ' Pets');
 		});

 		// For Terms and Conditions checkbox styles in campsites page
 		$(document).on('click', '.mobileSelect-control', function(e) {
 			$(this).toggleClass("selected");
 			if ($('.mobileSelect-control').hasClass("selected")) {
 				$(".tnc_link").css("color", "#fff");
 				$("#btn_select_room").removeClass('custom_btn_disable');
 			} else {
 				$(".tnc_link").removeAttr("style");
 				$("#btn_select_room").addClass('custom_btn_disable');
 			};
 		});

        // To give the dropdown effects of rooms
        $(".dropdown_room").hover(
 			function() {
 				$('.dropdown-menu', this).not('.in .dropdown-menu').stop(true, true).slideDown("400");
 				$(this).toggleClass('open');
 			},
 			function() {
 				$('.dropdown-menu', this).not('.in .dropdown-menu').stop(true, true).slideUp("400");
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
        // To make sign-up login field email
 		$(".oe_signup_form input[id='login']").prop("type", "email");

 		$("#btn_select_room").addClass('custom_btn_disable');
 		var counter = 1;

        // To add a new campsite in reservation page
 		$("#add_room").on("click", function() {
 			counter = $('#myTable tr').length - 1;
 			var newRow = $("<tr>");
 			var cols = "";

 			cols += '<td class="font_18">Campsite ' + counter + '</td>';
 			cols += '<td><div class="col-md-12 col-sm-8"><select class="adult_counter adult_select_box select_count" id="adult_selectable_' + counter + '"><option name="adult_zero_' + counter + '" class="btn_adult btn-lg btn-link select_adult" value="0">0 Adult</option><option name="adult_one_' + counter + '" class="btn_adult btn-lg btn-link select_adult" value="1">1</option><option name="adult_two_' + counter + '" class="btn_adult btn-lg btn-link select_adult" value="2">2</option><option name="adult_three_' + counter + '" class="btn_adult btn-lg btn-link select_adult" value="3">3</option><option name="adult_four_' + counter + '" class="btn_adult btn-lg btn-link select_adult" value="4">4</option><option name="adult_five_' + counter + '" class="btn_adult btn-lg btn-link select_adult" value="5">5</option><option name="adult_six_' + counter + '" class="btn_adult btn-lg btn-link select_adult" value="6">6</option></select></div></td>'
 			cols += '<td><div class="col-md-12 col-sm-8"><select class="child_counter child_select_box select_count" id="child_selectable_' + counter + '"><option name="child_zero_' + counter + '" class="btn_adult btn-lg btn-link" value="0">0 Children</option><option name="child_one_' + counter + '" class="btn_adult btn-lg btn-link" value="1">1</option><option name="child_two_' + counter + '"class="btn_adult btn-lg btn-link" value="2">2</option><option name="child_three_' + counter + '"class="btn_adult btn-lg btn-link" value="3">3</option><option name="child_four_' + counter + '"class="btn_adult btn-lg btn-link" value="4">4</option></select></div></td>'
 			cols += '<td><div class="col-md-12 col-sm-8"><select class="pet_counter pet_select_box select_count" id="pet_selectable_' + counter + '"><option name="pet_zero_' + counter + '" class="btn_adult btn-lg btn-link" value="0">0 Pets</option><option name="pet_one_' + counter + '" class="btn_adult btn-lg btn-link" value="1">1</option><option name="pet_two_' + counter + '"class="btn_adult btn-lg btn-link" value="2">2</option><option name="pet_three_' + counter + '"class="btn_adult btn-lg btn-link" value="3">3</option><option name="pet_four_' + counter + '"class="btn_adult btn-lg btn-link" value="4">4</option></select></div></td>'
 			cols += '<td><button type="button" class="button-custom fa fa-trash-o ibtnDel" value="Delete"></td>';
 			newRow.append(cols);
 			if (counter == 50) $('#add_room').attr('disabled', true).prop('value', "You've reached the limit");
 			$("table.order-list").append(newRow);
 			counter++;
 		});

 		$("table.order-list").on("change", 'input[name^="price"]', function(event) {
 			calculateRow($(this).closest("tr"));
 		});

        // To count the guests and pets selected by user in registration page
 		$("table.order-list").on("click", ".ibtnDel", function(event) {
 			$(this).closest("tr").remove();
 			var sum = 0;
 			var pets = 0;
 			var count_no_room = $('#mytbody').children('tr').length;
 			$("input[name='totalrooms']").val(count_no_room);
 			$('.adult_counter :selected').each(function() {
 				sum += Number($(this).val());
 			});
 			$('.child_counter :selected').each(function() {
 				sum += Number($(this).val());
 			});
 			$('.pet_counter :selected').each(function() {
 				pets += Number($(this).val());
 			});
 			$("#room_guest").val(count_no_room + ' Campsites, ' + sum + ' Guests, ' + pets + ' Pets');

 			counter -= 1
 			$('#add_room').attr('disabled', false).prop('value', "Add Row");
 		});

 		$(document).on('keyup', '.select_adult', function() { // run anytime the value changes
 			var firstValue = $(this).val();
 			$(this).parent().parent().find('.baf_ammount').val(firstValue / 2); // add them and output it
 		});

 		$('.box').hide();
 		$(".select_room_guest").click(function() {
 			$('.box').slideToggle('fast');
 		});

 		var mql = window.matchMedia("screen and (max-width: 748px)");
 		var mlq2 = window.matchMedia("screen and (max-width : 480px)");
 		var mql3 = window.matchMedia("screen and (max-width: 768px)");

 		if (mql3.matches) {
 			$('.find_rooms_form .input-group').css('width', '100%');
 			$('.input-group[class*="col-"]').css('float', 'initial');
 			$('.form_inputs .padding_3').css('padding', '');
 		}
 		if (mql.matches) {
 			$('.find_rooms_form .input-group').css('width', '100%');
 			$('.input-group[class*="col-"]').css('float', 'initial');
 			$('.form_inputs .padding_3').css('padding', '');
 		}
 		if (mlq2.matches) {
 			$('.find_rooms_form .input-group').css('width', '100%');
 			$('.input-group[class*="col-"]').css('float', 'initial');
 			$('.form_inputs .padding_3').css('padding', '');
 		}

 		var nowDate = new Date();
 		var today = new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate(), 0, 0, 0, 0);

        // Initialise the check_in input DateTimePicker
 		$('#check_in').datetimepicker({
            pickTime: false,
 			format: 'MM/DD/YYYY',
 			minDate: today,
 			showTodayButton: true,
 			showClear: true,
 			useCurrent: false,
 		});

        // Initialise the check_out DateTimePicker
 		$('#check_out').datetimepicker({
            pickTime: false,
 			format: 'MM/DD/YYYY',
 			minDate: today,
 			showTodayButton: true,
 			showClear: true,
 			useCurrent: false
 		});

        // Set check_out mindate to check_in date in registration page
 		$("#check_in").on("dp.change", function(e) {
 			$("#check_out").focus();
 			$('#check_out').data("DateTimePicker").setMinDate(e.date);
 		});

        // Set check_out maxdate to check_in maxdate
 		$("#check_out").on("dp.change", function(e) {
 			$('#check_in').data("DateTimePicker").setMaxDate(e.date);
 		});

 	});

    // responsive media quaries
 	$(window).resize(function() {
 		var mql = window.matchMedia("screen and (max-width: 748px)");
 		var mlq2 = window.matchMedia("screen and (max-width : 480px)");
 		var mql3 = window.matchMedia("screen and (max-width: 768px)");

 		if (mql3.matches) {
 			$('.find_rooms_form .input-group').css('width', '100%');
 			$('.input-group[class*="col-"]').css('float', 'initial');
 			$('.form_inputs .padding_3').css('padding', '');
 		}
 		if (mql.matches) {
 			$('.find_rooms_form .input-group').css('width', '100%');
 			$('.input-group[class*="col-"]').css('float', 'initial');
 			$('.form_inputs .padding_3').css('padding', '');
 		}
 		if (mlq2.matches) {
 			$('.find_rooms_form .input-group').css('width', '100%');
 			$('.input-group[class*="col-"]').css('float', 'initial');
 			$('.form_inputs .padding_3').css('padding', '');
 		}
 	});

    // To get the selected campsite by users
 	var total_selected_room_ids = [];
 	$(document).on('click', '.select_room', function(e) {
 		e.preventDefault();
 		e.stopPropagation();
 		var $this = $(this);
 		var room_id = $this.data('room_id');
 		if ($this.hasClass('select_object_color')) {
 			$this.removeClass('select_object_color');
 			total_selected_room_ids = jQuery.grep(total_selected_room_ids, function(value) {
 				return value != room_id;
 			});
 		} else {
 			$(this).addClass('select_object_color');
 			total_selected_room_ids.push(room_id);
 		}
 		if (total_selected_room_ids.length == parseInt($("input[name='totalrooms']").val())) {
 			var scrollBottom = $(document).height() - $(window).height() - $(window).scrollTop();
 		}
 	});

    // After selecting the campsite, redirect to booking detail page
 	$(document).on('click', '.submit_btn', function(e) {
 		if (total_selected_room_ids.length == 0) {
 			alert('Please select your Campsites!');
 			return false
 		}
 		if (total_selected_room_ids.length != parseInt($("input[name='totalrooms']").val())) {
 			alert('Please select rooms as your need');
 			return false
 		}
        if(!$("input[name='user_id']").val()){
            $('#myModal').modal('show');
            return false;
        }

 		var main = $(this).parent('div').parent('div');
 		ajax.jsonRpc("/book_now", 'call', {
 			'selected_rooms': total_selected_room_ids,
 			'app_adults': $("input[name='adult']").val(),
 			'app_child': $("input[name='child']").val(),
 			'app_pets': $("input[name='pets']").val(),
 			'checkin': $("input[name='check_IN']").val(),
 			'checkout': $("input[name='check_OUT']").val(),
 			'rooms_guest': $("input[name='rooms_guest']").val(),
 		}).then(function(data) {
 			if (data['select_more_rooms']) {
 				$('#room_alert').css('display', 'block');
 				return
 			}
 			$('#room_alert').css('display', 'none');
 			$('#app_ammount').val(data['total_selected_room_price']);
 			$('#total_ammount').val(data['total_selected_room_price']);
 			$('main').fadeOut("slow", function() {
 				$('main').html(data).fadeIn(300);
 			});
 		});
 	});

    // Book the campsite and redirect to paypal if user choose to pay with Paypal
 	$(document).on('click', '#paypal_pay_now', function(e) {
 		$('#form_paypal').validator('validate');
 		if ($('#form_paypal').find('.has-error:visible').size() > 0) return;
 		var selected_rooms = total_selected_room_ids
 		var arrival_date = $("input[name='check_IN']").val() + " 00:00:01"
 		var depature_date = $("input[name='check_OUT']").val() + " 00:00:02"
 		var wheelchair = 'False'
 		if ($("#wheelchair_bool").is(':checked')) {
 			wheelchair = 'True'
 		}
 		var products = []
 		var quantity = []
 		$('.product :selected').each(function() {
 			products.push($(this).val())
 		});
 		$('.quantity').each(function() {
 			quantity.push($(this).val())
 		});
 		if (products == []) {
 			products = 'False'
 		}
 		if (quantity == []) {
 			quantity = 'False'
 		}
 		ajax.jsonRpc("/create_partner", 'call', {
            'app_fname': $("input[name='app_fname']").val(),
 			'app_lname': $("input[name='app_lname']").val(),
 			'app_email': $("input[name='app_email']").val(),
            'app_mobile': $("input[name='app_mobile']").val(),
            'app_street': $("input[name='street_no']").val(),
            'app_city': $("input[name='city']").val(),
            'app_zip': $("input[name='zip']").val(),
            'app_state': $("select[name='state_id']").val(),
 			'app_message': $("textarea[name='app_message']").val(),
 			'app_booking': $("input[name='app_booking']").val(),
 			'arrival_date': arrival_date,
 			'depature_date': depature_date,
 			'app_adults': $("input[name='app_adults']").val(),
 			'app_child': $("input[name='app_child']").val(),
 			'app_ammount': $("input[name='app_ammount']").val(),
 			'app_pets': $("input[name='app_pets']").val(),
 			'selected_rooms': selected_rooms,
 			'is_wheel_chair': wheelchair,
 			'wheel_chair': $("input[name='wheelchair_count']").val(),
 			'app_room_type': $("input[name='app_room_type']").val(),
 			'country_id': $("select[name='country_id']").val(),
 			'product': products,
 			'quantity': quantity,
 			'partner': $("input[name='partner_id']").val(),
 		}).then(function(data) {
 			$('#get_partner_data').val(data['reservation_no']);
 			$('#invoice').val(data['reservation_no']);
 			$('#form_paypal').submit();
 		});
 	});

    // Book the campsite if user chooses to pay with Wire Transfer
 	$(document).on('click', '#wire_pay_now', function(e) {
 		$('#form_paypal').validator('validate');
 		if ($('#form_paypal').find('.has-error:visible').size() > 0) return;
 		var selected_rooms = total_selected_room_ids;
 		var arrival_date = $("input[name='check_IN']").val() + " 00:00:01"
 		var depature_date = $("input[name='check_OUT']").val() + " 00:00:02"
 		var wheelchair = 'False'
 		if ($("#wheelchair_bool").is(':checked')) {
 			wheelchair = 'True'
 		}
 		var products = []
 		var quantity = []
 		$('.product :selected').each(function() {
 			products.push($(this).val())
 		});
 		$('.quantity').each(function() {
 			quantity.push($(this).val())
 		});
 		if (products == []) {
 			products = 'False'
 		}
 		if (quantity == []) {
 			quantity = 'False'
 		}
 		ajax.jsonRpc("/create_partner_1", 'call', {
            'app_fname': $("input[name='app_fname']").val(),
 			'app_lname': $("input[name='app_lname']").val(),
 			'app_email': $("input[name='app_email']").val(),
            'app_mobile': $("input[name='app_mobile']").val(),
            'app_street': $("input[name='street_no']").val(),
            'app_city': $("input[name='city']").val(),
            'app_zip': $("input[name='zip']").val(),
            'app_state': $("select[name='state_id']").val(),
 			'app_message': $("textarea[name='app_message']").val(),
 			'app_booking': $("input[name='app_booking']").val(),
 			'arrival_date': arrival_date,
 			'depature_date': depature_date,
 			'app_adults': $("input[name='app_adults']").val(),
 			'app_child': $("input[name='app_child']").val(),
 			'app_pets': $("input[name='app_pets']").val(),
 			'app_ammount': $("input[name='app_ammount']").val(),
 			'selected_rooms': selected_rooms,
 			'is_wheel_chair': wheelchair,
 			'wheel_chair': $("input[name='wheelchair_count']").val(),
 			'app_room_type': $("input[name='app_room_type']").val(),
 			'country_id': $("select[name='country_id']").val(),
 			'product': products,
 			'quantity': quantity,
            'partner': $("input[name='partner_id']").val(),
 		}).then(function(data) {
 			$('#myModal').modal('hide');
 			$('main').fadeOut("slow", function() {
 				$('main').html(data).fadeIn("slow");
 			});
 		});
 	});

    // Disable Pay with Wire feature if user chooses Paypal
 	$(document).on('click', '#pay_options_paypal', function(e) {
 		$('#wire_btn').css('display', 'none');
 		$('#paypal_btn').css('display', 'block');
 	});

    // Disable Paypal feature if user chooses Wire Transfer
 	$(document).on('click', '#pay_options_wire', function(e) {
 		$('#paypal_btn').css('display', 'none');
 		$('#wire_btn').css('display', 'block');
 	});

    // To check if there is atleast one adult selected or not and
    // get the available campsites according to capacity
 	$(document).on('click', '#check_avail_room', function(e) {
 		var sum = 0
 		$('.adult_counter :selected').each(function() {
 			sum += Number($(this).val());
 		});
 		if (sum <= 0) {
 			Dialog.alert(self, _t("Sorry! Please select atleast one adult for Campsite!"), {
 				title: _t('Alert'),
 			});
 			return false
 		}
 		$('#contactForm').validator('validate');
 		if ($('#contactForm').find('.has-error:visible').size() > 0) return;
 		ajax.jsonRpc("/check_availability", 'call', {
 			'park_id': $("#drop_hotels").val(),
 			'checkin': $("input[name='checkin']").val(),
 			'checkout': $("input[name='checkout']").val(),
 			'rooms_guest': $("input[name='rooms_guest']").val(),
 			'adult': $("select[id='adult_selectable_1']").val(),
 			'child': $("select[id='child_selectable_1']").val(),
 			'pets': $("select[id='pet_selectable_1']").val(),
 			'room_types': $("select[id='room_types']").val(),
 			'totalrooms': $("input[name='totalrooms']").val(),
 		}).then(function(data) {
 			$('main').fadeOut(300, function() {
 				$('main').html(data).fadeIn(300);
 			});
 		});
 	});

    // Configuration of Adults, Children and Pets on reservation page
 	$(function() {
        // Adults Selector
 		$(".adult_counter").selectable({
 			selected: function(event, ui) {
 				if ($(ui.selected).hasClass('selectedfilter')) {
 					$(ui.selected).removeClass('selectedfilter').removeClass('ui-selected');
 				} else {
 					$(ui.selected).addClass('selectedfilter').addClass('ui-selected');
 				}
 			}
 		});

        // Children selector
 		$(".child_counter").selectable({
 			selected: function(event, ui) {
 				if ($(ui.selected).hasClass('selectedfilter')) {
 					$(ui.selected).removeClass('selectedfilter').removeClass('ui-selected');
 				} else {
 					$(ui.selected).addClass('selectedfilter').addClass('ui-selected');
 				}
 			}
 		});

        // Pets Selector
 		$(".pet_counter").selectable({
 			selected: function(event, ui) {
 				if ($(ui.selected).hasClass('selectedfilter')) {
 					$(ui.selected).removeClass('selectedfilter').removeClass('ui-selected');
 				} else {
 					$(ui.selected).addClass('selectedfilter').addClass('ui-selected');
 				}
 			}
 		});
 	});

    // To display the data
 	$('.td_b_eye').on('click', function() {
 		var self = this;
 		Dialog.alert(self, _t("This feature is work in progress. It will be functional very soon !"), {
 			confirm_callback: function() {
 				$('#model').modal('hide');
 			},
 			title: _t('Alert'),
 		});
 	});

    // To cancel the reservation
 	$('.cancel_reservation').on('click', function(e) {
 		e.preventDefault();
 		var target = $(e.target);
 		ajax.jsonRpc('/cancel_reservation', 'call', {
 			'reservation_no': target.parents('tr').find('.td_b_number').text()
 		}).done(function(result) {
 			if (result) {
 				Dialog.alert(self, _t("Your Reservation has been cancelled ! It's sad to see you go but Hope you will visit us soon !"), {
 					confirm_callback: function() {
 						$('#model').modal('hide');
 						window.location.reload(true);
 					},
 					title: _t('Alert'),
 				});
 			} else {
 				Dialog.confirm(self, _t(result.replace(/\s+/g, ' ')), {
 					title: _t('Alert'),
 				});
 			}
 		});
 	});

 });
