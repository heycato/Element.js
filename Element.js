(function(name, global, definition){
	if (typeof module !== "undefined" && module.exports) { 
		module.exports = definition();
	} else if (typeof define === "function" && define.amd) {
		define(definition);
	} else { 
		global[name] = definition();
	}
})("Element", this, function(){
	"use strict";

	var pool = {},
		ids = {},
		groups = {},

		pixelValues = [ 'backgroundPositionX', 'backgroundPositionY', 'backgroundRepeatX', 'backgroundRepeatY', 'baselineShift', 'borderBottomLeftRadius', 'borderBottomRightRadius', 'borderBottomWidth', 'borderImageWidth', 'borderLeftWidth', 'borderRadius', 'borderRightWidth', 'borderSpacing', 'borderTopLeftRadius', 'borderTopRightRadius', 'borderTopWidth', 'borderWidth', 'bottom', 'fontSize', 'height', 'left', 'letterSpacing', 'lineHeight', 'margin', 'marginBottom', 'marginLeft', 'marginRight', 'marginTop', 'maxHeight', 'maxWidth', 'minHeight', 'minWidth', 'outlineOffset', 'outlineWidth', 'overflowX', 'overflowY', 'padding', 'paddingBottom', 'paddingLeft', 'paddingRight', 'paddingTop', 'right', 'strokeWidth', 'textIndent', 'textLineThroughWidth', 'textOverlineWidth', 'textUnderlineWidth', 'top', 'width', 'wordSpacing' ],
		properties = ["backfaceVisibility", "background", "backgroundAttachment", "backgroundBlendMode", "backgroundClip", "backgroundColor", "backgroundImage", "backgroundOrigin", "backgroundPosition", "backgroundPositionX", "backgroundPositionY", "backgroundRepeat", "backgroundRepeatX", "backgroundRepeatY", "backgroundSize", "border", "borderBottom", "borderBottomColor", "borderBottomLeftRadius", "borderBottomRightRadius", "borderBottomStyle", "borderBottomWidth", "borderCollapse", "borderColor", "borderImage", "borderImageOutset", "borderImageRepeat", "borderImageSlice", "borderImageSource", "borderImageWidth", "borderLeft", "borderLeftColor", "borderLeftStyle", "borderLeftWidth", "borderRadius", "borderRight", "borderRightColor", "borderRightStyle", "borderRightWidth", "borderSpacing", "borderStyle", "borderTop", "borderTopColor", "borderTopLeftRadius", "borderTopRightRadius", "borderTopStyle", "borderTopWidth", "borderWidth", "bottom", "boxShadow", "boxSizing", "bufferedRendering", "clear", "color", "content", "cursor", "direction", "display", "float", "font", "fontFamily", "fontKerning", "fontSize", "fontStretch", "fontStyle", "fontVariant", "fontWeight", "height", "imageRendering", "left", "letterSpacing", "lineHeight", "listStyle", "listStyleImage", "listStylePosition", "listStyleType", "margin", "marginBottom", "marginLeft", "marginRight", "marginTop", "mask", "maskType", "maxHeight", "maxWidth", "maxZoom", "minHeight", "minWidth", "minZoom", "opacity", "order", "orientation", "outline", "outlineColor", "outlineOffset", "outlineStyle", "outlineWidth", "overflow", "overflowWrap", "overflowX", "overflowY", "padding", "paddingBottom", "paddingLeft", "paddingRight", "paddingTop", "page", "pageBreakAfter", "paintOrder", "pointerEvents", "position", "resize", "right", "size", "src", "stroke", "strokeDasharray", "strokeDashoffset", "strokeLinecap", "strokeLinejoin", "strokeMiterlimit", "strokeOpacity", "strokeWidth", "tabSize", "tableLayout", "textAlign", "textAnchor", "textDecoration", "textIndent", "textLineThroughColor", "textLineThroughMode", "textLineThroughStyle", "textLineThroughWidth", "textOverflow", "textOverlineColor", "textOverlineMode", "textOverlineStyle", "textOverlineWidth", "textRendering", "textShadow", "textTransform", "textUnderlineColor", "textUnderlineMode", "textUnderlineStyle", "textUnderlineWidth", "top", "transform", "transformOrigin", "transformStyle", "transition", "transitionDelay", "transitionDuration", "transitionProperty", "transitionTimingFunction", "userZoom", "verticalAlign", "visibility", "webkitBackfaceVisibility", "webkitBoxShadow", "webkitFilter", "webkitFontSmoothing", "webkitHighlight", "webkitTransformStyle", "webkitTransition", "webkitTransitionDelay", "webkitTransitionDuration", "webkitTransitionProperty", "webkitTransitionTimingFunction", "webkitUserDrag", "webkitUserModify", "webkitUserSelect", "whiteSpace", "width", "wordBreak", "wordSpacing", "wordWrap", "zIndex", "zoom"];

	function Element(type) {
		type = type || 'div';

		if(!(this instanceof Element)) {
			return new Element(type);
		}

		var element = _getElement(type);

		if(element instanceof Element) {
			_applyDefaultStyles(element.element);
			return element;
		}
		_applyDefaultStyles(element);

		this.element = element;
		this.element.proxy = this;
		this.style = element.style;
		this.children = [];
		this._listeners = [];
		this._attributes = {};
		this._properties = {};
	}

	Element.getElementById = function getElementById(id) {
		return ids[id];
	};

	Element.getElementsByGroup = function getElementsByGroup(group) {
		return groups[group];
	};

	Element.getPool = function getPool() {
		return pool;
	};

	Element.prototype = {

		add: function add() {
			var i = 0, l = arguments.length;
			for(; i < l; i++) {
				_addChild.apply(this, [arguments[i]]);
			}
			return this.children;
		},

		remove: function remove() {
			var i = arguments.length;
			while(i --) {
				var el = arguments[i],
					j = this.children.indexOf(el);
				if(j > -1) {
					var orphan = this.children.splice(j, 1)[0];
					this.element.removeChild(el.element);
					_recycleElement(orphan);
				}
			}
		},

		listen: function listen(message, callback) {
			this.element.addEventListener(message, callback);
			this._listeners.push({message:message, callback:callback});
		},

		ignore: function ignore(message, callback) {
			this.element.removeEventListener(message, callback);
			var i = this._listeners.length;
			while(i--) {
				var listener = this._listeners[i];
				if(listener.message === message && listener.callback === callback) {
					this._listeners.splice(i, 1);
				}
			}
		},

		getAttribute: function getAttribute(attr) {
			return this._attributes[attr];
		},

		setAttribute: function setAttribute(attr, value) {
			this._attributes[attr] = value;
			this.element.setAttribute(attr, value);
		},

		removeAttribute: function removeAttribute(attr) {
			this._attributes[attr] = undefined;
			this.element.removeAttribute(attr);
		},

		get id() { return this._properties.id },
		set id(value) {
			var id = this._properties.id;
			if(id && id !== value) _unregisterIdMember(this);
			if(ids[value]) return console.warn('id:', value, 'is already being used');
			if(value) ids[value] = this;
			this._properties.id = value;
		},

		get group() { return this._properties.groups },
		set group(value) {
			if(!this._properties.groupId) this._properties.groupId = _randomId();
			if(!this._properties.groups) this._properties.groups = {};
			if(value && !groups[value]) groups[value] = {};
			if(value) groups[value][this._properties.groupId] = this;
			this._properties.groups[value] = this._properties.groupId;
		},

		get html() { return this._properties.html },
		set html(value) {
			this._properties.html;
			this.element.innerHTML = value;
		}

	};

	properties.forEach(function(prop) {
		Object.defineProperty(Element.prototype, prop, {
			get: function () { return this._properties[prop] },
			set: function (value) {
				this._properties[prop] = value;
				this.element.style[prop] = pixelValues.indexOf(prop) > -1 ? value + 'px' : value;
			}
		});
	});

	function _getElement(type) {
		if(pool[type] && pool[type].length > 0) {
			return pool[type].shift();
		} else if(typeof type === 'string') {
			return document.createElement(type);
		} else if(type.tagName) {
			return type;
		}
	}

	function _applyDefaultStyles(element) {
		element.style.position = 'absolute';
		element.style.display = 'block';
	}

	function _addChild(child) {
		if(!(child instanceof Element) && child.tagName) {
			child = new Element(child);
		}
		this.element.appendChild(child.element);
		this.children.push(child);
		return child;
	}

	function _unregisterIdMember(el) {
		ids[el.id] = undefined;
	}

	function _unregisterGroupMember(el) {
		for(var key in el.group) {
			delete groups[key][el._properties.groupId];
		}
		delete el._properties.groups;
	}

	function _cleanAttributes(el) {
		for(var key in el._attributes) {
			if(el._attributes[key]) {
				el.removeAttribute(key);
				el._attributes[key] = undefined;
			}
		}
	}

	function _cleanProperties(el) {
		for(var key in el._properties) {
			if(el._properties[key]) {
				if(key === 'group') _unregisterGroupMember(el);
				if(key === 'id') _unregisterIdMember(el);
				el.element.removeAttribute('style');
				el._properties[key] = undefined;
			}
		}
	}

	function _removeListeners(el) {
		var i = el._listeners.length;
		while(i--) {
			var listener = el._listeners[i];
			el.ignore(listener.message, listener.callback);
			el._listeners.splice(i, 1);
		}
	}

	function _removechildren(el) {
		var i = el.children.length;
		while(i--) {
			var child = el.children[i];
			el.remove(child);
			el.children.splice(i, 1);
		}
		el.html = '';
	}

	function _cleanElement(el) {
		_cleanAttributes(el);
		_cleanProperties(el);
		_removeListeners(el);
		_removechildren(el);
	}

	function _recycleElement(el) {
		_cleanElement(el);
		var type = el.element.tagName.toLowerCase();
		if(!pool[type]) pool[type] = [];
		pool[type].push(el);
	}

	/** adapted from http://stackoverflow.com/questions/1349404/generate-a-string-of-5-random-characters-in-javascript answered by:CaffGeek */
	function _randomId() {
		var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+}{":?><-=[];,./¡™£¢∞§¶•ªº–≠œ∑´®†¥¨ˆøπ“‘«åß∂ƒ©˙∆˚¬…æΩ≈ç√∫˜µ≤≥÷⁄€‹›ﬁﬂ‡°·‚—±Œ„´‰ˇÁ¨ˆØ∏”’»ÅÍÎÏ˝ÓÔÒÚÆ¸˛Ç◊ı˜Â¯˘¿',
			randStr = '',
			i = 6;
		while(i--) {
			var randPos = Math.floor(Math.random() * chars.length);
			randStr += chars.substring(randPos,randPos + 1);
		}
		return randStr;
	}

	return Element;

});