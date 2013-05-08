require('../../lib/IgePrimitives');

var EndPoint = require('../../lib/EndPoint');

var Routing = EndPoint.extend({
	setup: function (app) {
		var self = this;
		this.app = app;
		
		// Setup routes
		this.app.route.get(this.app.apiRootPath + '/session', function (req, res) { self.handle.apply(self, [req, res, 'create']); });
		
		return this;
	},
	
	create: function (params, query, reqRes, callback) {
		var self = this;
		
		if (!params._omi) {
			// Record the action
			self.app.monge.metrics.insert('session', {}, {}, function (err, sessionId) {
				if (!err && sessionId) {
					callback(false, {
						_omi: sessionId
					});
				} else {
					callback('Could not create new OMI: ' + err);
				}
			});
		} else {
			// The session endpoint was called with an existing session id so send it back again
			callback(false, {
				_omi: params._omi
			});
		}
	}
});

module.exports = new Routing();