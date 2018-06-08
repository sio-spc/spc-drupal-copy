(function (window, $) {
	//This file contains theme-based customizations for the topics app

	//let's make it even more mobile friendly by adding swipe events (this uses events defined in jquery mobile)
	$(document).on('swipeleft', '.topic-page-inner', function(e){ 
		//console.log('you swiped left');
		onSwipe(true);
	});
	$(document).on('swiperight', '.topic-page-inner', function(e){ 
		//console.log('you swiped right');
		onSwipe(false);
	});
/*
	$(document).on('swipe', '.topic-page-inner', function(e){ 
		console.log('you swiped');
		console.log(e);
	});
*/

	function onSwipe(left){
		// unfortunately, jquery swipe events work for desktop as well --- 
		// this means that selecting text cannot be done properly...
		// for now we will allow the swipe if we're in mobile mode, which 
		// can be determined by ensuring the .topic-detail-component-next-page or
		// .topic-detail-component-previous-page buttons is visible before clicking it.
		if (left) {
			$('.topic-detail-component-next-page:visible:first').click();
		}
		else {
			$('.topic-detail-component-previous-page:visible:first').click();
		}
	}

})(window, jQuery);