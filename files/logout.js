(function($){


/*
	Cart Utilities
*/


/*
	/Cart Utilities
*/


/* --------------------------------------------- */

/* 00 - js-logoutApi
/* --------------------------------------------- */
var jsLogoutApi = function()
{
	this.withoutConsole();
	this.initialize.apply(this, arguments);
}

/* --------------------------------------------- */

/* 01 - initialize
/* --------------------------------------------- */

jsLogoutApi.prototype.initialize = function()
{
	var thisdomain = location.hostname;
	var testdomain = ['dev57.ini.co.jp', 'dev.starbucks.co.jp', 'dev2.starbucks.co.jp', 'st2.starbucks.co.jp', 'www2.starbucks.co.jp', 'store2.starbucks.co.jp', 'card2.starbucks.co.jp', 'cart2.starbucks.co.jp', 'gift-test.starbucks.co.jp', 'api2.starbucks.co.jp'];

	this.test		= ($.inArray(thisdomain, testdomain) >= 0) ? true : false;
	this.apidomain = (this.test) ? 'cart2.starbucks.co.jp' : 'cart.starbucks.co.jp';
	this.url		= arguments[0].url || 'https://' + this.apidomain + '/b/pc/xml/PWCheck.html?mthd=99';
	this.protocol = arguments[0].protocol || 'https://';
	this.form		= arguments[0].form || 'jsonp';
	this.callback = arguments[0].callback || 'response';
	this.timeout = 10000;
	this.character = 'utf8';
	this.target = arguments[0].target || $('.logout');
	
	this.COOKIE_DOMAIN = 'starbucks.co.jp';
	this.COOKIE_NAME_TOKEN = 'sbj_ols_cart_token';
	this.COOKIE_NAME_EXPIRES = 'sbj_ols_cart_token_expire';
	this.COOKIE_NAME_TOTAL_QUANTITY = 'sbj_ols_cart_count';
	
	this.cookieDomain = document.domain.indexOf(this.COOKIE_DOMAIN) != -1 ? ('.' + this.COOKIE_DOMAIN) : null;
	this.cookieEnv = DOMAIN_API == 'https://cart.starbucks.co.jp' ? 'production' : 'staging';

	this.getUrl();
	this.setEvent();
}

/* --------------------------------------------- */

/* 02 - setEvent
/* --------------------------------------------- */

jsLogoutApi.prototype.setEvent = function()
{
	var self = this;

	$(this.target).on('click', function(e){
		self.getResponce(e);
	});
}

/* --------------------------------------------- */

/* 03 - getUrl
/* --------------------------------------------- */

jsLogoutApi.prototype.getUrl = function()
{
	this.linkUrl = $(this.target).attr('href');
}

/* --------------------------------------------- */

/* 04 - cookies
/* --------------------------------------------- */
 
jsLogoutApi.prototype.cookies = function() {
	function decode(s) {
		return decodeURIComponent(s.replace(/\+/g, '%20'));
	}
	
	var pairs = document.cookie.split('; ');
	var cookies = {};

	for (var i = 0, l = pairs.length; i != l; i++) {
		var prop = pairs[i].split('=');
		cookies[decode(prop[0])] = decode(prop[1]);
	}
	
	return cookies;
};

/* --------------------------------------------- */

/* 05 - deleteCookie
/* --------------------------------------------- */
 
jsLogoutApi.prototype.deleteCookie = function(key) {
	key = key + '_' + this.cookieEnv;
	var cookie = key + '=';
	cookie += '; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
	if (this.cookieDomain) cookie += '; domain=' + this.cookieDomain;		
	document.cookie = cookie;
};

/* --------------------------------------------- */

/* 06 - makeError
/* --------------------------------------------- */
 
jsLogoutApi.prototype.makeError = function(xhr, status) {
	if (status == 'error') {
		var res = xhr.responseJSON;
		if (xhr.status == 422) {
			return {
				type: 'APIError',
				code : res.code,
				message: res.message
			};
		} else {
			return {
				type: 'HTTPError',
				code: xhr.status,
				message: xhr.statusText
			};
		}
	} else {
		return {
			type: 'AjaxError',
			status: status,
			message: status
		};
	}
};

/* --------------------------------------------- */

/* 07 - getResponce
/* --------------------------------------------- */

jsLogoutApi.prototype.getResponce = function(e)
{
	self = this;

	e.preventDefault();
	
	var cookies = self.cookies();
	var token = cookies[self.COOKIE_NAME_TOKEN + '_' + self.cookieEnv];
	
	function complete() {
		self.deleteCookie(self.COOKIE_NAME_TOTAL_QUANTITY);
		self.deleteCookie(self.COOKIE_NAME_TOKEN);
		self.deleteCookie(self.COOKIE_NAME_EXPIRES);
		
		window.location.href = self.linkUrl;
	}
	
	if (token) {
		$.ajax({
			method: 'DELETE',
			url: DOMAIN_API + '/api/v1/access_token',
			timeout: this.timeout,
			dataType: window.XDomainRequest ? 'jsonp' : null,
			headers: {
				Authorization: 'Token token=' + token
			},
			complete: complete
		});
	} else {
		complete();
	}
}

/* --------------------------------------------- */

/* 08 - logput
/* --------------------------------------------- */

jsLogoutApi.prototype.logput = function(log)
{
	console.log(log);
}

/* --------------------------------------------- */

/* 09 - withoutConsole
/* --------------------------------------------- */

jsLogoutApi.prototype.withoutConsole = function()
{
	if (typeof console === 'undefined') {
		console = {
			log: function noop() {}
		}
	}
}

/* --------------------------------------------- */

/* 10 - DOM Ready
/* --------------------------------------------- */

$(function()
{

	new jsLogoutApi({
		target: $(".js-logout") //ログアウト
	});

});


window.jsLogoutApi = jsLogoutApi;


})($j1111);



