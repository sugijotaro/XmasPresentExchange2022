/**
 * headercart.js
 * @modified 2016/4/21
 */

// $j1111 を $に戻す
$ = $j1111.noConflict(true);

var uuid = function(len, radix){
	var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split(''), uuid = [], i;
	radix = radix || chars.length;
	if(len){
		for(i = 0; i < len; i++){
			uuid[i] = chars[0 | Math.random()*radix]
		};
	}else{
		var r;
		uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
		uuid[14] = '4';
		for(i = 0; i < 36; i++){
			if(!uuid[i]){
				r = 0 | Math.random()*16;
				uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
			};
		};
	};
	return uuid.join('');
};
/**
 * カート参照
 */
function reqCartReference(){
	function set() {
		setCartQtyPrice(CartInfo.attached() ? CartInfo.get().totalQuantity : 0);
	}
	
	setInterval(set, 5000);
	set();
};
/**
 * カート内の商品数を表示
 */
function setCartQtyPrice(num,price){
	
	var normalIcon = $(".osIcon").eq(0);
	normalIcon = normalIcon.add($(".osIcon").eq(2));
	normalIcon = normalIcon.add($(".osIcon").eq(4));
	
	var zeroIcon = $(".osIcon").eq(1);
	zeroIcon = zeroIcon.add($(".osIcon").eq(3));
	zeroIcon = zeroIcon.add($(".osIcon").eq(5));
	
	//switch
	if( (num == 0 || num == "0") && zeroIcon.hasClass("none") )
	{
		normalIcon.addClass('none');
		zeroIcon.removeClass('none');
	}
	
	if( (num != 0 || num != "0") && normalIcon.hasClass("none") )
	{
		normalIcon.removeClass('none');
		zeroIcon.addClass('none');
	}
	
	//price整形 3桁毎にカンマを挿入
	//price = String(price).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');

	//update
	$(".js-headercart-qty").text(num);
	//$(".js-headercart-price").text(price);

	// 数量ある場合のみ、かつ会員登録時は除く
	if( (num != 0 || num != "0")
		&& (location.href.indexOf('starbucks.co.jp/register/mystarbucks/input/') < 0)
		&& (location.href.indexOf('starbucks.co.jp/register/mystarbucks/send/') < 0)
		&& (location.href.indexOf('starbucks.co.jp/register/mystarbucks/member-input/') < 0)
		&& (location.href.indexOf('starbucks.co.jp/register/mystarbucks/confirm/') < 0)
		&& (location.href.indexOf('starbucks.co.jp/register/mystarbucks/complete/') < 0)
		){
		$("nav.utility").addClass('is-cartActive');
	}
}


(function($, window, document, undefined){
	 window.onload = function() {
	//カート参照の後、カート内の商品数を表示
	reqCartReference();
	}
}(jQuery, window, this.document));

// カートボタン2度押し防止
// 20210531 iPhoneで戻るボタン押下時に機能しないため廃止
/*$(function(){
	var count = 1;
	$('.osIcon a').click(function(){
		// 初回のみ遷移
		if(count == 1){
			// カウント追加
			count++;
			location.href = $(this).attr('href');
			//alert('初回なので遷移します。');
			return false;
		// 2回目以降
		}else{				
			// カウント追加
			//alert(count+'目なので遷移しません。');
			count++;
			return false;
		}
	});
});*/

/**
 * item-history.js
 * @modified 2017/3/6
 */
 
