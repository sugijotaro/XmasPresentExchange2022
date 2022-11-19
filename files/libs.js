var jQuery = $;
/* ----------------------------------------------------------
jquery.inview
---------------------------------------------------------- */
!function(a){"function"==typeof define&&define.amd?define(["jquery"],a):"object"==typeof exports?module.exports=a(require("jquery")):a(jQuery)}(function(a){function i(){var b,c,d={height:f.innerHeight,width:f.innerWidth};return d.height||(b=e.compatMode,(b||!a.support.boxModel)&&(c="CSS1Compat"===b?g:e.body,d={height:c.clientHeight,width:c.clientWidth})),d}function j(){return{top:f.pageYOffset||g.scrollTop||e.body.scrollTop,left:f.pageXOffset||g.scrollLeft||e.body.scrollLeft}}function k(){if(b.length){var e=0,f=a.map(b,function(a){var b=a.data.selector,c=a.$element;return b?c.find(b):c});for(c=c||i(),d=d||j();e<b.length;e++)if(a.contains(g,f[e][0])){var h=a(f[e]),k={height:h[0].offsetHeight,width:h[0].offsetWidth},l=h.offset(),m=h.data("inview");if(!d||!c)return;l.top+k.height>d.top&&l.top<d.top+c.height&&l.left+k.width>d.left&&l.left<d.left+c.width?m||h.data("inview",!0).trigger("inview",[!0]):m&&h.data("inview",!1).trigger("inview",[!1])}}}var c,d,h,b=[],e=document,f=window,g=e.documentElement;a.event.special.inview={add:function(c){b.push({data:c,$element:a(this),element:this}),!h&&b.length&&(h=setInterval(k,250))},remove:function(a){for(var c=0;c<b.length;c++){var d=b[c];if(d.element===this&&d.data.guid===a.guid){b.splice(c,1);break}}b.length||(clearInterval(h),h=null)}},a(f).on("scroll resize scrollstop",function(){c=d=null}),!g.addEventListener&&g.attachEvent&&g.attachEvent("onfocusin",function(){d=null})});


var serial_ = (function() {
	var c = function(_args) {
		this.args = _args;
		this.currentNo = 0;
		this.playingFlg = false;
		this.isPause = false;
	}
	var p = c.prototype;
	p.start = function( ) {
		if(! this.playingFlg){
			this.playingFlg = true;
			this.execute_core();
		}
	}
	p.execute_core = function ( ) {
		if (this.playingFlg) {
			if (this.currentNo < this.args.length) {
				var command = this.args[this.currentNo];
				if (typeof(command) != "number") {
					command();
					this.execute_next();
				}else {
					var this_ = this;
					setTimeout(function(){
						this_.execute_next()
					},command * 1000);
				}
			} else {
				this.funish();
			}
		}
	}
	p.execute_next = function  ( ) {
		if(this.isPause) return;
		if(this.playingFlg){
			this.currentNo++;
			this.execute_core();
		}
	}
	p.funish = function  ( ) {
		this.playingFlg = false;
		this.init();
	}
	p.pause = function  ( ) {
		this.isPause = true;
	}
	p.restart = function  ( ) {
		this.isPause = false;
		this.execute_next();
	}
	p.jump = function  ( _n) {
		this.currentNo = _n-1;
	}
	p.init = function  ( ) {
		this.playingFlg = false;
		this.currentNo = 0;
	}
	p.remove = function  ( ) {
		this.currentNo = 0;
		this.playingFlg = false;
	}
	return c;
})();