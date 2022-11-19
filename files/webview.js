jQuery = jQuery || $;
jQuery(function($){
	if (navigator.userAgent.indexOf('starbucksjapan/') !== -1) {
		if (navigator.userAgent.indexOf('starbucksjapan/1.') === -1) {
			if ( $('a[href="/asset/202001241505-8b8ced/resource/component/overlay/about-onlinestore-guide.html"]').parent().parent().length > 0 ) {
				$('a[href="/asset/202001241505-8b8ced/resource/component/overlay/about-onlinestore-guide.html"]').parent().parent().remove();
			}

			$('head').append('<link rel="stylesheet" type="text/css" media="all" href="/common/css/webview_udp.css?ver=20170920">');
			$('.web_view_none').remove();
		} else {
			if ( $('a[href="/asset/202001241505-8b8ced/resource/component/overlay/about-onlinestore-guide.html"]').parent().parent().length > 0 ) {
				$('a[href="/asset/202001241505-8b8ced/resource/component/overlay/about-onlinestore-guide.html"]').parent().parent().remove();
			}

			$('head').append('<link rel="stylesheet" type="text/css" media="all" href="/common/css/webview.css?ver=20170920">');
			$('.web_view_none').remove();
		}
	} else {
		$('.web_view_none').removeClass('web_view_none');
	}
});
