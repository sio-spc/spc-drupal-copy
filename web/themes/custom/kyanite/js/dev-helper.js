/* dev-helper.js: this file contains some helper scripts to allow a developer, such as a themer, to 
more easily see how the page would look if you weren't logged into the site.
*/ 
(function (window, $, Drupal) {
	function addAdminHelpers(){
		var $hiddenAdminMenu = null;
		var bodyClassesBefore = null;
		var bodyPaddingTopBefore = null;
		window.removeBackgroundImage = function(){  
			$('.page-background-image').remove(); 
			$('body').removeClass('has-background-image');
		}
		window.hideAdminMenu = function(){
			// sometimes it is useful to see the page without the admin menu.
			var $m = $('#toolbar-administration').detach();

			if ($m.length){
				$hiddenAdminMenu = $m;
				bodyClassesBefore = $('body').attr('class'); 
				bodyPaddingTopBefore = $('body').css('padding-top');
				$('body').removeClass("toolbar-tray-open toolbar-fixed toolbar-horizontal toolbar-vertical").css('padding-top',0).css('margin-left',0);

			}
			else{
				$hiddenAdminMenu = null;
			}
		}
		window.showAdminMenu = function(){
			if($hiddenAdminMenu && $hiddenAdminMenu.length){
				$('body').append($hiddenAdminMenu);
				$hiddenAdminMenu = null;
				if(bodyClassesBefore){
					var c = bodyClassesBefore.split(' ');
					for(var cn in c){
						cn = $.trim(cn);
						if (cn.indexOf('toolbar-') == 0) $('body').addClass(cn);
					}
				} 
				bodyClassesBefore = null;
				$('body').css('padding-top', bodyPaddingTopBefore).css('margin-left','');
			}
		}
		
		
		var $hiddenDevMarker = null;
		window.hideDevMarker = function(){
			var $m = $('#dev-marker').detach();
			if ($m.length){
				$hiddenDevMarker = $m;
			}
		}
		window.showDevMarker = function(){
			if($hiddenDevMarker){
				$('body').append($hiddenDevMarker);
			}
		}
		
		
		window.hideAdminTabs = function(){
			$('.admin-tabs,#admin-tabs,#block-kyanite-local-tasks').addClass('temp-hidden-admin-tab').hide();
		}
		window.showAdminTabs = function(){
			$('.temp-hidden-admin-tab').removeClass('temp-hidden-admin-tab').show();
		}
		
		
		
		window.hideAdminBlocks = function(){
			$('#block-menu-devel,#block-views-tags-for-this-node-block').addClass('temp-hidden-admin-block').hide();
			if ($(".region-abovefooter").children().length == $(".region-abovefooter").children(".temp-hidden-admin-block").length){
				$("#abovefooter").addClass('temp-hidden-admin-block').hide();
			}
		}
		window.showAdminBlocks = function(){
			$('.temp-hidden-admin-block').removeClass('temp-hidden-admin-block').show();
		}
		
		
		window.disableContextualLinks = function(){
			$('.contextual-region').removeClass('contextual-region').addClass('contextual-region-disabled');
			$('.contextual').addClass('temp-wrapper-disabled').css('visibility','hidden');
		}
		window.enableContextualLinks = function(){
			$('.contextual-region-disabled').removeClass('contextual-region-disabled').addClass('contextual-region');
			$('.contextual.disabled').removeClass('temp-wrapper-disabled').css('visibility','');
		}
		
		
		window.hideMessages = function(){
			$('.messages').addClass('temp-hidden-messages').hide();
		}
		window.showMessages = function(){
			$('.temp-hidden-messages').removeClass('temp-hidden-messages').show();
		}
		
		window.hideFieldCollectionLinks = function(){
			$('.field-collection-view-links,.action-links-field-collection-add,.action-links-field-collection-remove,.action-links-field-collection-delete').addClass('temp-hidden-fc-links').hide();
		}
		window.showFieldCollectionLinks = function(){
			$('.temp-hidden-fc-links').removeClass('temp-hidden-fc-links').show();
		}
		
		window.enablePublicPreview = function(){
			$('body').addClass('public-preview-enabled');
			window.hideDevMarker();
			window.hideAdminMenu();
			window.hideAdminTabs();
			window.hideMessages();
			window.hideFieldCollectionLinks();
			window.hideAdminBlocks();
			window.disableContextualLinks();
			$('body').trigger('public-preview-change').trigger('public-preview-enabled');
			$(window).resize();
		}
		window.disablePublicPreview = function(){
			$('body').removeClass('public-preview-enabled');
			window.showDevMarker();
			window.showAdminMenu();
			window.showAdminTabs();
			window.showMessages();
			window.showFieldCollectionLinks();
			window.showAdminBlocks();
			window.enableContextualLinks();
			$('body').trigger('public-preview-change').trigger('public-preview-disabled');
			$(window).resize();
		}
		window.togglePublicPreview = function(){
			
			if($('body').hasClass('public-preview-enabled')){
				window.disablePublicPreview();
			}
			else{
				window.enablePublicPreview();
			}
		}
		$(document).on("click", function(e){
			if (e.ctrlKey || e.shiftKey){
				window.togglePublicPreview();
			}
		});
	} //end addAdminHelpers

	$(function(){
		if ($("body").hasClass("page-admin")) return; 
		if ($("body").hasClass("dev-helper-js-loaded")) return;
		$("body").addClass("dev-helper-js-loaded"); // no need for once plugin depenency!

		addAdminHelpers();
		
	});
})(window, jQuery, Drupal);