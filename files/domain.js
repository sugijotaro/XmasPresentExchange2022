/**
 * domain.js
 * @modified 2017/01/05
 */

(function($, window, document, undefined){
	
	// カートAPI用
	window.DOMAIN_API = (document.domain === 'www.starbucks.co.jp'
		|| document.domain === 'starbucks.co.jp'
		|| document.domain === 'login.starbucks.co.jp'
		|| document.domain === 'member.starbucks.co.jp'
		|| document.domain === 'store.starbucks.co.jp'
		|| document.domain === 'product.starbucks.co.jp'
		|| document.domain === 'card.starbucks.co.jp'
		|| document.domain === 'cart.starbucks.co.jp'
		|| document.domain === 'enq.starbucks.co.jp'
		|| document.domain === 'gift.starbucks.co.jp'
		|| document.domain === 'gac.starbucks.co.jp'
		|| document.domain === 'sbgc.starbucks.co.jp')
		? 'https://cart.starbucks.co.jp'
		: 'https://cart2.starbucks.co.jp';
		
  
  // 在庫問い合わせAPI用(CDN経由)
	window.DOMAIN_API_CF = (document.domain === 'www.starbucks.co.jp'
		|| document.domain === 'starbucks.co.jp'
		|| document.domain === 'login.starbucks.co.jp'
		|| document.domain === 'member.starbucks.co.jp'
		|| document.domain === 'store.starbucks.co.jp'
		|| document.domain === 'product.starbucks.co.jp'
		|| document.domain === 'card.starbucks.co.jp'
		|| document.domain === 'cart.starbucks.co.jp'
		|| document.domain === 'enq.starbucks.co.jp'
		|| document.domain === 'gift.starbucks.co.jp'
		|| document.domain === 'gac.starbucks.co.jp'
		|| document.domain === 'sbgc.starbucks.co.jp')
		? 'https://d11abxzrrvbz6o.cloudfront.net'
		: 'https://dwjw4x8nnai5d.cloudfront.net';
  

	// ログインAPI用など
	window.DOMAIN_WWW_API = (document.domain === 'www.starbucks.co.jp'
		|| document.domain === 'starbucks.co.jp'
		|| document.domain === 'login.starbucks.co.jp'
		|| document.domain === 'member.starbucks.co.jp'
		|| document.domain === 'store.starbucks.co.jp'
		|| document.domain === 'product.starbucks.co.jp'
		|| document.domain === 'card.starbucks.co.jp'
		|| document.domain === 'cart.starbucks.co.jp'
		|| document.domain === 'enq.starbucks.co.jp'
		|| document.domain === 'gift.starbucks.co.jp'
		|| document.domain === 'gac.starbucks.co.jp'
		|| document.domain === 'sbgc.starbucks.co.jp')
		? '//www.starbucks.co.jp'
		: (document.domain === 'st.starbucks.co.jp' || document.domain === 'dev.starbucks.co.jp') ? '//dev.starbucks.co.jp' 
		: (document.domain === 'st2.starbucks.co.jp' || document.domain === 'dev2.starbucks.co.jp') ? '//dev2.starbucks.co.jp' 
		: '//www2.starbucks.co.jp';

}(jQuery, window, this.document));