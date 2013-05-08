var Omi = function (jQuery, options) {
	if (jQuery) {
		options = options || {};
		
		this._omi = '';
		this.jQuery = jQuery;
		this.apiHost = options.host || '';
		this.apiVersion = options.version || '1.0';
		this.apiEndPoint = '/v' + this.apiVersion;
		this.apiPort = options.port || 22595;
		
		// Add the jquery cookie plugin if it doesn't already exist
		this.cookiePlugin(jQuery);
		
		// Set the _omi based on cookie data
		var cookieOmi = jQuery.cookie('_omi');
		
		if (cookieOmi) {
			this._omi = cookieOmi;
		}
		
		// Hook onunload to send a session end
		jQuery(window).on('unload', this.unload);
		
		// Start
		this.start();
	} else {
		// No jQuery passed, fail silently
	}
};

Omi.prototype._api = function (url, data, type, options, callback) {
	if (this.jQuery) {
		var self = this;
		callback = callback || function () {};
		
		// Create an options object if not passed
		options = options || {};
		
		// Default to async mode
		if (typeof(options.async) === 'undefined') {
			options.async = true;
		}
		
		// Default to a post request
		if (typeof(type) === 'undefined') {
			type = 'POST';
		}
		
		console.log('OMI calling: ' + self.apiHost + ':' + self.apiPort + self.apiEndPoint + url);
		
		self.jQuery.ajax({
			url: self.apiHost + ':' + self.apiPort + self.apiEndPoint + url,
			async: options.async,
			data: data,
			global: false,
			type: type.toUpperCase(),
			dataType : 'json',
			success: function (data, status, jqXHR) {
				if (data) {
					if (callback) { callback.apply(self, [data.err, data]); }
				} else {
					if (callback) { callback(false); }
				}
			},
			error: function (jqXHR, status, err) {
				if (callback) {
					callback('XHR failure, is internet available? Is API running?', err);
				}
			}
		});
	}
};

Omi.prototype.session = function (callback) {
	if (this.jQuery) {
		var self = this;
		callback = callback || function () {};
		
		// Check if we already have a session id or not
		if (!self._omi) {
			self._api('/session', {}, 'GET', {}, function (err, data) {
				if (!err && data) {
					// Set cookie
					jQuery.cookie('_omi', data._omi);
					
					// Store id
					self._omi = data._omi;
					
					// Callback
					callback(false, self._omi);
				} else {
					callback('Could not get OMI: ' + err);
				}
			});
		} else {
			callback(false, self._omi);
		}
	}
};

Omi.prototype.globalData = function (data) {
	this._globalData = data;
};

Omi.prototype.action = function (name, data, options, callback) {
	if (this.jQuery) {
		var self = this;
		callback = callback || function () {};
		data = data || {};
		
		// Add some data
		data.href = window.location.href;
		
		// Augment with the global session record data
		if (self._globalData) {
			for (var i in self._globalData) {
				if (self._globalData.hasOwnProperty(i)) {
					data[i] = self._globalData[i];
				}
			}
		}
		
		if (self._omi) {
			self._api('/action/' + self._omi + '/' + name, data, 'POST', options, callback);
		} else {
			callback('No OMI, cannot log action.');
		}
	}
};

Omi.prototype.start = function () {
	var self = this;
	
	if (!self._omi) {
		// Get a new session
		self.session(function (err, _omi) {
			if (!err) {
				// Register a session start action
				self.action('start');
			}
		});
	} else {
		self.action('continue');
	}
};

Omi.prototype.unload = function () {
	// Register a session unload action
	self.action('unload', {}, {
		async: false
	});
};

Omi.prototype.cookiePlugin = function (jQuery) {
	// Enable the jquery cookie plugin
	/*!
	 * jQuery Cookie Plugin v1.3.1
	 * https://github.com/carhartl/jquery-cookie
	 *
	 * Copyright 2013 Klaus Hartl
	 * Released under the MIT license
	 */
	(function (factory) {
		if (typeof define === 'function' && define.amd) {
			// AMD. Register as anonymous module.
			define(['jquery'], factory);
		} else {
			// Browser globals.
			factory(jQuery);
		}
	}(function ($) {
	
		var pluses = /\+/g;
	
		function raw(s) {
			return s;
		}
	
		function decoded(s) {
			return decodeURIComponent(s.replace(pluses, ' '));
		}
	
		function converted(s) {
			if (s.indexOf('"') === 0) {
				// This is a quoted cookie as according to RFC2068, unescape
				s = s.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
			}
			try {
				return config.json ? JSON.parse(s) : s;
			} catch(er) {}
		}
	
		var config = $.cookie = function (key, value, options) {
	
			// write
			if (value !== undefined) {
				options = $.extend({}, config.defaults, options);
	
				if (typeof options.expires === 'number') {
					var days = options.expires, t = options.expires = new Date();
					t.setDate(t.getDate() + days);
				}
	
				value = config.json ? JSON.stringify(value) : String(value);
	
				return (document.cookie = [
					config.raw ? key : encodeURIComponent(key),
					'=',
					config.raw ? value : encodeURIComponent(value),
					options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
					options.path    ? '; path=' + options.path : '',
					options.domain  ? '; domain=' + options.domain : '',
					options.secure  ? '; secure' : ''
				].join(''));
			}
	
			// read
			var decode = config.raw ? raw : decoded;
			var cookies = document.cookie.split('; ');
			var result = key ? undefined : {};
			for (var i = 0, l = cookies.length; i < l; i++) {
				var parts = cookies[i].split('=');
				var name = decode(parts.shift());
				var cookie = decode(parts.join('='));
	
				if (key && key === name) {
					result = converted(cookie);
					break;
				}
	
				if (!key) {
					result[name] = converted(cookie);
				}
			}
	
			return result;
		};
	
		config.defaults = {};
	
		$.removeCookie = function (key, options) {
			if ($.cookie(key) !== undefined) {
				// Must not alter options, thus extending a fresh object...
				$.cookie(key, '', $.extend({}, options, { expires: -1 }));
				return true;
			}
			return false;
		};
	
	}));
};