(function($, window, document, undefined){

  
  /**
   * 商品閲覧履歴の設定
   */
  if(document.domain === 'www2.starbucks.co.jp'){
    var DOMAIN_CF = '//d3hjbu6zcoe45r.cloudfront.net';
  }else if(document.domain === 'dev2.starbucks.co.jp' || document.domain === 'st2.starbucks.co.jp'){
    var DOMAIN_CF = '//d2fzkgg97cd93o.cloudfront.net';
  }else if(document.domain === 'www.starbucks.co.jp'){
    var DOMAIN_CF = '//d3vgbguy0yofad.cloudfront.net';
  }else{
    var DOMAIN_CF = '//dqpw8dh9f7d3f.cloudfront.net';
  }
  
  var config = {
    API_BASE_URL: DOMAIN_WWW_API + '/api/1',
    ITEM_HISTORY_COOKIE_NAME: 'item_history', // 履歴を保存するクッキー名
    SESSION_COOKIE_NAME: 'PHPSESSID', // セッションIDのクッキー値
    STORE_MAX: 8, // 保存する最大履歴数
    EXPIRED_AT: '2038-01-19T03:14:07+09:00', // 履歴の保持期限
    IMAGE_BASE_URL: DOMAIN_CF
  };

  
  /**
   * クッキー読み書きヘルパ
   * 空白文字はデフォルトの+ではなく%20に変換する
   */
  var cookies = (function() {
    function encode(s) {
      return encodeURIComponent(s).replace(/\%20/g, '+');
    }
  
    function decode(s) {
      return decodeURIComponent(s.replace(/\+/g, '%20'));
    }
    
    function all() {
      var cookies = {};

      if(document.cookie){
          var pairs = document.cookie.split('; ');
          for (var i = 0, l = pairs.length; i != l; i++) {
            var prop = pairs[i].split('=');
            cookies[decode(prop[0])] = decode(prop[1]);
          }
      }
  
      return cookies;
    }
    
    /**
     * クッキーを読み込む
     */
    function get(key) {
      var def = null;
      
      if (arguments.length > 1) {
        def = arguments[1];
      }
      
      var cookies = all();
      
      if (cookies[key] === undefined) {
        return def;
      }
      return cookies[key];
    }
  
    /*
     * クッキーを書き込む
    */
    function set(key, value, options) {
      if (options == undefined) options = {};
      
      if (!options.path) options.path = '/';
      
      var payload = [key + '=' + encode(value)];
    
      var opts = ['path', 'expires', 'domain'];
    
      for (var i = 0, l = opts.length; i != l; i++) {
        var k = opts[i];
        var v = options[k];
        
        if (v) payload.push(k + '=' + v);
      }

      document.cookie = payload.join('; ') + ' ;secure';
    }

    return {
      get: get,
      set: set
    }
  })();
  
  
  /**
   * クエリ文字列ヘルパ
   */
  var qs = (function() {
    // クエリクラス
    var Query = function(items) {
      this.items = items;
    }
    
    Query.prototype = {
      get: function(key) {
        var def = null;
        
        if (arguments.length > 1) {
          def = arguments[1];
        }
        
        var value = def;
        
        $.each(this.items, function() {
          if (this[0] == key) {
            value = this[1];
            return false;
          }
        });
        
        return value;
      },
      
      getArray: function(key) {
        var values = [];
        
        $.each(this.items, function() {
          if (this[0] == key) values.push(this[1]);
        });
        
        return values;
      }
    };
    
    function parse(qs) {
      if (qs == '') return new Query();
      
      var p = [];
      var props = qs.split('&');
      
      for (var i = 0, l = props.length; i != l; i++) {
        var prop = props[i];
        var a = prop.split('=');
        
        if (a.length != 2) throw new Error('');
        
        var key = decodeURIComponent(a[0]);
        var val = decodeURIComponent(a[1]);
        p.push([key, val]);
      }

      return new Query(p);
    }
    
    function stringify(q) {
      var pairs = [];

      if (q instanceof Query) {
        pairs = q.items;
      } else if (q instanceof Array) {
        pairs = q;
      } else {
        for (var k in q) {
          pairs.push([k, q[k]]);
        }
      }
      
      var props = [];
      
      for (var i = 0, l = pairs.length; i != l; i++) {
        var p = pairs[i];
        props.push(encodeURIComponent(p[0]) + '=' + encodeURIComponent(p[1]));
      }
      
      return props.join('&');
    }
    
    return {
      parse: parse,
      stringify: stringify
    };
  })();
  
  
  /**
   * スクリプトファイルのクエリを取得
   */
  var scriptQuery = (function() {
    var scripts = document.getElementsByTagName('script');
    var index = scripts.length - 1;
    var myScript = scripts[index];
    var queryString = myScript.src.replace(/^[^\?]+\??/, '');

    var _query = qs.parse(queryString);
    
    return function() {
      return _query;
    }
  })();
  
  /**
   * 射影ヘルパ
   */
  function map(a, f) {
    var b = [];
    
    for (var i = 0, l = a.length; i != l; i++) {
      var v = a[i];
      var vv = f(v);
      b.push(vv);
    }
    
    return b;
  }
  
  
  /**
   * 商品閲覧履歴のモデルクラス
   */
  var History = function(items) {
    this.items = items;
  };
  
  History.get = function() {
    var history = [];
    var cookie = cookies.get(config.ITEM_HISTORY_COOKIE_NAME);
    if (cookie) {
      try {
        var items = qs.parse(cookie).getArray('item');
        history = map(items, function(s) {
          q = qs.parse(decodeURIComponent(s));
          m = {};
          $.each(q.items, function() { m[this[0]] = this[1]; });
          return m;
        });
      } catch(e) { console.error('itemhistory.History.get catch', e); }
      
      // console.log('itemhisory.History.get - cookie=', history);
    }
    return new History(history);
  };
  
  
  History.prototype = {
    register: function(item) {
      var items = this.items;
      
      item['session'] = cookies.get(config.SESSION_COOKIE_NAME, '');
      item['created_at'] = new Date().toISOString();

      var registered = -1;
      
      for (var i = 0, l = items.length; i != l; i++) {
        var it = items[i];
        if (it.jan == item.jan) {
          registered = i;
          break;
        }
      }
      
      // もうすでに登録済みの場合は削除
      if (registered != -1) {
        items.splice(registered, 1);
        console.log(items);
      }

      items.push(item);

      // 最大件数に配列をカット
      if (items.length >= config.STORE_MAX) {
        items = items.slice(-config.STORE_MAX);
      }      

      this.items = items;

      // console.log('itemhistory.History.register - items=', this.items);

      this.save();
    },
    
    save: function() {
      var payload = map(this.items, function(it) {
        var s = qs.stringify(it);
        return ['item', encodeURIComponent(s)];
      });
      
      payload = qs.stringify(payload);
      
      cookies.set(config.ITEM_HISTORY_COOKIE_NAME, payload, {
        expires: new Date(config.EXPIRED_AT).toUTCString()
      });
    }
  };
  
  
  /*
   * JANコードを履歴に保存する
   */
  function register(item) {
    var history = History.get();
    history.register(item);
  }
  
  
  /*
   * SKUページのJANコードを保存する
   */
  var sku = (function() {
    /**
     * 現在のURLからJANコードを取得する
     */
    function retriveJANByCurrentURL() {
      var pattern = /\/(.+?)\/(.+?)\/([0-9]+)\/?$|\/(.+?)\/([0-9]+)\/?$/;
      var matches = location.pathname.match(pattern); 

      if (matches === null) {
        return null;
      }

      var category1_list_path = matches[1];
      var category2_list_path = matches[2];
      var jan = matches[3];

      // 中カテゴリなしの場合の処理
      var isEmptyCategory2 = typeof category1_list_path === 'undefined' && typeof category2_list_path === 'undefined' && typeof jan === 'undefined';
      var hasCategory1 = typeof matches[4] === 'string' && typeof matches[5] === 'string';
      if (isEmptyCategory2 && hasCategory1) {
        category1_list_path = matches[4];
        category2_list_path = null;
        jan = matches[5];
      }

      return {
        jan: jan,
        category1_list_path: category1_list_path,
        category2_list_path: category2_list_path
      };
    }
    
    function visit() {
      var item = retriveJANByCurrentURL();
      if (!item) return;
      register(item);
    }
    
    return {
      visit: visit
    }
  })();
  
  
  var renderer = (function() {
    function getProduct(data) {             
      var pathname = '/' + data.category1_list_path + '/' + data.category2_list_path + '/' + data.jan + '/';
      if (data.category2_list_path === null || data.category2_list_path === 'null') {
        pathname = '/' + data.category1_list_path + '/' + data.jan + '/'
      }
      var image = config.IMAGE_BASE_URL + '/resource/products/images/' + data.jan + '_1_s.jpg';
      
      var query = {nid: 'hst_view'};
      
      var current = cookies.get(config.SESSION_COOKIE_NAME, '');
      
      // 閲覧時のセッションと現在のセッションが同じか？
      if (current == '' || current == data.session) {
        query.rv = 0;
      } else {
        query.rv = 1;
      }
      
      return {
        link: pathname + '?' + qs.stringify(query),
        image: image
      };
    }
    
    function load() {
      var d = new $.Deferred();
      
      +function(resolve, reject) {
        var history = History.get();
        
        // console.log('itemHistory.renderer.load history.items = ', history.items);
        
        var items = [].concat(history.items);
        items.reverse();
        items = items.slice(0, 8);
        items = map(items, function(it) {
          return getProduct(it);
        });
        
        resolve(items);
      }(d.resolve, d.reject);
      
      return d.promise();
    }
    
    function _render(sel, products) {
      // console.log('itemHistory.renderer._render - products = ', products);
      var $parent = $(sel);
      var html = '';
      
      if (products.length != 0) {
        html = (
          '<div>' +
            '<p>最近チェックした商品</p>' +
            '<ul>' +
              map(products, function(p) {
                return (
                  '<li class="checked">' +
                    '<a href="' + p.link + '">' +
                      '<img src="' + p.image + '" alt="">' +
                    '</a>' +
                  '</li>'
                );
              }).join('\n') +
            '</ul>' +
          '</div>'
        );
      }
      
      $parent.html(html);
    }
    
    function render(sel) {
      load().then(function(products) {
        _render(sel, products);
      }, function(error) {
        console.error(error);
      });
    }
    
    
    return {
      render: render
    };
  })();


  var exports = {
    visit: sku.visit,
    render: renderer.render
  }


  if (!window.itemHistory) window.itemHistory = exports;

$(function(){
	$('nav.utility .js-expandableButton').on('click',function(){
		itemHistory.render('.recentCheckedItems');
	});
});

}($j1111, window, this.document));

