var MooTools = {
	version: '1.1.2.2'  // 2012.04
};
var mx_filename =/mootools-.*\.js/;
var mx_nullfilename ="null.js";
function $mx_defined(obj){
	return (obj != undefined);
};

function $mx_type(obj){
	if (!$mx_defined(obj)) return false;
	if (obj.mx_htmlElement) return 'element';
	var type = typeof obj;
	if (type == 'object' && obj.nodeName){
		switch(obj.nodeType){
			case 1: return 'element';
			case 3: return (/\S/).test(obj.nodeValue) ? 'textnode' : 'whitespace';
		}
	}
	if (type == 'object' || type == 'function'){
		switch(obj.constructor){
			case Array: return 'array';
			case RegExp: return 'regexp';
			case MxClass: return 'class';
		}
		if (typeof obj.length == 'number'){
			if (obj.item) return 'collection';
			if (obj.callee) return 'arguments';
		}
	}
	return type;
};

function $mx_merge(){
	var mix = {};
	for (var i = 0; i < arguments.length; i++){
		for (var property in arguments[i]){
			var ap = arguments[i][property];
			var mp = mix[property];
			if (mp && $mx_type(ap) == 'object' && $mx_type(mp) == 'object') mix[property] = $mx_merge(mp, ap);
			else mix[property] = ap;
		}
	}
	return mix;
};


var $mx_extend = function(){
	var args = arguments;
	if (!args[1]) args = [this, args[0]];
	for (var property in args[1]) args[0][property] = args[1][property];
	return args[0];
};


var $mx_native = function(){
	for (var i = 0, l = arguments.length; i < l; i++){
		arguments[i].mx_extend = function(props){
			for (var prop in props){
				if (!this.prototype[prop]) this.prototype[prop] = props[prop];
				if (!this[prop]) this[prop] = $mx_native.generic(prop);
			}
		};
	}
};

$mx_native.generic = function(prop){
	return function(bind){
		return this.prototype[prop].apply(bind, Array.prototype.slice.call(arguments, 1));
	};
};

$mx_native(Function, Array, String, Number);


function $mx_chk(obj){
	return !!(obj || obj === 0);
};


function $mx_pick(obj, picked){
	return $mx_defined(obj) ? obj : picked;
};


function $random(min, max){
	return Math.floor(Math.random() * (max - min + 1) + min);
};


function $time(){
	return new Date().getTime();
};


function $mx_clear(timer){
	clearTimeout(timer);
	clearInterval(timer);
	return null;
};


var MxAbstract = function(obj){
	obj = obj || {};
	obj.mx_extend = $mx_extend;
	return obj;
};

//window, document

var MxWindow = new MxAbstract(window);
var MxDocument = new MxAbstract(document);
document.head = document.getElementsByTagName('head')[0];


window.xpath = !!(document.evaluate);
if (window.ActiveXObject) window.ie = window[window.XMLHttpRequest ? 'ie7' : 'ie6'] = true;
else if (document.childNodes && !document.all && !navigator.taintEnabled) window.webkit = window[window.xpath ? 'webkit420' : 'webkit419'] = true;
else if (document.getBoxObjectFor != null || window.mozInnerScreenX != null) window.gecko = true;


window.khtml = window.webkit;

Object.mx_extend = $mx_extend;



if (typeof HTMLElement == 'undefined'){
	var HTMLElement = function(){};
	if (window.webkit) document.createElement("iframe"); //fixes safari
	HTMLElement.prototype = (window.webkit) ? window["[[DOMElement.prototype]]"] : {};
}
HTMLElement.prototype.mx_htmlElement = function(){};


if (window.ie6) try {document.execCommand("BackgroundImageCache", false, true);} catch(e){};


var MxClass = function(properties){
	var klass = function(){
		return (arguments[0] !== null && this.initialize && $mx_type(this.initialize) == 'function') ? this.initialize.apply(this, arguments) : this;
	};
	$mx_extend(klass, this);
	klass.prototype = properties;
	klass.constructor = MxClass;
	return klass;
};

MxClass.mx_empty = function(){};

MxClass.prototype = {
	mx_extend: function(properties){
		var proto = new this(null);
		for (var property in properties){
			var pp = proto[property];
			proto[property] = MxClass.Merge(pp, properties[property]);
		}
		return new MxClass(proto);
	},

	mx_implement: function(){
		for (var i = 0, l = arguments.length; i < l; i++) $mx_extend(this.prototype, arguments[i]);
	}

};


MxClass.Merge = function(previous, current){
	if (previous && previous != current){
		var type = $mx_type(current);
		if (type != $mx_type(previous)) return current;
		switch(type){
			case 'function':
				var merged = function(){
					this.parent = arguments.callee.parent;
					return current.apply(this, arguments);
				};
				merged.parent = previous;
				return merged;
			case 'object': return $mx_merge(previous, current);
		}
	}
	return current;
};

var MxOptions = new MxClass({

	setOptions: function(){
		this.options = $mx_merge.apply(null, [this.options].mx_extend(arguments));
		if (this.mx_addEvent){
			for (var option in this.options){
				if ($mx_type(this.options[option] == 'function') && (/^on[A-Z]/).test(option)) this.mx_addEvent(option, this.options[option]);
			}
		}
		return this;
	}

});

