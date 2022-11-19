/**
 * cartinfo.js
 * @modified 2016/4/21
 */
 
(function($, window, document, undefined){
	/*
	 * カートAPIのカプセル化クラス
	 * インスタンスは認証済みのセッションを表現する
	 * CartAPIで利用されるコールバックのcbパラメータはfunction(err, result)の形式で渡す
	 *
	 * @constructor
	 */
	var CartAPI = function(accessToken) {
		this.accessToken = accessToken;
	};
	
	
	CartAPI.dataType = 'json';
	
	
	// IE8, 9
	if (document.uniqueID && typeof window.matchMedia == "undefined") {
			CartAPI.dataType = 'jsonp';
	}
	
	
	CartAPI.publicRequest = function(method, url, data, cb) {
		$.ajax({
			method: method,
			url: url,
			timeout: 10000,
			dataType: CartAPI.dataType,
			data: data,
			success: function(res) {
				cb(null, res);
			},
			error: function(xhr, status) {
				cb(CartAPI.makeError(xhr, status), null);
			}
		});
	};
	
	/*
	 * アクセストークン取得API呼び出し
	 */
	CartAPI.createAccessToken = function(cb) {
		this.publicRequest(
			'GET', 
			DOMAIN_API + '/api/v1/access_token', 
			{}, 
		cb);
	};

	/*
	 * 在庫を取得する
	 */
	CartAPI.getInventories = function(params, cb) {
		if(location.host === 'www2.starbucks.co.jp'){
			this.publicRequest(
				'GET', 
				'//www2.starbucks.co.jp/_dev/cart/stub_inventory.php', 
				params, 
				cb
			);
			return
		}

		this.publicRequest(
			'GET', 
			DOMAIN_API_CF + '/api/v1/products/inventories', 
			params, 
			cb
		);
	};
	
	/*
	 * APIの返り値になるエラーを生成する
	 * API固有のエラー、HTTPのエラー、jQuery Ajaxに関するエラーの3タイプをtype属性で見分けられる
	 * 各エラーの内容については各種ドキュメントを参考
	 */
	CartAPI.makeError = function(xhr, status) {
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
	}
	
	CartAPI.prototype = {
		/*
		 * API呼び出しのラッパー
		 */
		request: function(method, url, data, cb) {
			var auth = 'Token token=' + this.accessToken;
			
			$.ajax({
				method: method,
				url: url,
				timeout: 10000,
				dataType: 'json',
				data: data,
				beforeSend: function(xhr) {
					xhr.setRequestHeader('Authorization', auth);
				},
				success: function(res) {
					cb(null, res);
				},
				error: function(xhr, status) {
					cb(CartAPI.makeError(xhr, status), null);
				}
			});
		},
		
		/*
		 * アクセストークンを削除する
		 */
		deleteAccessToken: function(cb) {
			this.request(
				'DELETE',
				DOMAIN_API + '/api/v1/access_token',
				{},
				cb
			);
		},
		
		/*
		 * カートに商品を入れる
		 */
		addProduct: function(params, cb) {
			this.request(
				'POST',
				DOMAIN_API + '/api/v1/cart/products',
				params,
				cb
			);
		}
	};
	
	
	/**
		* カートのセッションを管理するクラス
		* セッションはAPI呼び出しで取得され、初期化時にクッキーから復元される
		* セッション情報の取得にはget, セッションの取得にはsessionメソッドを使う
		* セッションは期限によって、あらゆるタイミングで取得に失敗する可能性がある
		* 取得に失敗した場合は、loadによって、新規取得する必要がある
		* load呼び出しによって新規アクセストークンが獲得された場合、内部でクッキーに情報を保存する
		*/
	var CartInfo = {
		COOKIE_DOMAIN: 'starbucks.co.jp',
		COOKIE_NAME_TOKEN: 'sbj_ols_cart_token',
		COOKIE_NAME_EXPIRES: 'sbj_ols_cart_token_expire',
		COOKIE_NAME_TOTAL_QUANTITY: 'sbj_ols_cart_count',
				
		init: function() {
			this.domain = document.domain.indexOf(this.COOKIE_DOMAIN) != -1 ? ('.' + this.COOKIE_DOMAIN) : null;
			this.env = DOMAIN_API == 'https://cart.starbucks.co.jp' ? 'production' : 'staging';
			this.locked = false;
			this.cart = null;
			this.reload();
		},
		
		/**
		 * 新規セッションの取得
		 */
		load: function(cb) {
			if (this.locked) return false;
			this.locked = true;
			
			CartAPI.createAccessToken(function(err, res) {
				if (err) {
					cb(err);
				} else {
					var cart = {
						token: res.token, 
						expires: new Date(res.expire_at),
						totalQuantity: 0
					};

					CartInfo.save(cart);
					cb(null, cart);
				}
				CartInfo.locked = false;
			});
			
			return true;
		},
		
		/**
		 * セッションの復元
		 */
		reload: function() {
			this.cart = null;
			
			var cookies = this._cookies();
			var token = cookies[this.COOKIE_NAME_TOKEN + '_' + this.env];
			var expires = cookies[this.COOKIE_NAME_EXPIRES + '_' + this.env];
			var count = cookies[this.COOKIE_NAME_TOTAL_QUANTITY + '_' + this.env];

			if (!token || !expires || !count) return null;

			expires = expires.replace(/(%2B|\+)/g, ' ')

			var cart = {
				token: token,
				expires: new Date(expires),
				totalQuantity: parseInt(count, 10)
			};

			// カート情報の内容が正しいフォーマットか検証
			if (isNaN(cart.totalQuantity) || new Date() > cart.expires) return null;
			
			this.cart = cart;

			//secure属性を加えて保存
			CartInfo.save(cart);
			
			return this.cart;
		},
		
		/**
		 * セッション情報の取得
		 */
		get: function() {
			if (this.cart) {
				if (new Date() < this.cart.expires) {
					return this.cart;
				} else {
					this.cart = null;
					return null;
				}
			} else {
				return null;
			}
		},
		
		/**
		 * セッション情報の上書き
		 */
		save: function(cart) {
			if (!this.cart) this.cart = {};
			
			for (var k in cart) {
				this.cart[k] = cart[k];
			}
			
			var pairs = [
				[this.COOKIE_NAME_TOTAL_QUANTITY, this.cart.totalQuantity, this.cart.expires.toUTCString()],
				[this.COOKIE_NAME_TOKEN, this.cart.token, this.cart.expires.toUTCString()],
				[this.COOKIE_NAME_EXPIRES, this.cart.expires.toUTCString(), this.cart.expires.toUTCString()]
			];
			
			$.each(pairs, $.proxy(function(i, p) {
				this._setCookie(p[0], p[1], p[2]);
			}, this));
		},
		
		/**
		 * セッション情報の削除
		 */
		destroy: function() {
			this._setCookie(this.COOKIE_NAME_TOTAL_QUANTITY, '', 'Thu, 01 Jan 1970 00:00:00 GMT');
			this._setCookie(this.COOKIE_NAME_TOKEN, '', 'Thu, 01 Jan 1970 00:00:00 GMT');
			this._setCookie(this.COOKIE_NAME_EXPIRES, '', 'Thu, 01 Jan 1970 00:00:00 GMT');
			this.cart = null;
		},
		
		/*
		 * セッション情報が存在しているか？
		 */
		attached: function() {
			return !!this.get();
		},
				
		/*
		 * APIオブジェクトの取得(アクセストークンが必要無い呼び出し用)
		 */
		api: function() {
			return CartAPI;
		},
		
		/*
		 * APIセッションの取得
		 */
		session: function() {
			if (this.attached()) {
				return new CartAPI(this.get().token);
			} else {
				return null;
			}
		},
		
		/*
		 * クッキーを書き込む
		 */
		_setCookie: function(key, value, expires) {
			key = key + '_' + this.env;
			var cookie = key + '=' + this._encode(value);
			cookie += '; expires=' + expires + '; path=/';
			if (this.domain) cookie += '; domain=' + this.domain;
			cookie += ';secure';
						
			document.cookie = cookie;
		},
		
		/*
		 * クッキーのパーサ
		 */
		_cookies: function() {
			var cookies = {};
			
			if(document.cookie){
				var pairs = document.cookie.split('; ');
				for (var i = 0, l = pairs.length; i != l; i++) {
					var prop = pairs[i].split('=');
					cookies[this._decode(prop[0])] = this._decode(prop[1]);
				}
			}
			
			return cookies;
		},
		
		_encode: function(s) {
			return encodeURIComponent(s).replace(/\%20/g, '+');
		},
		
		_decode: function(s) {
			return decodeURIComponent(s.replace(/\+/g, '%20'));
		}
	};
	
	CartInfo.init();
	
	CartInfo.CartAPI = CartAPI;
	CartInfo.CartInfo = CartInfo;
	
	window.CartInfo = window.CartInfo || CartInfo; // export
}($j1111, window, this.document));