var Omi = function (jQuery) {
	if (jQuery) {
		this._omi = '';
		this.jQuery = jQuery;
		this.apiHost = '';
		this.apiVersion = '1.0';
		this.apiEndPoint = '/v' + this.apiVersion;
		this.apiPort = 22595;
	} else {
		// No jQuery passed, fail silently
	}
};

Omi.prototype._api = function (url, data, type, options, callback) {
	if (this.jQuery) {
		var self = this;
		
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
		
		self.jQuery.ajax({
			url: this.apiHost + ':' + self.apiPort + self.apiEndPoint + url,
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
		
		// Check if we already have a session id or not
		if (!self._omi) {
			self._api('/session', {}, 'GET', {}, function (err, data) {
				if (!err && data) {
					self._omi = data._omi;
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

Omi.prototype.action = function (name, data, callback) {
	if (this.jQuery) {
		var self = this;
		
		if (self._omi) {
			self._api(self.apiEndPoint + '/action/' + name, data, 'POST', {}, callback);
		} else {
			callback('No OMI, cannot log action.');
		}
	}
};

var omi = new Omi($);