Array.mx_extend({

	mx_forEach: function(fn, bind){
		for (var i = 0, j = this.length; i < j; i++) fn.call(bind, this[i], i, this);
	},

	mx_filter: function(fn, bind){
		var results = [];
		for (var i = 0, j = this.length; i < j; i++){
			if (fn.call(bind, this[i], i, this)) results.push(this[i]);
		}
		return results;
	},

	mx_map: function(fn, bind){
		var results = [];
		for (var i = 0, j = this.length; i < j; i++) results[i] = fn.call(bind, this[i], i, this);
		return results;
	},
	mx_every: function(fn, bind){
		for (var i = 0, j = this.length; i < j; i++){
			if (!fn.call(bind, this[i], i, this)) return false;
		}
		return true;
	},
	mx_some: function(fn, bind){
		for (var i = 0, j = this.length; i < j; i++){
			if (fn.call(bind, this[i], i, this)) return true;
		}
		return false;
	},
	mx_indexOf: function(item, from){
		var len = this.length;
		for (var i = (from < 0) ? Math.max(0, len + from) : from || 0; i < len; i++){
			if (this[i] === item) return i;
		}
		return -1;
	},

	mx_copy: function(start, length){
		start = start || 0;
		if (start < 0) start = this.length + start;
		length = length || (this.length - start);
		var newArray = [];
		for (var i = 0; i < length; i++) newArray[i] = this[start++];
		return newArray;
	},
	mx_remove: function(item){
		var i = 0;
		var len = this.length;
		while (i < len){
			if (this[i] === item){
				this.splice(i, 1);
				len--;
			} else {
				i++;
			}
		}
		return this;
	},

	mx_contains: function(item, from){
		return this.mx_indexOf(item, from) != -1;
	},
	mx_associate: function(keys){
		var obj = {}, length = Math.min(this.length, keys.length);
		for (var i = 0; i < length; i++) obj[keys[i]] = this[i];
		return obj;
	},
	mx_extend: function(array){
		for (var i = 0, j = array.length; i < j; i++) this.push(array[i]);
		return this;
	},
	mx_merge: function(array){
		for (var i = 0, l = array.length; i < l; i++) this.mx_include(array[i]);
		return this;
	},
	mx_include: function(item){
		if (!this.mx_contains(item)) this.push(item);
		return this;
	},
	mx_getRandom: function(){
		return this[$random(0, this.length - 1)] || null;
	},
	mx_getLast: function(){
		return this[this.length - 1] || null;
	}
});

//copies

Array.prototype.mx_each = Array.prototype.mx_forEach;
Array.mx_each = Array.mx_forEach;

function mx_DA(array){
	return Array.mx_copy(array);
};


function $mx_each(iterable, fn, bind){
	if (iterable && typeof iterable.length == 'number' && $mx_type(iterable) != 'object'){
		Array.mx_forEach(iterable, fn, bind);
	} else {
		 for (var name in iterable) fn.call(bind || iterable, iterable[name], name);
	}
};

/*compatibility*/

//Array.prototype.test = Array.prototype.mx_contains;

