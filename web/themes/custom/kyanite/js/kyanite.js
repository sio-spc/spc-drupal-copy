(function (window, $, Drupal) {
  // Custom javascript
  var consoleLogEnabled = false, allowFixedHeader = false;

  var textLengthSelectors = {
    '.views_slideshow_slide .views-field-body': {
      'classes': {
        'mediumtext': {
          'minChars': 100 //num characters at which point this class is added
        },
        'longtext': {
          'minChars': 500 //num characters at which point this class is added
        },
        'extralongtext': {
          'minChars': 1000 //num characters at which point this class is added
        }
      }
    },
    '.feature-boxes .content': {
      'classes': {
        'mediumtext': {
          'minChars': 100 //num characters at which point this class is added
        },
        'longtext': {
          'minChars': 500 //num characters at which point this class is added
        },
        'extralongtext': {
          'minChars': 1000 //num characters at which point this class is added
        }
      }
    }
  };

  function consoleLog(msg){
  	if(consoleLogEnabled && window && window.console && window.console.log) window.console.log(msg);
  }
  function resizeHeader(){
    if(!$('body:not(.divisionsite)').is('.explore-open,.explore-animating,.fixed-header-is-fixed')) {
        var newWidth = $(window).width() - $('#explore').outerWidth();
	newWidth = Math.round(newWidth);
	if(Math.abs($('body:not(.divisionsite) #header').width() - newWidth) > 10) $('body:not(.divisionsite) #header').width( newWidth );
    }
  }

  var $window = $(window);
  function isScrolledPast($elem) {
    //  returns true if you can no longer see $elem because you've scrolled past it
      return ($elem.offset().top + $elem.height()) < $('body').scrollTop();
  }
  function isScrolledIntoView($elem) {
    //  returns true if $elem is scrolled *all the way* into view...
      var docViewTop = $window.scrollTop();
      var docViewBottom = docViewTop + $window.height();

      var elemTop = $elem.offset().top;
      var elemBottom = elemTop + $elem.height();

      return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
  }
    
  $.fn.scrolledIntoView = function(){
    //answers the question if an element or a set of elements are scrolled *all the way* into view...
    var n = 0;
    this.each(function(){
      if (isScrolledIntoView($(this))) n++;
    });
    return n === $(this).length;
  }
  $.fn.scrolledPast = function(){
    //answers the question if an element or a set of elements are scrolled *all the way* into view...
    var n = 0;
    this.each(function(){
      if (isScrolledPast($(this))) n++;
    });
    return n === this.length;
  }
  function styleSearchBlockForm(context){
     $(context || 'body').find('.search-block-form').once('styleSearchBlockForm').each(function () {
      	consoleLog("styleSearchBlockForm: adding placeholder and such");

      	$(this).find('input.form-search').each(function(){
          consoleLog("lang = " + $("html").attr("lang") + ".");
          if($("html").attr("lang") == "fr"){
        		$(this).attr('placeholder','rechercher...');
          }
          else{
            $(this).attr('placeholder','search...');
          }
      	});
     });

  }



  function addOnVisibleClasses(context){
     $(context || 'body').find('.feature-boxes').once('addOnVisibleClasses').each(function(){

        var $el = $(this);
        var t = null;
        function checkOnVisible(){
          //consoleLog("checkOnVisible()");
          var vis = $el.is(":visible");
          if (vis){
            var scrolled = $el.scrolledIntoView();
            if (scrolled) {
              //consoleLog("you've scrolled to something!!");
              $el.addClass("scrolled-into-view");
              $(window).off("scroll resize orientationchange", checkOnVisible);
              clearInterval(t);
            }
          }

        }
        $(window).on("scroll resize orientationchange", checkOnVisible);
        t = setInterval(checkOnVisible, 500);

        checkOnVisible();

     });

  }
  function allowHidingStatusMessages(context){
  	$(context || 'body').find('div[role=contentinfo]').once('allowHidingStatusMessages').each(function(){
  		var $btn = $('<button type="button" class="close-button"><span class="text">Close</span><i class="fa fa-close"></i></button>');
  		$(this).append($btn);
  		$btn.click(function(){
        var $msg = $(this).closest('div[role=contentinfo]');
  			$msg.addClass("closing");
        setTimeout(function(){
            var $par = $msg.parent();
            if ($par.children().length == 1){
              $par.slideUp("fast");
            }
            else {
              $msg.hide("fast");
            }
        }, 1000);
  		});
  	});
  }

  function addTextLengthClasses(context){
    //adds classes to indicate whether an element has a certain lenght of text
    for(var sel in textLengthSelectors){
      var settings = textLengthSelectors[sel]
      $(context || 'body').find(sel).once('addTextLengthClasses').each(function(){
        var $field = $(this);
        var txt = $field.text();
        var numChars = txt.length;
        for (var cssClass in settings.classes){
          var classSettings = settings.classes[cssClass];
          if (!isNaN(classSettings.minChars) && isNaN(classSettings.maxChars)){
            if (numChars >= classSettings.minChars){
              $field.addClass(cssClass);
            }
          }
          if (!isNaN(classSettings.maxChars) && isNaN(classSettings.minChars)){
            if (numChars <= classSettings.maxChars){
              $field.addClass(cssClass);
            }
          }
          if (!isNaN(classSettings.maxChars) && !isNaN(classSettings.minChars)){
            if (numChars <= classSettings.maxChars && numChars >= classSettings.minChars){
              $field.addClass(cssClass);
            }
          }
        }
      });

    }
    var fieldSelector = '.views_slideshow_slide .views-field-body'; //add more as needed
    var medium = 100;
  }
  function addWrapperForSlideBodyNode(context){
    //this allows the CSS to vertically center the overlay text
    $(context || 'body').find('.views_slideshow_slide .views-field-body:not(.has-content-wrapper)').each(function(){
      $(this).addClass('has-content-wrapper');
      $(this).children('.field-content').wrapInner('<div class="content-wrapper" />');
    });
  }

  function snapFooterToBottom(){
    var $main = $('main[role=main]').css('min-height',0);
   // var lastMinHeight = $main.data('lastMinHeight');
    var $footer = $('footer.site-footer');
    var $body = $('body');
    var bodyScrollHeight = $body[0].scrollHeight;
    var mainOffset = $main.offset();
    var footerHeight = $footer.outerHeight() || 0;

    if (mainOffset){
        if (isNaN(footerHeight)) footerHeight = 0;
        //var bodyMarginTop = parseFloat($('body').css('margin-top'));
        //if (isNaN(bodyMarginTop)) bodyMarginTop = 0;
        var newMinHeight = bodyScrollHeight - Math.floor(mainOffset.top) - Math.floor(footerHeight) - 2;
        
        //if (!lastMinHeight || newMinHeight != lastMinHeight){
          $main.css('min-height', newMinHeight);
          //$main.data("lastMinHeight", newMinHeight);
        //}
    }
  }

  function startSnappingFooterToBottom(){
  	//css based approach only works if you restructure the site, and know the height of the footer...
  	setInterval(snapFooterToBottom, 1000);
	   $(window).on("resize orientationchange", snapFooterToBottom);
     $('body').on('public-preview-change', snapFooterToBottom);
  	$(document).off('ready', startSnappingFooterToBottom);
  }
  function openExploreMenu(){
  	 $('body').removeClass('explore-closed').addClass('explore-open');
     onSecondaryMenuAnimationStart();
  }
  function closeExploreMenu(){
    $('body').removeClass('explore-open').addClass('explore-closed');
    onSecondaryMenuAnimationStart();
  }
  var animatingTimer1 = null;
  var animatingTimer2 = null;
  function onSecondaryMenuAnimationStart(){
    clearTimeout(animatingTimer1);
    clearTimeout(animatingTimer2);
    $('body').removeClass('explore-animating explore-animating-first-half explore-animating-second-half');
    $('body').addClass('explore-animating explore-animating-first-half');
    var dur = 1000; //maybe we should verify the total animation time...

     animatingTimer1 = setTimeout(function(){
        $('body').removeClass('explore-animating-first-half').addClass('explore-animating-second-half');
     }, dur/2);
     animatingTimer2 = setTimeout(function(){
        $('body').removeClass('explore-animating explore-animating-first-half explore-animating-second-half');
	$(window).trigger('explore-animation-complete').trigger('explore-' + ($('body').is('.explore-open') ? 'opened' : 'closed'));
     }, dur);

  }
  function toggleExploreMenu(){
  	if($('body').is('.explore-closed')){
  		openExploreMenu();
  	}
  	else {
  		closeExploreMenu();
  	}
  }
  function initGlobalEventListeners(){
  	$(document).on('click', '.explore-button', function(e){
  		toggleExploreMenu();
      setTimeout(function(){
        $('.explore-button').blur();
      }, 1);
  		return false;
  	});
    $(document).on('mouseenter', '.layout-secondary-menu', function(){
      $('body').addClass('explore-hover');
    });
    $(document).on('mouseleave', '.layout-secondary-menu',  function(){
      $('body').removeClass('explore-hover');
    });

  	//$(document).on('ready', startSnappingFooterToBottom);

  }
  var $slideshows = null;


  
    /* let's close the Explore menu if the user clicks outside it: */
    $(document).mouseup(function (e){
      if($('body').is('.explore-open')){
        var container = $("#explore");

        if (!container.is(e.target) // if the target of the click isn't the container...
            && container.has(e.target).length === 0) // ... nor a descendant of the container
        {
            closeExploreMenu();
        }
      }
    });
  




  function fixViewsSlideshowHeightNow(){
    if (!$slideshows) $slideshows = $('.views_slideshow_main');
    $slideshows.each(function(){
        var $slideshow = $(this);
        if($slideshow.scrolledPast()) {
         // consoleLog("slideshow is hidden from view because you've scrolled past it... no height adjustment needed...");
        }
        else {
         // consoleLog("slideshow is visible?");
          // Let's prevent resizing the slideshow if you're scrolled below the slideshow 
          // otherwise the screen will go up and down for no apparent reason
          // ideally, we'd stop the slideshow in these cases, but I'm trying to avoid hacking into
          // the cycle 1 API.
          var height = $slideshow.find('.views_slideshow_slide img:visible:first').height();
          $slideshow.find('.views_slideshow_slide, .views_slideshow_cycle_teaser_section')
            .css('transition','min-height 0.5s') //prevent jumpiness when the height changes...
            .css("min-height",height);
        }
    });
  }

  function fixViewsSlideshowHeightSoon(){
    setTimeout(fixViewsSlideshowHeightNow, 100);
  }
  function startFixingViewsSlideshowHeight(){ 
    //first, deregister so this doesn't get reinitialized when ajax comes in
    $(document).off("ready", startFixingViewsSlideshowHeight);
    //next, let's check to see if there really are any slideshows
     $slideshows = $('.views_slideshow_main');
    if (!$slideshows.length) {
      return; //abort, no slideshows to fix.
    }
    setInterval(fixViewsSlideshowHeightNow, 500);
    fixViewsSlideshowHeightNow();
    $(document).ajaxComplete(fixViewsSlideshowHeightSoon);
    $(window).on("load resize orientationchange scroll", fixViewsSlideshowHeightSoon);

  }
  function fixViewsSlideshowHeight(){
    //with CSS we have done a bunch of stuff to get this cycle v1 slideshow to be responsive
    // however, since the images are all absolutely positioned, and with CSS we're overriding
    // the inline styles that set the height, we'll need to detect the height of the active image at all times...
   
    $(document).on("ready", startFixingViewsSlideshowHeight);
  }


  var detectScrollPositionOnScrollTimer = null;
  function getContentHeight(){
      return $('.layout-breadcrumb').height()
         + $('.layout-highlighted').height()
          + $('.layout-highlighted2').height() 
          + $('.layout-content').height() 
          + $('.site-footer').height()
          + $('.field-field-featured-image').height()
          + $('.field-field-newsimage').height() ;
  }
  function detectScrollPosition(){
    var $siteFooter = $('footer.site-footer');
    var $body = $('body');
    var $window = $(window);
    var $document = $(document);
    var $layoutPrimaryMenu = $('.layout-primary-menu');
    var layoutPrimaryMenuFullHeight = null;
    var shrinkHeaderHeightFactor = 1.2; //shrink the header only if the height of all non-header content is greater than this factor times the window height.

    var detectScrollPositionOnScroll = function() {
      if (layoutPrimaryMenuFullHeight === null) {
        layoutPrimaryMenuFullHeight = $layoutPrimaryMenu.outerHeight(); //we capture this once, because it otherwise shrinks down later on, giving a wrong impression of how far you have to scroll down
      }
      var scrollTop = $window.scrollTop();
      var scrolledToTop = isNaN(layoutPrimaryMenuFullHeight) ? scrollTop < layoutPrimaryMenuFullHeight : scrollTop == 0;
      if (scrolledToTop){
        $body.removeClass('scrolled-down');
        $body.removeClass('footer-is-visible');
      }
      else {
        if (getContentHeight() > $(window).height() * shrinkHeaderHeightFactor){
          $body.addClass('scrolled-down');
        }
        else {
          $body.removeClass('scrolled-down');
        }

        var scrollHeight = $document.height();
        var scrollPosition = $window.height() + scrollTop;
        var numberOfPixelsFromBottomToConsiderTheBottom = 2;
        if (Math.abs(scrollHeight - scrollPosition) / numberOfPixelsFromBottomToConsiderTheBottom <= 2) {
            $body.addClass('scrolled-to-bottom');
        }else {
            $body.removeClass('scrolled-to-bottom');
        }
        if ($siteFooter.scrolledIntoView()){
          $body.addClass('footer-is-visible');
        }else{
          $body.removeClass('footer-is-visible');
        }
      }
/*
      if ($layoutPrimaryMenu.length){
        $body.removeClass('fixed-menu');
        var layoutPrimaryMenuOffset = $layoutPrimaryMenu.offset();
        if (scrollTop >= layoutPrimaryMenuOffset.top){
          $body.addClass('fixed-menu');
        }
        else {
          $body.removeClass('fixed-menu');
        }
      }
*/
    }

    $window.on("scroll", function(){
      clearTimeout(detectScrollPositionOnScrollTimer);
      setTimeout(detectScrollPositionOnScroll, 100);
    });
  }


  function setScrollingDisabledIfExploreMenuIsOpen(){

    // left: 37, up: 38, right: 39, down: 40,
    // spacebar: 32, pageup: 33, pagedown: 34, end: 35, home: 36
    var keys = {37: 1, 38: 1, 39: 1, 40: 1};
    var $explore = $('#explore');
    var defaultDelta = 40;
    var $body = $('body');

    function getScrollingAllowedSel(){
      if ($explore.css('overflow') === 'auto') return '#explore';
      if ($('.layout-secondary-menu').css('overflow') === 'auto') return '.layout-secondary-menu';
      return null;
    }


    function isScrollingUp(e){
      if (e.type == 'keydown'){
        return e.key === "ArrowUp";
      }
      switch(e.originalEvent.type){
        case 'DOMMouseScroll':
           if(e.originalEvent.detail > 0) {
               //scroll down
               return false;
           }else {
               //scroll up
               return true;
           }
          break;
        default: 
           if(e.originalEvent.wheelDelta < 0) {
               //scroll down
               return false;
           }else {
               //scroll up
               return true;
           }
          break;
      }
    }
    function getDelta(e){
      if (e.originalEvent.type === 'DOMMouseScroll') return Math.abs(e.originalEvent.detail * 12);
      if(typeof e.originalEvent.deltaY === "number") return Math.abs(e.originalEvent.deltaY);
      if(typeof e.originalEvent.wheelDelta === "number") return Math.abs(e.originalEvent.wheelDelta/40);
      consoleLog("Using default delta for event:");
      consoleLog(e);
      return defaultDelta;
    }
    function exploreMenuIsOpen(){
      return $body.hasClass('explore-open');
    }
    function exploreMenuIsOpening(){
      return $body.is('.explore-open.explore-animating');
    }
    function exploreIsFullWidth(){
      return Math.abs($explore.width() - $(window).width()) < 1;
    }
    function preventDefault(e) {
      var isOpen = exploreMenuIsOpen();
      var isOpening = exploreMenuIsOpening();
      if (!(isOpen || isOpening)) return; //scroll normally

      if(exploreIsFullWidth()) return; //if this is true, then you might as well allow scrolling because it should only be scrolling the page
      if(isOpening){
        consoleLog("EXPLORE MENU IS OPENING - PREVENT SCROLLING ENTIRELY");
      }
      var $target = $(e.target);

      //var allowScrolling = false;
      var scrollingAllowedSel = getScrollingAllowedSel();
      if (scrollingAllowedSel){ //should be null when animating
        
          var $scrollingAllowedEl = $(scrollingAllowedSel).first();
          var scrollTop = Math.floor($scrollingAllowedEl.scrollTop());
          var innerHeight = Math.floor($scrollingAllowedEl.innerHeight());
          var scrollHeight = Math.floor($scrollingAllowedEl.prop('scrollHeight'));
          var maxScrollTop = scrollHeight - innerHeight;
          var isKeyboardEvent = e.type == 'keydown';
          var scrollAmount = getDelta(e);


          if (isScrollingUp(e)){
            $scrollingAllowedEl.scrollTop(Math.max(scrollTop - scrollAmount, 0));
          }
          else {
            $scrollingAllowedEl.scrollTop(Math.min(scrollTop + scrollAmount, maxScrollTop));
          }
        }
        else {
          if (!isOpening){
            return; //don't prevent anything -- this could be mobile?
          }
        }
        consoleLog("setScrollingDisabledIfExploreMenuIsOpen: scrolling is not allowed e.target.id=" + e.target.id);
        consoleLog(e);
        if (e.preventDefault) e.preventDefault();
        e.returnValue = false;  
        return true;  // return true if default must be prevented.
    }

    function preventDefaultForScrollKeys(e) {
        if (keys[e.keyCode]) {
            if (preventDefault(e)) return false;
        }
    }

  


  }

  function safeClone(el){
    var $clone = $(el).clone();
   $clone.find('[id]').add($clone).each(function(){
     var  id = $(this).attr('id');
     var n = 0;
     while($('#' + id + '_clone_' + n).length){
	n++;
     }
     $(this).attr('id', id + '_clone_' + n);
   });
   return $clone;
  }
  function fixLanguageSwitcherLinksForMap(){
   if($('#plethora-map').length){
    $('.langswitcherblock .links li:not(.is-active) a').each(function(){
     switch($(this).attr('hreflang')){
       case "fr":
           $(this).attr('href', '/fr/nos-membres');
           break;
       case "en":
           $(this).attr('href', '/our-members');
           break;
     }
   });
  }
  }
  function addElementsToExplore(){
    $('.langswitcherblock').not('.has-clone').each(function(){
       var $cloned = safeClone(this);
       $(this).addClass('has-clone');
       var funcName = $(this).is('.langswitcherblock') ? 'prepend' : 'append';
       $('#explore .layout-secondary-menu')[funcName]($cloned);
    });
    if(!$('.langswitcherblock').length){
    	//apparently the language switcher gets injected into the DOM... don't know when this happens so we'll have to detect it...
    	setTimeout(addElementsToExplore, 1000);
    }
  }
  function initGlobal(){
  	if (window.initGlobalComplete) return; //make sure this only happens once
  	window.initGlobalComplete = true;	 
  	initGlobalEventListeners();
  	adjustForAdminBar();
    fixViewsSlideshowHeight();
    detectScrollPosition();
    registerGlobalAPI();
    setScrollingDisabledIfExploreMenuIsOpen();
    setInterval(resizeHeader, 1000);
    $(window).on('resize orientationchange load explore-closed', resizeHeader);
    if($('#plethora-map').length) $(window).on('load', fixLanguageSwitcherLinksForMap);
    addElementsToExplore();
    $('.layout-secondary-menu, #explore, .explore-button').bind('touchstart touchend', function(e) {
        $(this).toggleClass('touching');
    });
  }
  var currentColorScheme = '';
  function getColorScheme(){
    return currentColorScheme || 'light';
  }
  function setColorScheme (colorScheme){
    var $body = $('body');
    var classes = $body.attr('class').split(' ');
    var newClasses = [];
    currentColorScheme = colorScheme;
    for(var i=0; i<classes.length; i++){
      var c = $.trim(classes[i]);
      if (c.indexOf('color-scheme-') == 0){
        $body.removeClass(c);
      }
    }
    if (colorScheme){
      $body.addClass('color-scheme-' + colorScheme);
    }

  }
  function removeBackgroundImage(speed){  
    pageBackgroundImage = null;
    if (speed === null || typeof speed === "undefined"){
      speed = "slow";
    }
    $('.page-background-image').stop().fadeOut("slow", function(){
      $('.page-background-image').remove(); 
      $('body').removeClass('has-background-image');
    });
  }
  var preloadImagesEnabled  = true;
  function preloadImage(src, onLoad){
    if (!preloadImagesEnabled){
      onLoad();
      return;
    }

    var $preloader = $('<img />');
    $preloader.on("load", onLoad);
    $preloader.attr("src", src);
  }
  function removeContentOverlay(){
    $('.layout-container').css('background-color', '');
  }
  function setContentOverlay(color){
    if (!color){
      removeContentOverlay();
      return;
    }
    $('.layout-container').css('background-color', color);
  }
  var pageBackgroundImage = null;
  function setBackgroundImage(backgroundImage, speed){
    if (pageBackgroundImage === backgroundImage) return;
    if (!backgroundImage){
      removeBackgroundImage(speed);
      return;
    }  
    console.log("setBackgroundImage: "  + backgroundImage + ", pageBackgroundImage was " + pageBackgroundImage);
    pageBackgroundImage = backgroundImage;

    if (speed === null || typeof speed === "undefined"){
      speed = "slow";
    }
    /*switch(speed){
      case "fast":
        speed = 200;
        break;
      case "normal":
        speed = 400;
        break;
      case "slow":
        speed = 600;
        break;
    }*/
    var $allWrappers = $('.page-background-image').stop(); //stop previous animations.
    var $wrapper = $allWrappers.first();
    var newBackgroundImageCSS = 'url("' + backgroundImage + '")';
    if (!$wrapper.length){
      preloadImage(backgroundImage, function(){
        $wrapper = $('<div class="page-background-image trans-in" ></div>');
        $('body').append($wrapper);
        $('body').addClass('has-background-image');
        $wrapper.css("background-image", newBackgroundImageCSS);
        setTimeout(function(){
            $wrapper.removeClass("trans-in");
          }, 1);
        $wrapper.fadeOut(0).stop(true, true).fadeIn(speed);
      });

    }
    else {
      consoleLog("newBackgroundImageCSS: " + newBackgroundImageCSS);
      consoleLog('$wrapper.css("background-image"): ' + $wrapper.css("background-image"));
      if ($wrapper.css("background-image") == newBackgroundImageCSS){
        return; //nothing to do... this is already the background image.
      }
      if ($('body').addClass('has-background-image')){
        preloadImage(backgroundImage, function(){
            var $wrapper2 = $('<div class="page-background-image trans-in" ></div>');
            var $preloader = $('<img />');
            $wrapper2.insertBefore($wrapper);
            $wrapper2.css("z-index", parseInt($wrapper.css("z-index")) - 1);
            $wrapper2.css("background-image", newBackgroundImageCSS);
            setTimeout(function(){
                $wrapper2.removeClass("trans-in");
              }, 1);
            $wrapper.addClass("trans-out").fadeOut(speed, function(){
                $wrapper.remove();
                $wrapper2.css("z-index","");
            });
        });



      }
      else {
        $('body').addClass('has-background-image');
        preloadImage(backgroundImage, function(){
          $('body').append($wrapper);
          $('body').addClass('has-background-image');
          $wrapper.css("background-image", newBackgroundImageCSS).addClass("trans-in");
          setTimeout(function(){
              $wrapper.removeClass("trans-in");
            }, 1);
          $wrapper.fadeOut(0).stop(true, true).fadeIn(speed);
        });
      }
    }
  }
  function showPage(speed){
    consoleLog("showPage(" + speed + ")");
    if (speed === null || typeof speed === "undefined"){
      speed = "fast";
    }
    $('main[role=main]').animate({"opacity": 1}, speed, function(){
      $(this).css("opacity","");
    });
  }
  function  hidePage(speed){
    consoleLog("hidePage(" + speed + ")");
    if (speed === null || typeof speed === "undefined"){
      speed = "fast";
    }
    $('main[role=main]').animate({"opacity": 0}, speed);
  }


  var topicsIntroTextSelector = '#block-introtextforpublications'; //would be nice to make a single class for this, instead of relying on ids... do we have block class?
  function showTopicsIntroText(speed){
    consoleLog("showTopicsIntroText(" + speed + ")");
    if (speed === null || typeof speed === "undefined"){
      speed = "fast";
    }
    $(topicsIntroTextSelector).slideDown(speed);
  }
  function  hideTopicsIntroText(speed){
    consoleLog("hideTopicsIntroText(" + speed + ")");
    if (speed === null || typeof speed === "undefined"){
      speed = "fast";
    }
    $(topicsIntroTextSelector).slideUp(speed);
  }

  var bannerSelector = '.kyanite-banner-block';
  function showBanner(speed){
    consoleLog("showBanner(" + speed + ")");
    if (speed === null || typeof speed === "undefined"){
      speed = "fast";
    }
    $(bannerSelector).slideDown(speed);
  }
  function  hideBanner(speed){
    consoleLog("hideBanner(" + speed + ")");
    if (speed === null || typeof speed === "undefined"){
      speed = "fast";
    }
    $(bannerSelector).slideUp(speed);
  }
  function headerIsPermanentlyFixed(){
    return $('body').hasClass('fixed-header');
  }
  function fixHeader(){
    // 'permanently' have the fixed header, saves some space...
    consoleLog('kyanite.js: fixHeader()');
    if (!headerIsPermanentlyFixed()){
      $('body').addClass('fixed-header');
      $(window).scroll().resize();
    }
  }
  function unfixHeader(){
    consoleLog('kyanite.js: unfixHeader()');
    // regular header, fixed only when scrolled down
    if (headerIsPermanentlyFixed()){
      $('body').removeClass('fixed-header');
      $(window).scroll().resize();
    }
  }
  function registerGlobalAPI(){
    this.kyanite = {
      setColorScheme: setColorScheme, 
      getColorScheme: getColorScheme,
      setBackgroundImage: setBackgroundImage,
      setContentOverlay: setContentOverlay,
      showPage: showPage,
      hidePage: hidePage,
      showBanner: showBanner,
      hideBanner: hideBanner,
      showTopicsIntroText: showTopicsIntroText,
      hideTopicsIntroText: hideTopicsIntroText,
      fixHeader: fixHeader,
      unfixHeader: unfixHeader
    };
  }
  function adjustForAdminBarNow(){
  	$('#explore').css('margin-top', $('body').css('padding-top'));

    //$('#explore').css('margin-top', $('#toolbar-item-administration-tray').height() || 0);
  }
  function adjustForAdminBar(){
  	var $t = $('#toolbar-administration');
  	if (!$t.length) return;
  	adjustForAdminBarNow();
  	setInterval(adjustForAdminBarNow, 100);
  }

  function newsFilterTweaks(){//News page Title filter was not autosubmitting ... this ensures that it does:
    var delay = (function(){
      var timer = 0;
      return function(callback, ms){
      clearTimeout (timer);
      timer = setTimeout(callback, ms);
     };
    })();

    $("#views-exposed-form-news-page input.form-text").keyup(function() {
      delay(function(){
        //$("#views-exposed-form-news-page .form-submit").click();
        $("#views-exposed-form-news-page .form-submit").click();
      }, 1000 );

    });

    var titleinput=$("#views-exposed-form-news-page .form-item-combine label").text();//replace [view-class] with the class of your view
    titleinput=titleinput.replace(/ +(?= )/g,'');//for some reason there are some multiple spaces in the label text that need to be cleaned
    $("#views-exposed-form-news-page input.form-text").attr("placeholder",titleinput);
    //$("#views-exposed-form-news-page select[data-drupal-selector='edit-field-policy-initiatives-target-id'] option[value='All']").text($("#views-exposed-form-news-page .form-item-field-policy-initiatives-target-id label").text());
    //$("#views-exposed-form-news-page select[data-drupal-selector='edit-field-region-target-id'] option[value='All']").text($("#views-exposed-form-news-page .form-item-field-region-target-id label").text());
  }
  function blogFilterTweaks(){//Title filter was not autosubmitting ... this ensures that it does:
    var delay = (function(){
      var timer = 0;
      return function(callback, ms){
      clearTimeout (timer);
      timer = setTimeout(callback, ms);
     };
    })();

    $("#views-exposed-form-blog-page input.form-text, #views-exposed-form-ed-blog-page input.form-text").keyup(function() {
      delay(function(){
        //$("#views-exposed-form-news-page .form-submit").click();
        $("#views-exposed-form-blog-page .form-submit, #views-exposed-form-ed-blog-page .form-submit").click();
      }, 1000 );

    });

    var titleinput=$("#views-exposed-form-blog-page .form-item-combine label, #views-exposed-form-ed-blog-page .form-item-combine label").text();//replace [view-class] with the class of your view
    titleinput=titleinput.replace(/ +(?= )/g,'');//for some reason there are some multiple spaces in the label text that need to be cleaned
    $("#views-exposed-form-blog-page input.form-text, #views-exposed-form-ed-blog-page input.form-text").attr("placeholder",titleinput);
  }

  function eventCardTweaks(){
    consoleLog("function eventCardTweaks");
    $(".events.cards .field-field-end-date").each(function(){
      //var enddate = $(this).text();
      $(this).hide();
      consoleLog("event line 699");
      if($(this).find("time").attr("datetime") > $(this).siblings(".field-field-event-date").find("time").attr("datetime")){
        var startdate = $(this).siblings(".field-field-event-date").text();
        var enddate = $(this).text();
        consoleLog("startdate: " + startdate);
        consoleLog("enddate: " + enddate);

        startdateyear = startdate.split(",");
        startdatebeforecomma = startdateyear[0].trim();
        startdateyear = startdateyear[1].trim();

        enddateyear = enddate.split(",");
        enddatebeforecomma = enddateyear[0].trim();
        enddateyear = enddateyear[1].trim();

        consoleLog("startdateyear: " + startdateyear);
        consoleLog("startdate before comma: " + startdatebeforecomma);
        consoleLog("enddateyear: " + enddateyear);
        if(startdateyear == enddateyear){//start and end are same year, exploded at comma (e.g. September 9th, 1977)
          $(this).siblings(".field-field-event-date").text(startdatebeforecomma + " - " + enddatebeforecomma + ", " + startdateyear);
        }
        else{
          $(this).siblings(".field-field-event-date").text($(this).siblings(".field-field-event-date").text() + " - " + $(this).text());
        }
      }
    });
    $(".events.cards h3").remove();//remove grouped field headings... so do not use h3 in the view fields/display!!
    if($(".events.cards .kyanite-views-rows").length == 0){
      $(".events.cards .views-row").wrapAll("<div class='kyanite-views-rows'></div>");
    }
    
    //cards();
  }

  function eventsFilterTweaks(){//News page Title filter was not autosubmitting ... this ensures that it does:
    var delay = (function(){
      var timer = 0;
      return function(callback, ms){
      clearTimeout (timer);
      timer = setTimeout(callback, ms);
     };
    })();

    $("#views-exposed-form-kyanite-events-page-1 input.form-text, #views-exposed-form-kyanite-events-past input.form-text").keyup(function() {
      delay(function(){
        //$("#views-exposed-form-news-page .form-submit").click();
        $("#views-exposed-form-kyanite-events-page-1 .form-submit, #views-exposed-form-kyanite-events-past .form-submit").click();
      }, 1000 );

    });

    var titleinput=$("#views-exposed-form-kyanite-events-page-1 .form-item-combine label, #views-exposed-form-kyanite-events-past .form-item-combine label").text();//replace [view-class] with the class of your view
    titleinput=titleinput.replace(/ +(?= )/g,'');//for some reason there are some multiple spaces in the label text that need to be cleaned
    $("#views-exposed-form-kyanite-events-page-1 input.form-text, #views-exposed-form-kyanite-events-past input.form-text, .form-item-combine label input.form-text").attr("placeholder",titleinput);
  }

  function speechesFilterTweaks(){//News page Title filter was not autosubmitting ... this ensures that it does:
    var delay = (function(){
      var timer = 0;
      return function(callback, ms){
      clearTimeout (timer);
      timer = setTimeout(callback, ms);
     };
    })();

    $("#views-exposed-form-speeches-page input.form-text").keyup(function() {
      delay(function(){
        //$("#views-exposed-form-news-page .form-submit").click();
        $("#views-exposed-form-speeches-page .form-submit").click();
      }, 1000 );

    });

    var titleinput=$("#views-exposed-form-speeches-page .form-item-combine label").text();//replace [view-class] with the class of your view
    titleinput=titleinput.replace(/ +(?= )/g,'');//for some reason there are some multiple spaces in the label text that need to be cleaned
    $("#views-exposed-form-speeches-page input.form-text").attr("placeholder",titleinput);
  }

  function landingPageHeights(){
    $(".field-field-landing-page-items-upcomin .field-item, .field-field-landing-page-items .field-item").each(function(){
      imageheight = $(this).find(".field-type-image img").height();
      //consoleLog("imageheight: " + imageheight);
      $(this).find(".view-mode-small_card").height(imageheight*2);
    });
    
    $(".cards .views-row, .cards-front-calendar .views-row, .cards .field-items .field-item").each(function(){
      //consoleLog("checking .cards .views-row..");
      imageheight = $(this).find("img").height();
      //consoleLog("view card image height: " + imageheight);
      //consoleLog("imageheight: " + imageheight);
      $(this).height(imageheight*2);
    });
  }
  
  

 
  var landingPageHeightsListening = false;
  
  function homeTweaks(){
    var ourworkimgheight = $("#block-ourwork img").height();
    consoleLog("ourwork img height: " + ourworkimgheight);
    if($(window).width() > 640){//tablet and desktop only please
      $("#block-twitter .field-body").height(ourworkimgheight);
    }
    else{
      $("#block-twitter .field-body").height(ourworkimgheight*3);
    }
  }
  function removeContextualLinks($el){
    $el.removeAttr('data-quickedit-entity-id').removeClass("contextual-region")
    $el.find(".contextual,[data-contextual-id]").remove();
  }

  $.fn.setFocusablesEnabled = function(en){
    return this.each(function(){
      if (en){
        $(this).find('.setFocusablesEnabledApplied').each(function(){
              $(this).removeClass('setFocusablesEnabledApplied');
              var prevTabIndex = $(this).data('prevTabIndex');
              $(this).removeData('prevTabIndex');
              $(this).removeAttr('tabIndex');
              if(prevTabIndex) $(this).attr("tabIndex", prevTabIndex);
            });

      }else {
        $(this).find(':input,a').each(function(){
                var prevTabIndex = $(this).prop('tabIndex');
                $(this).data('prevTabIndex', prevTabIndex);
                $(this).attr('tabIndex', -1);
                $(this).addClass('setFocusablesEnabledApplied');
              });
      }
    });
  }
  function relocateFixedHeader() {
      if(!allowFixedHeader) return;
      var window_top = $(window).scrollTop();
      var div_top = $('#fixed-header-anchor-after').offset().top;
      var editKeysFocused;
      var mustAlwaysFix = $('body').hasClass('fixed-header');
      if (mustAlwaysFix || window_top > div_top - 1) {
          if (!$('#fixed-header').hasClass('fixed')){
            editKeysFocused = $('#edit-keys').is(':focus');
            $('#fixed-header').addClass('fixed');
            $('#fixed-header').setFocusablesEnabled(true);
            $('#edit-keys-fixed').val($('#edit-keys').val());
            if (editKeysFocused) $('#edit-keys-fixed').focus();
            $('body').addClass('fixed-header-is-fixed');
          }
          $('#fixed-header-anchor-before').height($('#fixed-header').outerHeight());
      } else {
          if ($('#fixed-header').hasClass('fixed')){
              editKeysFocused = $('#edit-keys-fixed').is(':focus');
              $('#fixed-header').setFocusablesEnabled(false);
              $('#fixed-header').removeClass('fixed');
              $('#edit-keys').val($('#edit-keys-fixed').val());
              if (editKeysFocused) $('#edit-keys').focus();
              $('body').removeClass('fixed-header-is-fixed');
              //$('#fixed-header').find('.show-if-fixed').stop().fadeTo('fast', 0);
          }
          $('#fixed-header-anchor-before').height(0);
      }
  }
  function replaceIds($el, suffix){
    $el.find('[id]').each(function(){
      $(this).attr('id', $(this).attr('id') + suffix);
    });
    $el.find('[for]').each(function(){
      $(this).attr('for', $(this).attr('for') + suffix);
    });
  }
  function prepareFixedHeader(context){
    //var $l = $("#block-kyanite-branding").clone().attr("id", "block-kyanite-branding-clone")
    $(context || 'body').find('#fixed-header').once('prepareFixedHeader').each(function(){
      var $left = $(this).find('.layout-fixed-header-left');

      if ($left.length){
        $left.addClass("show-if-fixed");

        var $logo = $("#block-kyanite-branding a:first").clone().attr("id", "logo-fixed");
        //removeContextualLinks($logo);
        replaceIds($logo, '-fixed');

        $left.append($logo);

      }

      var $right = $(this).find(".layout-fixed-header-right");
      if ($right.length){
        $right.addClass("show-if-fixed");

        var $exploreButton = $('button.explore-button').first().clone().addClass("explore-button-fixed");
        replaceIds($exploreButton, '-fixed');
        $right.append($exploreButton);

        //var $search = $('#block-kyanite-search').clone().attr("id", "block-kyanite-search-fixed");
        var $search = $('.searchbox').clone().removeClass("searchbox").addClass("searchbox-fixed");
        removeContextualLinks($search);
        replaceIds($search, '-fixed');
        
        $right.append($search);

      }

        $(this).find('.show-if-fixed').setFocusablesEnabled(false);
        $(window).on("scroll resize orientationchange load", relocateFixedHeader);
        relocateFixedHeader();
        setInterval(relocateFixedHeader, 500);

    });
  }

  function searchTweaks(){
    $("#search-form #edit-submit").wrap("<div class='searchsubmit'></div>");
    $("#search-form .searchsubmit").click(function(){
      $("#search-form").submit();
    });
  }

  function authorNameTweaks(){
//    if($(".field-body .authorname").length && $(".authornamefield").length){
      $(".field-body .authorname").each(function(){
        consoleLog("authorname: " + $(this).text());
        $(this).parent().parent().parent().find(".authornamefield").text( $(this).text() );
      });
      $(".authornamefield").each(function(){
        if($(this).text().trim() == "Kyanite"){
          $(this).remove();
        }
      });
    //}
  }

  function blogTweaks(){
    if($(".field-field-hide-featured-image").text().trim() == "1"){
      $(".node #flexslider-1, .featuredimagefromurl").hide();
    }
  }

  

  function spcGridView(){
    consoleLog("function spcGridView");
    
    $(".paragraphfeaturedcontent ul.slides li").each(function(){
      
      var thislink = $(this).find(".views-field-title a").attr("href");
      //$(this).find(".views-field-title a").hide();//hidden with css
      if($(this).find("> a").length){
        //do nothing.. it already has a link 
      }
      else{
        $(this).wrapInner('<a href="'+thislink+'"></a>');
      }

    });
  }
  function relatedContentView(){
    var pagelanguage = $("html").attr("lang");
    consoleLog("pagelanguage: " + pagelanguage);

    var lastnid = "";
    var lastlang = "";
    var lastlangnid = "";
    $(".relatedcontent .item-list li, .paragraphfeaturedcontent ul.slides li").each(function(){

      if($(this).find(".contenttype").text().trim() == "Basic page"){
        $(this).find(".contenttype, .created").remove();
      }
        

      consoleLog("lastnid: " + lastnid);
      consoleLog("lastlang: " + lastlang);
      if($(this).find(".relatedinner").attr("data-nid") == lastnid){
        consoleLog("if relatedinner data-nid = lastnid");
        if(pagelanguage == "en"){
          consoleLog("pagelanguage = en; removing fr-"+lastnid);
          $(this).closest("ul").find(".relatedinner[data-langnid='fr-"+lastnid+"']").closest("li").remove();
        }
        if(pagelanguage == "fr"){
          consoleLog("pagelanguage = fr; removing en-" + lastnid);
          $(this).closest("ul").find(".relatedinner[data-langnid='en-"+lastnid+"']").closest("li").remove();
        }
        if(lastlangnid == $(this).find(".relatedinner").attr("data-langnid")){
          consoleLog("lastlangnid = this data-langnid; removing this relatedinner data-langnid");
          $(this).remove();
        }
      }

      lastnid = $(this).find(".relatedinner").attr("data-nid");
      lastlang = $(this).find(".relatedinner").attr("data-lang");
      lastlangnid = $(this).find(".relatedinner").attr("data-langnid");
    });
    //consoleLog("relatedcontent count: " + $(".spcgrid.relatedcontent .views-row").length);
    consoleLog("related text" + $("#block-views-block-related-content-block-1").text());
    if($(".spcgrid.relatedcontent .views-row").length){
      $("#block-views-block-related-content-block-1").fadeIn();//hide related content block if even the fallback view is empty
    }
    if($(".field-field-override-related-content").length && ($(".field-field-override-related-content").text().trim ()!= "")){
      $("#block-views-block-related-content-block-1 > h2").text($(".field-field-override-related-content").text());
    }
  }
  function bottomcontent(){
    if($(".bottom").length){
      if(($(".bottom").html().trim() != "") && $(".bottom > div").html().trim() != ""){
        $(".bottom").fadeIn();
      }
    }
    if($(".bottomfullwidth").length){
      consoleLog("bottomfullwidth text: "+ $(".bottomfullwidth").text().trim());
      consoleLog("bottomfullwidth > div text: "+$(".bottomfullwidth > div").text().trim());
      if(
          ($(".bottomfullwidth").text().trim() != "Related Content") && 
          ($(".bottomfullwidth").text().trim() != "Contenu connexe") && 
          ($(".bottomfullwidth > div").text().trim() != "Related Content") &&
          ($(".bottomfullwidth > div").text().trim() != "Contenu connexe")
        ){
        $(".bottomfullwidth").fadeIn();
      }
    }
  }

  function paragraphtabs(){
    $(".paragraph.paragraph--type--bp-tabs ul.nav.nav-tabs li.active a").addClass("active");
  }

  function paragraphCarouselTweaks(){
    consoleLog("function paragraphCarouselTweaks");
    $(".paragraph--type--bp-carousel .carousel-item").each(function(){
      consoleLog(".paragraph--type--bp-carousel .carousel-item");
      consoleLog(".field-field-this-is-a-link-to-an-image: " + $(this).find(".field-field-this-is-a-link-to-an-image").text());
      if($(this).find(".field-field-this-is-a-link-to-an-image").text().trim() == "1"){
        consoleLog("if field is link to image... ");
        if($(this).closest(".carousel-item").find("a").length){
          $(this).closest(".carousel-item").find("a").addClass("colorbox").attr("rel", "gal");
        }
        else{
          $(this).closest(".carousel-item").find("img").wrap("<a href='"+$(this).closest(".carousel-item").find("img").attr("src")+"' class='colorbox' rel='gal'></a>");
        }
      }
      
    });
  }

  function paragraphGalleryTweaks(){
    consoleLog("function paragraphCarouselTweaks");
    $(".paragraph--type--gallery .field-item").each(function(){
      $(this).find("a").addClass("colorbox").attr("rel", "gal");
    });
    $(".paragraph--type--gallery").each(function(){
      if($(this).find(".field-field-show-captions-under-the-th").text().trim() == "1"){
        $(this).find(".field-item img").each(function(){
          $(this).wrap("<figure></figure>");
          $(this).after("<figcaption>" + $(this).attr("alt") + "</figcaption>");
        });
      }
    });
    /*$(".paragraph--type--bp-image").each(function(){
      if( $(this).find(".field-field-show-captions-under-the-th").text().trim() == "1" ){
        $(this).find("img").wrap("<figure></figure>");
        $(this).find("img").after("<figcaption>" + $(this).find("img").attr("alt") + "</figcaption>");
      };
    });*/
  }

  function paragraphImageTweaks(){
    $(".paragraph--type--bp-image").each(function(){
      if(!$(this).parent().hasClass("carousel-item")){//don't apply to images inside carousels; they are handled by paragraphCarouselTweaks()
        consoleLog(".paragraph--type--bp-image .field-bp-image-field");
        consoleLog(".field-field-this-is-a-link-to-an-image: " + $(this).find(".field-field-this-is-a-link-to-an-image").text());
        if($(this).find(".field-field-this-is-a-link-to-an-image").text().trim() == "1"){
          consoleLog("if field is link to image... ");
          if($(this).find(".field-bp-image-field a").length){
            consoleLog("found link");
            $(this).find(".field-bp-image-field a").addClass("colorbox").attr("rel", "gal");
          }
          else{
            consoleLog("no link found");
            $(this).find(".field-bp-image-field img").wrap("<a href='"+$(this).find(".field-bp-image-field img").attr("src")+"' class='colorbox' rel='gal'></a>");
          }
        }
        if( $(this).find(".field-field-show-captions-under-the-th").text().trim() == "1" ){
          $(this).find("img").wrap("<figure></figure>");
          $(this).find("img").after("<figcaption>" + $(this).find("img").attr("alt") + "</figcaption>");
        };
      }
    });
  }

  function paragraphAccordion(){
    $(".paragraph--type--bp-accordion .card-header.panel-heading:first-child a").trigger("click");
  }

  function authorTweaks(){
    //consoleLog("authorTweaks");
    if($("#block-views-block-author-block-1 .views-row").length){
      consoleLog("has author");
      $("#block-views-block-author-block-1").fadeIn();
    }
    else{
      //do nothing
      //$("#block-views-block-author-block-1").remove();
    }
  }

  function eventView(){
    $(".events .form-checkboxes .form-checkbox").addClass("js-hide");
    $(".events .form-checkboxes .form-checkbox").each(function(){
      if($(this).is(":checked")){
        $(this).parent().addClass("division-checked");
      }
    });

    
    $(".events .form-checkboxes .form-checkbox").click(function(){
      consoleLog("clicked division checkbox");
    });

    $(".events .item-list li").each(function(){
      var eventlink = $(this).find(".views-field-view-node").text().trim();
      if($(this).find("> a").length === 0){
        $(this).wrapInner("<a href='"+eventlink+"'></a>");
      }
      if(!$(this).find(".event-month").hasClass("event-month-processed")){
        var month = $(this).find(".event-month").text();
        month = month.replace(" ","");
        consoleLog("month: " + month);
        months = month.split("-");

        var monthone = months[0].trim();
        consoleLog("monthone: " + monthone);
        var monthtwo = months[1].trim();
        consoleLog("monthtwo: " + monthtwo);

        var day = $(this).find(".event-day").text();
        day = day.replace(" ","");
        consoleLog("month: " + day);
        days = day.split("-");

        var dayone = days[0].trim();
        consoleLog("dayone: " + dayone);
        var daytwo = days[1].trim();
        consoleLog("daytwo: " + daytwo);


        if(monthone === monthtwo){
          consoleLog("month one = month two");
          $(this).find(".event-month").text(monthone).addClass("event-month-one");
          if(dayone === daytwo){
            consoleLog("day one = day two");
            $(this).find(".event-day").text(dayone).addClass("event-day-one");
          }
          else{
            consoleLog("same month, different days");
            $(this).find(".event-day-one").text(dayone).addClass("event-day-one");
          }
        }
        else{
          consoleLog("months differ, presumably with month two being later");

          $(this).find(".event-month").text(monthone).addClass("event-month-one");

          $(this).find(".event-day").text(dayone).addClass("event-day-one");

          $(this).find(".event-day-one").after("<div class='event-month-two'>"+monthtwo+"</div>");

          $(this).find(".event-month-two").after("<div class='event-day-two'>"+daytwo+"</div>");
        
        }
        if($(this).find(".event-month-two").length > 0){
          $(this).find(".event-day-one").after("<div class='event-date-divider'></div>");
        }
        $(this).find(".event-month").addClass("event-month-processed");
      }

    });
  }
  function eventMap(){

    var viewmap = "view map";
    var viewlist = "View List";
    consoleLog("html attr lang: " + $("html").attr("lang"));
    if($("html").attr("lang") == "fr"){
      viewmap = "voir la carte";
      viewlist = "Voir la liste";
    }
    $(".events details").after("<a href='javascript:;' class='togglemapview viewmap'>"+viewmap+"</a>");
    $("#block-kyanite-content").prepend("<a href='javascript:;' class='togglemapview viewlist'>"+viewlist+"</a>");
    $(".togglemapview").click(function(){
      $(".events .item-list, .events details, .layout-sidebar, .togglemapview.viewmap, .togglemapview.viewlist").toggle();
      $("main .layout-content").toggleClass("fullwidth");
      $("#block-kyanite-content, .togglemapview.viewlist, .events .views-exposed-form, .eventmap, #main").toggleClass("mapvisible");
    }
    );
  }
  function spcResources(){
    $(".spcgrid.resources .views-row a, .contenttype-resource.views-row a").attr("target","_blank");
  }

  Drupal.behaviors.kyanite = {
    attach: function (context, settings) {
      
      //prepareFixedHeader(context);
  		styleSearchBlockForm(context);
  		allowHidingStatusMessages(context);
      addWrapperForSlideBodyNode(context);
      addTextLengthClasses(context);
      addOnVisibleClasses(context);
      newsFilterTweaks();
      blogFilterTweaks();
      eventsFilterTweaks();
      eventCardTweaks();
      langswitcher();
      homeTweaks();
      spcImportTweaks();
      speechesFilterTweaks();
      YouTubeModal();
      paragraphAccordion();
      spcGridView();   
      spcResources();
      authorTweaks(); 
      eventView();  

      $(".seventywomen .et-pb-column").equalHeights();

      var path = window.location.pathname.replace("/","");
      $("body").addClass("path-"+path);
      
      

      
    }
  };

  function YouTubeModal(){
    $('.field-field-video .field-field-video.field-type-video-embed-field a').colorbox({iframe: true, width: "600px", height: "400px", href:function(){
        var videoId = new RegExp('[\\?&]v=([^&#]*)').exec(this.href);
        if (videoId && videoId[1]) {
            return 'https://www.youtube.com/embed/'+videoId[1]+'?rel=0';
        }
    }});
  }

  function langswitcher(){
    //console.log("langswitcher");
    $(".langswitcherblock .language-link").each(function(){
      //console.log("link url: " + $(this).attr("href"));
      if($(this).attr("href").includes("/node/",0)){
        //console.log("hide link with url " + $(this).attr("href"));
        $(".langswitcherblock").hide();
      }
    });
  }  
  function spcImportTweaks(){
    $(".field-body img[src*='www.spc.int/wp-content/uploads']").each(function(){
      //console.log("img src: " + $(this).src);
      //console.log("img width: " + $(this).width);
      if($(this).attr("width") < 480){
        $(this).addClass("importedfromwordpress");
      }
    });
  }
  function spcFeaturedImageTweaks(){
    if($(".node #flexslider-1 img").length > 0){
      //console.log("we have a slider..");
      //do nothing
    }
    else{
      //console.log("no slider... defaulting..");
      if($(".field-field-hide-featured-image").text().trim() != "1"){//featured image is not hidden, so show it
        $(".field-field-featured-image-url").each(function(){
          var featuredimgurl = $(this).text().trim();
          if(featuredimgurl.startsWith("/wp-content")){
            featuredimgurl = "http://www.spc.int"+featuredimgurl;
          }
          $(this).after("<img src='"+featuredimgurl+"' alt='' class='featuredimagefromurl'>");
        });
      }
    }
  }
  function sideBarTweaks(){
    if($(".layout-sidebar").length){
      consoleLog("detected sidebar");
      if(!$(".sidemenu .menu-item").length){
        consoleLog("no menu items detected");
        $(".sidemenu").parent("div").remove();
        if(!$(".layout-sidebar > div").length){
          consoleLog("no sidebar");
          $(".layout-sidebar").remove();
          $(".layout-content").addClass("fullwidth");
        }
      }
    }
  }

  function blockquotes(){
    $("blockquote, .et_pb_testimonial").each(function(){
      $(this).prepend("<span class='blockquote-icon'></span>");
    });
  }

  function alignFigures(){
    $("img.align-left").each(function(){
      if($(this).parent("figure").length){
        $(this).parent().addClass("align-left");
        $(this).removeClass("align-left").removeAttr("align");
      }
    });
    $("img.align-right").each(function(){
      if($(this).parent("figure").length){
        $(this).parent().addClass("align-right");
        $(this).removeClass("align-right").removeAttr("align");
      }
    });
  }

  function inlineImageTweaks(){
    $(".field-type-text-with-summary img[data-entity-type='file'], .field-type-text-long img[data-entity-type='file']").each(function(){//only affects images inserted with Drupal
      consoleLog("img width: " + $(this).width());
     
      var theImage = new Image();
      theImage.src = $(this).attr("src");

      // Get accurate measurements from that.
      var imageWidth = theImage.width;
      var imageHeight = theImage.height;

      consoleLog("naturalWidth: " + imageWidth);
      if($(this).width() < $(this)[0].naturalWidth){
        if($(this).parent("a").length){
          if($(this).parent("a").attr("href") == $(this).attr("src")){
            $(this).parent("a").addClass("colorbox inline-spc-images").attr("rel", "gal");
          }
        }
        else{
          $(this).wrap("<a href='"+$(this).attr("src")+"' class='colorbox inline-spc-images' rel='gal'></a>");
        }
      }
    });
    $("img.align-center").each(function(){
      if($(this).parent().is("figure")){
        $(this).parent().css("margin","auto");
      }
    });
  }

  function paragraphSimpleBackgroundColor(){
    $(".paragraph--type--bp-simple.paragraph--color").each(function(){
      $(this).parent().addClass("spc-simple-paragraph-color");
    });
  }

  function homePageFeaturedBox(){
    $("#block-views-block-home-page-featured-content-block-1").each(function(){
      var url = $(this).find(".views-field-view-node").text();
      $(this).find(".views-field-view-node").remove();
      $(this).find(".kyanite-views-row-inner").wrapInner("<a href='"+url+"' class='featurecontentlink'></a>");
    });
  }

  function captionButtonBlock(){
    $(".kyanite-image-caption-button-block").each(function(){
      var buttonlink = $(this).find(".field-field-button a").attr("href");
      $(this).find(".field-field-button a").parent().html("<div class='captionbutton'>"+$(this).find(".field-field-button a").text()+"</div>");
      $(this).wrapInner("<a href='"+buttonlink+"'></a>");
    });
  }

  function superfishExplore(){
    $("body .sf-accordion-toggle > a").click().hide();
  }

  function termTweaks(){
    $(".path-taxonomy .field-field-division-icon").prependTo("#block-kyanite-page-title");
  }

  function partnerTweaks(){
    $(".page-node-type-partner .field-field-partner-logo").addClass("align-left");
  }

   function frieze(){
    $(".divisionsite .headertitle, .divisionsite .layout-primary-menu").appendTo(".divisionsite .frieze > div");
    /*var newURL = window.location.protocol + "://" + window.location.host + "/" + window.location.pathname;
    var pathArray = window.location.pathname.split( '/' );
    if($("html").attr("lang") == "fr"){
      var firstfragment = pathArray[2];
      $(".divisioniconsheader .item-list li a").each(function(){
        if(($(this).attr("href") == "/fr/"+firstfragment) || ($(this).attr("href").startsWith("/fr/"+firstfragment))){
          $(this).addClass("active");
          $(this).closest("li").addClass("active");
        }
      });
    }
    else{
      var firstfragment = pathArray[1];
      $(".divisioniconsheader .item-list li a").each(function(){
        if(($(this).attr("href") == "/"+firstfragment) || ($(this).attr("href").startsWith("/"+firstfragment))){
          $(this).addClass("active");
          $(this).closest("li").addClass("active");
        }
      });
    }*/
    
  }

  function eventPageInit(){
    $("aside.layout-sidebar").addClass("desktop");
    $("aside.layout-sidebar").clone().addClass("mobile").appendTo("#main");
    $("aside.layout-sidebar.mobile").removeClass("desktop");
    if($(".page-node-type-event .field-field-location-name").text().trim().length){
      $(".field-field-geolocation-for-event").hide();
    }
    if($(".page-node-type-event .field-field-full-location-details").text().trim().length){
      $(".field-field-location-name").hide();
    }
  }

  function memberDefaultInfo(){
    $("p.autocomplete-instructions").append($(".kyanite-block.logoanimation"));
  }

  function mapInitialize(){
    consoleLog("height: " + $("#plethora-map-container").height());
    $("#plethora-map-feature-wrapper").height($("#plethora-map-container").height() + 10);
  }

  function mapSizing(){
    $("#plethora-map-feature-wrapper").height($("#plethora-map-container").height());
  }

  function ccestweaks(){
    $(".divisionfront.division-cces .paragraph--type--bp-carousel").insertAfter($(".bottomfullwidth"));
    $("body.cccpir .divisioniconsheader .item-list li a[href='/cces'], body.cccpir .divisioniconsheader .item-list li a[href='/decc']").each(function(){
      $(this).addClass("active")
      $(this).closest("li").addClass("active");
    });
  }

  function dgTweaks(){
    var galleryheight = $("#block-dggallery").height();
    consoleLog("DG gallery height: " + galleryheight);
    if($(window).width() > 640){//tablet and desktop only please
      $("#block-dgtwitter .field-body").height(galleryheight);
    }
    else{
      $("#block-dgtwitter .field-body").height(galleryheight*3);
    }
  }

  function resizingTweaks(){
    homeTweaks();
    dgTweaks();
  }

  function centerBlockTitles(){
    $(".kyanite-block").each(function(){
      if( $(this).find(".field-field-center-title").text().trim() == "1"){
        $(this).find("> h2").css("text-align","center");
      }
    });
  }

  function resizeIframe(obj) {
    obj.style.height = obj.contentWindow.document.body.scrollHeight + 'px';
  } 

  function logoanimation(){
    var video = $("#logoanimation");
    $(video).click();
  }



  $(window).on("load scroll resize orientationchange", resizingTweaks);

  //$(window).on("scroll resize orientationchange", mapSizing);
  

	$(document).ready(function(){
   //$("#logoanimation")[0].play();


    //because for some reason the Updates view's translations don't save:
    //$(".actualite h1").text("Actualité");
    //$(".communiques h1").text("Communiqués");
    //$(".french-web-stories h1").text("Actus Web");
    $(".actualite h1, .communiques h1, .french-web-stories h1").fadeIn();

    frieze();

    centerBlockTitles();

    eventPageInit();

    memberDefaultInfo();

    ccestweaks();
    

// please do not try to optimize this by putting it into another document ready event handler
		$('body').addClass('ready');
    homePageFeaturedBox();



    paragraphCarouselTweaks();
    paragraphGalleryTweaks();
    paragraphImageTweaks();

    paragraphtabs();

    spcFeaturedImageTweaks();

    blogTweaks();

    eventMap();
          
    searchTweaks();
    authorNameTweaks();

    sideBarTweaks();

    blockquotes();

    alignFigures();

    paragraphSimpleBackgroundColor();

    relatedContentView();
    bottomcontent();

    superfishExplore();
    termTweaks();
    partnerTweaks();
    
    
	});
	$(window).load(function(){
		$('body').addClass('window-loaded');

    logoanimation();

    
    $(".resizeiframe").each(function(){
      resizeIframe(this);
    });

    //mapInitialize();
    
    inlineImageTweaks();

    captionButtonBlock();

    $("a[href^='http']").attr("target","_blank");
    

    $('#block-views-block-gallery-block-1 .views-row a, .paragraph--type--gallery .field-field-gallery-image-file .field-item a.colorbox, .paragraph--type--bp-carousel .carousel-item a.colorbox, .field-bp-image-field a.colorbox, a.colorbox.inline-spc-images').colorbox({rel:'gal', maxWidth:'95%', maxHeight:'95%', title: function(){
      var alt = "";
      var title = "";

      alt = $(this).find("img").attr("alt");
      if($(this).find("img").attr("title")){
        title = ": " + $(this).find("img").attr("title");
      }
      return alt  + title;
    }});
    $('#block-views-block-gallery-block-1 .views-row a, .paragraph--type--gallery .field-field-gallery-image-file .field-item a, .field-bp-image-field a.colorbox, a.colorbox.inline-spc-images').prepend("<div class='zoomin'><span class='plus-zoom'>+</span></div>");
    
    $('img[usemap]').rwdImageMaps();

    $("#block-views-block-featured-articles-block-1 header, #block-views-block-featured-articles-block-2 header, #block-views-block-publications-home-page-block-1 header, #block-views-block-publications-home-page-block-2 header, #block-views-block-kyanite-events-home header").each(function(){
      $(this).insertBefore($(this).parent().parent());
    });

    $("a[href*='publications-content']").attr("target","_blank");


    
	});

	initGlobal();
})(window, jQuery, Drupal);