String.mx_extend({

	test: function(regex, params){
		return (($mx_type(regex) == 'string') ? new RegExp(regex, params) : regex).test(this);
	},

	toInt: function(){
		return parseInt(this, 10);
	},

	toFloat: function(){
		return parseFloat(this);
	},

	camelCase: function(){
		return this.replace(/-\D/g, function(match){
			return match.charAt(1).toUpperCase();
		});
	},

	hyphenate: function(){
		return this.replace(/\w[A-Z]/g, function(match){
			return (match.charAt(0) + '-' + match.charAt(1).toLowerCase());
		});
	},

	capitalize: function(){
		return this.replace(/\b[a-z]/g, function(match){
			return match.toUpperCase();
		});
	},

	trim: function(){
		return this.replace(/^\s+|\s+$/g, '');
	},

	clean: function(){
		return this.replace(/\s{2,}/g, ' ').trim();
	},

	rgbToHex: function(array){
		var rgb = this.match(/\d{1,3}/g);
		return (rgb) ? rgb.rgbToHex(array) : false;
	},

	hexToRgb: function(array){
		var hex = this.match(/^#?(\w{1,2})(\w{1,2})(\w{1,2})$/);
		return (hex) ? hex.slice(1).hexToRgb(array) : false;
	},

	mx_contains: function(string, s){
		return (s) ? (s + this + s).indexOf(s + string + s) > -1 : this.indexOf(string) > -1;
	},

	escapeRegExp: function(){
		return this.replace(/([.*+?^${}()|[\]\/\\])/g, '\\$1');
	}

});

Array.mx_extend({

	rgbToHex: function(array){
		if (this.length < 3) return false;
		if (this.length == 4 && this[3] == 0 && !array) return 'transparent';
		var hex = [];
		for (var i = 0; i < 3; i++){
			var bit = (this[i] - 0).toString(16);
			hex.push((bit.length == 1) ? '0' + bit : bit);
		}
		return array ? hex : '#' + hex.join('');
	},
	hexToRgb: function(array){
		if (this.length != 3) return false;
		var rgb = [];
		for (var i = 0; i < 3; i++){
			rgb.push(parseInt((this[i].length == 1) ? this[i] + this[i] : this[i], 16));
		}
		return array ? rgb : 'rgb(' + rgb.join(',') + ')';
	}

});


Function.mx_extend({

	mx_create: function(options){
		var fn = this;
		options = $mx_merge({
			'bind': fn,
			'event': false,
			'arguments': null,
			'delay': false,
			'periodical': false,
			'attempt': false
		}, options);
		if ($mx_chk(options.arguments) && $mx_type(options.arguments) != 'array') options.arguments = [options.arguments];
		return function(event){
			var args;
			if (options.event){
				event = event || window.event;
				args = [(options.event === true) ? event : new options.event(event)];
				if (options.arguments) args.mx_extend(options.arguments);
			}
			else args = options.arguments || arguments;
			var returns = function(){
				return fn.apply($mx_pick(options.bind, fn), args);
			};
			if (options.delay) return setTimeout(returns, options.delay);
			if (options.periodical) return setInterval(returns, options.periodical);
			if (options.attempt) try {return returns();} catch(err){return false;};
			return returns();
		};
	},

	mx_pass: function(args, bind){
		return this.mx_create({'arguments': args, 'bind': bind});
	},
	mx_attempt: function(args, bind){
		return this.mx_create({'arguments': args, 'bind': bind, 'attempt': true})();
	},
	mx_bind: function(bind, args){
		return this.mx_create({'bind': bind, 'arguments': args});
	},
	mx_bindAsEventListener: function(bind, args){
		return this.mx_create({'bind': bind, 'event': true, 'arguments': args});
	},

	mx_delay: function(delay, bind, args){
		return this.mx_create({'delay': delay, 'bind': bind, 'arguments': args})();
	},

	mx_periodical: function(interval, bind, args){
		return this.mx_create({'periodical': interval, 'bind': bind, 'arguments': args})();
	}

});


Number.mx_extend({

	toInt: function(){
		return parseInt(this);
	},
	toFloat: function(){
		return parseFloat(this);
	},
	limit: function(min, max){
		return Math.min(max, Math.max(min, this));
	},
	round: function(precision){
		precision = Math.pow(10, precision || 0);
		return Math.round(this * precision) / precision;
	},
	times: function(fn){
		for (var i = 0; i < this; i++) fn(i);
	}
});

var MxElement = new MxClass({

	initialize: function(el, props){
		if ($mx_type(el) == 'string'){
			if (window.ie && props && (props.name || props.type)){
				var name = (props.name) ? ' name="' + props.name + '"' : '';
				var type = (props.type) ? ' type="' + props.type + '"' : '';
				delete props.name;
				delete props.type;
				el = '<' + el + name + type + '>';
			}
			el = document.createElement(el);
		}
		el = mx_D(el);
		//@
		return (!props || !el) ? el : el.mx_set(props);
	}

});


var MxElements = new MxClass({

	initialize: function(elements){
		return (elements) ? $mx_extend(elements, this) : this;
	}

});

MxElements.mx_extend = function(props){
	for (var prop in props){
		this.prototype[prop] = props[prop];
		this[prop] = $mx_native.generic(prop);
	}
};

function mx_D(el){
	if (!el) return null;
	if (el.mx_htmlElement) return MxGarbage.mx_collect(el);
	if ([window, document].mx_contains(el)) return el;
	var type = $mx_type(el);
	if (type == 'string'){
		el = document.getElementById(el);
		type = (el) ? 'element' : false;
	}
	if (type != 'element') return null;
	if (el.mx_htmlElement) return MxGarbage.mx_collect(el);
	if (['object', 'embed'].mx_contains(el.tagName.toLowerCase())) return el;
	$mx_extend(el, MxElement.prototype);
	el.mx_htmlElement = function(){};
	return MxGarbage.mx_collect(el);
};


document.mx_getElementsBySelector = document.getElementsByTagName;

function mx_DD(){
	var elements = [];
	for (var i = 0, j = arguments.length; i < j; i++){
		var selector = arguments[i];
		switch($mx_type(selector)){
			case 'element': elements.push(selector);
			case 'boolean': break;
			case false: break;
			case 'string': selector = document.mx_getElementsBySelector(selector, true);
			default: elements.mx_extend(selector);
		}
	}
	return mx_DD.unique(elements);
};

mx_DD.unique = function(array){
	var elements = [];
	for (var i = 0, l = array.length; i < l; i++){
		if (array[i].$included) continue;
		var element = mx_D(array[i]);
		if (element && !element.$included){
			element.$included = true;
			elements.push(element);
		}
	}
	for (var n = 0, d = elements.length; n < d; n++) elements[n].$included = null;
	return new MxElements(elements);
};

MxElements.Multi = function(property){
	return function(){
		var args = arguments;
		var items = [];
		var elements = true;
		for (var i = 0, j = this.length, returns; i < j; i++){
			returns = this[i][property].apply(this[i], args);
			if ($mx_type(returns) != 'element') elements = false;
			items.push(returns);
		};
		return (elements) ? mx_DD.unique(items) : items;
	};
};

MxElement.mx_extend = function(properties){
	for (var property in properties){
		HTMLElement.prototype[property] = properties[property];
		MxElement.prototype[property] = properties[property];
		MxElement[property] = $mx_native.generic(property);
		var elementsProperty = (Array.prototype[property]) ? property + 'MxElements' : property;
		MxElements.prototype[elementsProperty] = MxElements.Multi(property);
	}
};


MxElement.mx_extend({

	mx_set: function(props){
		for (var prop in props){
			var val = props[prop];
			switch(prop){
				case 'styles': this.mx_setStyles(val); break;
				case 'events': if (this.mx_addEvents) this.mx_addEvents(val); break;
				case 'properties': this.mx_setProperties(val); break;
				default: this.mx_setProperty(prop, val);
			}
		}
		return this;
	},
	mx_inject: function(el, where){
		el = mx_D(el);
		switch(where){
			case 'before': el.parentNode.insertBefore(this, el); break;
			case 'after':
				var next = el.mx_getNext();
				if (!next) el.parentNode.appendChild(this);
				else el.parentNode.insertBefore(this, next);
				break;
			case 'top':
				var first = el.firstChild;
				if (first){
					el.insertBefore(this, first);
					break;
				}
			default: el.appendChild(this);
		}
		return this;
	},


	mx_injectBefore: function(el){
		return this.mx_inject(el, 'before');
	},


	mx_injectAfter: function(el){
		return this.mx_inject(el, 'after');
	},


	mx_injectInside: function(el){
		return this.mx_inject(el, 'bottom');
	},


	mx_injectTop: function(el){
		return this.mx_inject(el, 'top');
	},


	mx_adopt: function(){
		var elements = [];
		$mx_each(arguments, function(argument){
			elements = elements.concat(argument);
		});
		mx_DD(elements).mx_inject(this);
		return this;
	},


	mx_remove: function(){
		return this.parentNode.removeChild(this);
	},


	mx_clone: function(contents){
		var el = mx_D(this.cloneNode(contents !== false));
		if (!el.$events) return el;
		el.$events = {};
		for (var type in this.$events) el.$events[type] = {
			'keys': mx_DA(this.$events[type].keys),
			'values': mx_DA(this.$events[type].values)
		};
		return el.mx_removeEvents();
	},


	mx_replaceWith: function(el){
		el = mx_D(el);
		this.parentNode.replaceChild(el, this);
		return el;
	},


	mx_appendText: function(text){
		this.appendChild(document.createTextNode(text));
		return this;
	},


	mx_hasClass: function(className){
		return this.className.mx_contains(className, ' ');
	},


	mx_addClass: function(className){
		if (!this.mx_hasClass(className)) this.className = (this.className + ' ' + className).clean();
		return this;
	},


	mx_removeClass: function(className){
		this.className = this.className.replace(new RegExp('(^|\\s)' + className + '(?:\\s|$)'), '$1').clean();
		return this;
	},


	mx_toggleClass: function(className){
		return this.mx_hasClass(className) ? this.mx_removeClass(className) : this.mx_addClass(className);
	},

	mx_setStyle: function(property, value){
		switch(property){
			case 'opacity': return this.mx_setOpacity(parseFloat(value));
			case 'float': property = (window.ie) ? 'styleFloat' : 'cssFloat';
		}
		property = property.camelCase();
		switch($mx_type(value)){
			case 'number': if (!['zIndex', 'zoom'].mx_contains(property)) value += 'px'; break;
			case 'array': value = 'rgb(' + value.join(',') + ')';
		}
		this.style[property] = value;
		return this;
	},


	mx_setStyles: function(source){
		switch($mx_type(source)){
			case 'object': MxElement.setMany(this, 'mx_setStyle', source); break;
			case 'string': this.style.cssText = source;
		}
		return this;
	},


	mx_setOpacity: function(opacity){
		if (opacity == 0){
			if (this.style.visibility != "hidden") this.style.visibility = "hidden";
		} else {
			if (this.style.visibility != "visible") this.style.visibility = "visible";
		}
		if (!this.currentStyle || !this.currentStyle.hasLayout) this.style.zoom = 1;
		if (window.ie) this.style.filter = (opacity == 1) ? '' : "alpha(opacity=" + opacity * 100 + ")";
		this.style.opacity = this.$tmp.opacity = opacity;
		return this;
	},


	mx_getStyle: function(property){
		property = property.camelCase();
		var result = this.style[property];
		if (!$mx_chk(result)){
			if (property == 'opacity') return this.$tmp.opacity;
			result = [];
			for (var style in Element.Styles){
				if (property == style){
					MxElement.Styles[style].mx_each(function(s){
						var style = this.mx_getStyle(s);
						result.push(parseInt(style) ? style : '0px');
					}, this);
					if (property == 'border'){
						var every = result.mx_every(function(bit){
							return (bit == result[0]);
						});
						return (every) ? result[0] : false;
					}
					return result.join(' ');
				}
			}
			if (property.mx_contains('border')){
				if (MxElement.Styles.border.mx_contains(property)){
					return ['Width', 'Style', 'Color'].mx_map(function(p){
						return this.mx_getStyle(property + p);
					}, this).join(' ');
				} else if (MxElement.borderShort.mx_contains(property)){
					return ['Top', 'Right', 'Bottom', 'Left'].mx_map(function(p){
						return this.mx_getStyle('border' + p + property.replace('border', ''));
					}, this).join(' ');
				}
			}
			if (document.defaultView) result = document.defaultView.getComputedStyle(this, null).getPropertyValue(property.hyphenate());
			else if (this.currentStyle) result = this.currentStyle[property];
		}
		if (window.ie) result = MxElement.fixStyle(property, result, this);
		if (result && property.test(/color/i) && result.mx_contains('rgb')){
			return result.split('rgb').splice(1,4).mx_map(function(color){
				return color.rgbToHex();
			}).join(' ');
		}
		return result;
	},


	mx_getStyles: function(){
		return MxElement.getMany(this, 'mx_getStyle', arguments);
	},

	mx_walk: function(brother, start){
		brother += 'Sibling';
		var el = (start) ? this[start] : this[brother];
		while (el && $mx_type(el) != 'element') el = el[brother];
		return mx_D(el);
	},


	mx_getPrevious: function(){
		return this.mx_walk('previous');
	},


	mx_getNext: function(){
		return this.mx_walk('next');
	},


	mx_getFirst: function(){
		return this.mx_walk('next', 'firstChild');
	},


	mx_getLast: function(){
		return this.mx_walk('previous', 'lastChild');
	},


	mx_getParent: function(){
		return mx_D(this.parentNode);
	},


	mx_getChildren: function(){
		return mx_DD(this.childNodes);
	},


	mx_hasChild: function(el){
		return !!mx_DA(this.getElementsByTagName('*')).mx_contains(el);
	},


	mx_getProperty: function(property){
		var index = MxElement.Properties[property];
		if (index) return this[index];
		var flag = MxElement.PropertiesIFlag[property] || 0;
		if (!window.ie || flag) return this.getAttribute(property, flag);
		var node = this.attributes[property];
		return (node) ? node.nodeValue : null;
	},


	mx_removeProperty: function(property){
		var index = MxElement.Properties[property];
		if (index) this[index] = '';
		else this.removeAttribute(property);
		return this;
	},


	mx_getProperties: function(){
		return MxElement.getMany(this, 'mx_getProperty', arguments);
	},


	mx_setProperty: function(property, value){
		var index = MxElement.Properties[property];
		if (index) this[index] = value;
		else this.setAttribute(property, value);
		return this;
	},


	mx_setProperties: function(source){
		return MxElement.setMany(this, 'mx_setProperty', source);
	},


	mx_setHTML: function(){
		this.innerHTML = mx_DA(arguments).join('');
		return this;
	},


	mx_setText: function(text){
		var tag = this.mx_getTag();
		if (['style', 'script'].mx_contains(tag)){
			if (window.ie){
				if (tag == 'style') this.styleSheet.cssText = text;
				else if (tag ==  'script') this.mx_setProperty('text', text);
				return this;
			} else {
				this.removeChild(this.firstChild);
				return this.mx_appendText(text);
			}
		}
		this[$mx_defined(this.innerText) ? 'innerText' : 'textContent'] = text;
		return this;
	},


	mx_getText: function(){
		var tag = this.mx_getTag();
		if (['style', 'script'].mx_contains(tag)){
			if (window.ie){
				if (tag == 'style') return this.styleSheet.cssText;
				else if (tag ==  'script') return this.mx_getProperty('text');
			} else {
				return this.innerHTML;
			}
		}
		return ($mx_pick(this.innerText, this.textContent));
	},


	mx_getTag: function(){
		return this.tagName.toLowerCase();
	},


	mx_empty: function(){
		MxGarbage.trash(this.getElementsByTagName('*'));
		return this.mx_setHTML('');
	}

});

MxElement.fixStyle = function(property, result, element){
	if ($mx_chk(parseInt(result))) return result;
	if (['height', 'width'].mx_contains(property)){
		var values = (property == 'width') ? ['left', 'right'] : ['top', 'bottom'];
		var size = 0;
		values.mx_each(function(value){
			size += element.mx_getStyle('border-' + value + '-width').toInt() + element.mx_getStyle('padding-' + value).toInt();
		});
		return element['offset' + property.capitalize()] - size + 'px';
	} else if (property.test(/border(.+)Width|margin|padding/)){
		return '0px';
	}
	return result;
};

MxElement.Styles = {'border': [], 'padding': [], 'margin': []};
['Top', 'Right', 'Bottom', 'Left'].mx_each(function(direction){
	for (var style in MxElement.Styles) MxElement.Styles[style].push(style + direction);
});

MxElement.borderShort = ['borderWidth', 'borderStyle', 'borderColor'];

MxElement.getMany = function(el, method, keys){
	var result = {};
	$mx_each(keys, function(key){
		result[key] = el[method](key);
	});
	return result;
};

MxElement.setMany = function(el, method, pairs){
	for (var key in pairs) el[method](key, pairs[key]);
	return el;
};

MxElement.Properties = new MxAbstract({
	'class': 'className', 'for': 'htmlFor', 'colspan': 'colSpan', 'rowspan': 'rowSpan',
	'accesskey': 'accessKey', 'tabindex': 'tabIndex', 'maxlength': 'maxLength',
	'readonly': 'readOnly', 'frameborder': 'frameBorder', 'value': 'value',
	'disabled': 'disabled', 'checked': 'checked', 'multiple': 'multiple', 'selected': 'selected'
});
MxElement.PropertiesIFlag = {
	'href': 2, 'src': 2
};

MxElement.Methods = {
	Listeners: {
		mx_addListener: function(type, fn){
			if (this.addEventListener) this.addEventListener(type, fn, false);
			else this.attachEvent('on' + type, fn);
			return this;
		},

		mx_removeListener: function(type, fn){
			if (this.removeEventListener) this.removeEventListener(type, fn, false);
			else this.detachEvent('on' + type, fn);
			return this;
		}
	}
};

window.mx_extend(MxElement.Methods.Listeners);
document.mx_extend(MxElement.Methods.Listeners);
MxElement.mx_extend(MxElement.Methods.Listeners);

var MxGarbage = {

	elements: [],

	mx_collect: function(el){
		if (!el.$tmp){
			MxGarbage.elements.push(el);
			el.$tmp = {'opacity': 1};
		}
		return el;
	},

	trash: function(elements){
		for (var i = 0, j = elements.length, el; i < j; i++){
			if (!(el = elements[i]) || !el.$tmp) continue;
			if (el.$events) el.mx_fireEvent('trash').mx_removeEvents();
			for (var p in el.$tmp) el.$tmp[p] = null;
			for (var d in MxElement.prototype) el[d] = null;
			MxGarbage.elements[MxGarbage.elements.mx_indexOf(el)] = null;
			el.mx_htmlElement = el.$tmp = el = null;
		}
		MxGarbage.elements.mx_remove(null);
	},

	mx_empty: function(){
		MxGarbage.mx_collect(window);
		MxGarbage.mx_collect(document);
		MxGarbage.trash(MxGarbage.elements);
	}

};

window.mx_addListener('beforeunload', function(){
	window.mx_addListener('unload', MxGarbage.mx_empty);
	if (window.ie) window.mx_addListener('unload', CollectGarbage);
});


var MxEvent = new MxClass({

	initialize: function(event){
		if (event && event.$extended) return event;
		this.$extended = true;
		event = event || window.event;
		this.event = event;
		this.type = event.type;
		this.target = event.target || event.srcElement;
		if (this.target.nodeType == 3) this.target = this.target.parentNode;
		this.shift = event.shiftKey;
		this.control = event.ctrlKey;
		this.alt = event.altKey;
		this.meta = event.metaKey;
		if (['DOMMouseScroll', 'mousewheel'].mx_contains(this.type)){
			this.wheel = (event.wheelDelta) ? event.wheelDelta / 120 : -(event.detail || 0) / 3;
		} else if (this.type.mx_contains('key')){
			this.code = event.which || event.keyCode;
			for (var name in MxEvent.keys){
				if (MxEvent.keys[name] == this.code){
					this.key = name;
					break;
				}
			}
			if (this.type == 'keydown'){
				var fKey = this.code - 111;
				if (fKey > 0 && fKey < 13) this.key = 'f' + fKey;
			}
			this.key = this.key || String.fromCharCode(this.code).toLowerCase();
		} else if (this.type.test(/(click|mouse|menu)/)){
			this.page = {
				'x': event.pageX || event.clientX + document.documentElement.scrollLeft,
				'y': event.pageY || event.clientY + document.documentElement.scrollTop
			};
			this.client = {
				'x': event.pageX ? event.pageX - window.pageXOffset : event.clientX,
				'y': event.pageY ? event.pageY - window.pageYOffset : event.clientY
			};
			this.rightClick = (event.which == 3) || (event.button == 2);
			switch(this.type){
				case 'mouseover': this.relatedTarget = event.relatedTarget || event.fromElement; break;
				case 'mouseout': this.relatedTarget = event.relatedTarget || event.toElement;
			}
			this.fixRelatedTarget();
		}
		return this;
	},
	stop: function(){
		return this.stopPropagation().preventDefault();
	},
	stopPropagation: function(){
		if (this.event.stopPropagation) this.event.stopPropagation();
		else this.event.cancelBubble = true;
		return this;
	},
	preventDefault: function(){
		if (this.event.preventDefault) this.event.preventDefault();
		else this.event.returnValue = false;
		return this;
	}
});

MxEvent.fix = {

	relatedTarget: function(){
		if (this.relatedTarget && this.relatedTarget.nodeType == 3) this.relatedTarget = this.relatedTarget.parentNode;
	},

	relatedTargetGecko: function(){
		try {MxEvent.fix.relatedTarget.call(this);} catch(e){this.relatedTarget = this.target;}
	}

};

MxEvent.prototype.fixRelatedTarget = (window.gecko) ? MxEvent.fix.relatedTargetGecko : MxEvent.fix.relatedTarget;


MxEvent.keys = new MxAbstract({
	'enter': 13,
	'up': 38,
	'down': 40,
	'left': 37,
	'right': 39,
	'esc': 27,
	'space': 32,
	'backspace': 8,
	'tab': 9,
	'delete': 46
});

/*
Class: Element
	Custom class to allow all of its methods to be used with any DOM element via the dollar function <$>.
*/

MxElement.Methods.Events = {

	mx_addEvent: function(type, fn){
		this.$events = this.$events || {};
		this.$events[type] = this.$events[type] || {'keys': [], 'values': []};
		if (this.$events[type].keys.mx_contains(fn)) return this;
		this.$events[type].keys.push(fn);
		var realType = type;
		var custom = MxElement.Events[type];
		if (custom){
			if (custom.add) custom.add.call(this, fn);
			if (custom.map) fn = custom.map;
			if (custom.type) realType = custom.type;
		}
		if (!this.addEventListener) fn = fn.mx_create({'bind': this, 'event': true});
		this.$events[type].values.push(fn);
		return (MxElement.NativeEvents.mx_contains(realType)) ? this.mx_addListener(realType, fn) : this;
	},


	mx_removeEvent: function(type, fn){
		if (!this.$events || !this.$events[type]) return this;
		var pos = this.$events[type].keys.mx_indexOf(fn);
		if (pos == -1) return this;
		var key = this.$events[type].keys.splice(pos,1)[0];
		var value = this.$events[type].values.splice(pos,1)[0];
		var custom = MxElement.Events[type];
		if (custom){
			if (custom.remove) custom.remove.call(this, fn);
			if (custom.type) type = custom.type;
		}
		return (MxElement.NativeEvents.mx_contains(type)) ? this.mx_removeListener(type, value) : this;
	},

	mx_addEvents: function(source){
		return MxElement.setMany(this, 'mx_addEvent', source);
	},

	mx_removeEvents: function(type){
		if (!this.$events) return this;
		if (!type){
			for (var evType in this.$events) this.mx_removeEvents(evType);
			this.$events = null;
		} else if (this.$events[type]){
			this.$events[type].keys.mx_each(function(fn){
				this.mx_removeEvent(type, fn);
			}, this);
			this.$events[type] = null;
		}
		return this;
	},

	mx_fireEvent: function(type, args, delay){
		if (this.$events && this.$events[type]){
			var a = this.$events[type];
			this.$events[type].keys.mx_each(function(fn){
				fn.mx_create({'bind': this, 'delay': delay, 'arguments': args})();
			}, this);
		}
		return this;
	},

	mx_cloneEvents: function(from, type){
		if (!from.$events) return this;
		if (!type){
			for (var evType in from.$events) this.mx_cloneEvents(from, evType);
		} else if (from.$events[type]){
			from.$events[type].keys.mx_each(function(fn){
				this.mx_addEvent(type, fn);
			}, this);
		}
		return this;
	}

};

window.mx_extend(MxElement.Methods.Events);
document.mx_extend(MxElement.Methods.Events);
MxElement.mx_extend(MxElement.Methods.Events);

/* Section: Custom Events */

MxElement.Events = new MxAbstract({

	'mouseenter': {
		type: 'mouseover',
		map: function(event){
			event = new MxEvent(event);
			if (event.relatedTarget != this && !this.mx_hasChild(event.relatedTarget)) this.mx_fireEvent('mouseenter', event);
		}
	},


	'mouseleave': {
		type: 'mouseout',
		map: function(event){
			event = new MxEvent(event);
			if (event.relatedTarget != this && !this.mx_hasChild(event.relatedTarget)) this.mx_fireEvent('mouseleave', event);
		}
	},

	'mousewheel': {
		type: (window.gecko) ? 'DOMMouseScroll' : 'mousewheel'
	}

});

MxElement.NativeEvents = [
	'click', 'dblclick', 'mouseup', 'mousedown', //mouse buttons
	'mousewheel', 'DOMMouseScroll', //mouse wheel
	'mouseover', 'mouseout', 'mousemove', //mouse movement
	'keydown', 'keypress', 'keyup', //keys
	'load', 'unload', 'beforeunload', 'resize', 'move', //window
	'focus', 'blur', 'change', 'submit', 'reset', 'select', //forms elements
	'error', 'abort', 'contextmenu', 'scroll' //misc
];


Function.mx_extend({

	mx_bindWithEvent: function(bind, args){
		return this.mx_create({'bind': bind, 'arguments': args, 'event': MxEvent});
	}

});

MxElements.mx_extend({

	mx_filterByTag: function(tag){
		return new MxElements(this.mx_filter(function(el){
			return (MxElement.mx_getTag(el) == tag);
		}));
	},


	mx_filterByClass: function(className, nocash){
		var elements = this.mx_filter(function(el){
			return (el.className && el.className.mx_contains(className, ' '));
		});
		return (nocash) ? elements : new MxElements(elements);
	},


	mx_filterById: function(id, nocash){
		var elements = this.mx_filter(function(el){
			return (el.id == id);
		});
		return (nocash) ? elements : new MxElements(elements);
	},


	mx_filterByAttribute: function(name, operator, value, nocash){
		var elements = this.mx_filter(function(el){
			var current = MxElement.mx_getProperty(el, name);
			if (!current) return false;
			if (!operator) return true;
			switch(operator){
				case '=': return (current == value);
				case '*=': return (current.mx_contains(value));
				case '^=': return (current.substr(0, value.length) == value);
				case '$=': return (current.substr(current.length - value.length) == value);
				case '!=': return (current != value);
				case '~=': return current.mx_contains(value, ' ');
			}
			return false;
		});
		return (nocash) ? elements : new MxElements(elements);
	}

});

/**
function $E(selector, filter){
	return (D(filter) || document).getElement(selector);
};
function $ES(selector, filter){
	return (D(filter) || document).mx_getElementsBySelector(selector);
};
**/

// keep
mx_DD.shared = {
	'regexp': /^(\w*|\*)(?:#([\w-]+)|\.([\w-]+))?(?:\[(\w+)(?:([!*^$]?=)["']?([^"'\]]*)["']?)?])?$/,

	'xpath': {

		getParam: function(items, context, param, i){
			var temp = [context.namespaceURI ? 'xhtml:' : '', param[1]];
			if (param[2]) temp.push('[@id="', param[2], '"]');
			if (param[3]) temp.push('[contains(concat(" ", @class, " "), " ', param[3], ' ")]');
			if (param[4]){
				if (param[5] && param[6]){
					switch(param[5]){
						case '*=': temp.push('[contains(@', param[4], ', "', param[6], '")]'); break;
						case '^=': temp.push('[starts-with(@', param[4], ', "', param[6], '")]'); break;
						case '$=': temp.push('[substring(@', param[4], ', string-length(@', param[4], ') - ', param[6].length, ' + 1) = "', param[6], '"]'); break;
						case '=': temp.push('[@', param[4], '="', param[6], '"]'); break;
						case '!=': temp.push('[@', param[4], '!="', param[6], '"]');
					}
				} else {
					temp.push('[@', param[4], ']');
				}
			}
			items.push(temp.join(''));
			return items;
		},

		getItems: function(items, context, nocash){
			var elements = [];
			var xpath = document.evaluate('.//' + items.join('//'), context, mx_DD.shared.resolver, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
			for (var i = 0, j = xpath.snapshotLength; i < j; i++) elements.push(xpath.snapshotItem(i));
			return (nocash) ? elements : new MxElements(elements.mx_map(mx_D));
		}

	},

	'normal': {

		getParam: function(items, context, param, i){
			if (i == 0){
				if (param[2]){
					var el = context.mx_getElementById(param[2]);
					if (!el || ((param[1] != '*') && (MxElement.mx_getTag(el) != param[1]))) return false;
					items = [el];
				} else {
					items = mx_DA(context.getElementsByTagName(param[1]));
				}
			} else {
				items = mx_DD.shared.getElementsByTagName(items, param[1]);
				if (param[2]) items = MxElements.mx_filterById(items, param[2], true);
			}
			if (param[3]) items = MxElements.mx_filterByClass(items, param[3], true);
			if (param[4]) items = MxElements.mx_filterByAttribute(items, param[4], param[5], param[6], true);
			return items;
		},

		getItems: function(items, context, nocash){
			return (nocash) ? items : mx_DD.unique(items);
		}
	},
	resolver: function(prefix){
		return (prefix == 'xhtml') ? 'http://www.w3.org/1999/xhtml' : false;
	},

	getElementsByTagName: function(context, tagName){
		var found = [];
		for (var i = 0, j = context.length; i < j; i++) found.mx_extend(context[i].getElementsByTagName(tagName));
		return found;
	}

};

mx_DD.shared.method = (window.xpath) ? 'xpath' : 'normal';


MxElement.Methods.Dom = {


	mx_getElements: function(selector, nocash){
		var items = [];
		selector = selector.trim().split(' ');
		for (var i = 0, j = selector.length; i < j; i++){
			var sel = selector[i];
			var param = sel.match(mx_DD.shared.regexp);
			if (!param) break;
			param[1] = param[1] || '*';
			var temp = mx_DD.shared[mx_DD.shared.method].getParam(items, this, param, i);
			if (!temp) break;
			items = temp;
		}
		return mx_DD.shared[mx_DD.shared.method].getItems(items, this, nocash);
	},
	mx_getElement: function(selector){
		return mx_D(this.mx_getElements(selector, true)[0] || false);
	},
	mx_getElementsBySelector: function(selector, nocash){
		var elements = [];
		selector = selector.split(',');
		for (var i = 0, j = selector.length; i < j; i++) elements = elements.concat(this.mx_getElements(selector[i], true));
		return (nocash) ? elements : mx_DD.unique(elements);
	}

};

MxElement.mx_extend({

	mx_getElementById: function(id){
		var el = document.getElementById(id);
		if (!el) return false;
		for (var parent = el.parentNode; parent != this; parent = parent.parentNode){
			if (!parent) return false;
		}
		return el;
	}/*compatibility*/,

	mx_getElementsByClassName: function(className){
		return this.mx_getElements('.' + className);
	}

	/*end compatibility*/

});

document.mx_extend(MxElement.Methods.Dom);
MxElement.mx_extend(MxElement.Methods.Dom);

MxElement.Events.domready = {

	add: function(fn){
		if (window.loaded){
			fn.call(this);
			return;
		}
		var domReady = function(){
			if (window.loaded) return;
			window.loaded = true;
			window.timer = $mx_clear(window.timer);
			this.mx_fireEvent('domready');
		}.mx_bind(this);
		if (document.readyState && window.webkit){
			window.timer = function(){
				if (['loaded','complete'].mx_contains(document.readyState)) domReady();
			}.mx_periodical(50);
		} else if (document.readyState && window.ie){
			if (!mx_D('ie_ready')){
				// search this file
				var null_path = '://0';
				var scrList = document.mx_getElements("script");
				var i,len,target,scrIdx,scrDir,scrSrc;
				len = scrList.length;
				for(i=0; i<len; i++){
					target = scrList[i];
					scrSrc = target.mx_getProperty('src');
					if(!scrSrc) continue;
					scrIdx = scrSrc.search(mx_filename);
					if(scrIdx!=-1){
						scrDir = scrSrc.substring(0,scrIdx);
						null_path = scrDir + mx_nullfilename;
						break;
					}

				}

				var src = (window.location.protocol == 'https:') ? null_path : 'javascript:void(0)';
				document.write('<script id="ie_ready" defer src="' + src + '"><\/script>');
				mx_D('ie_ready').onreadystatechange = function(){
					if (this.readyState == 'complete') domReady();
				};




			}
		} else {
			window.mx_addListener("load", domReady);
			document.mx_addListener("DOMContentLoaded", domReady);
		}
	}

};
function $mx_try(){
	for (var i = 0, l = arguments.length; i < l; i++){
		try {
			return arguments[i]();
		} catch(e){}
	}
	return null;
};

/*compatibility*/

window.onDomReady = function(fn){
	return this.mx_addEvent('domready', fn);
};

/*end compatibility*/

