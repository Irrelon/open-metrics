var IgeClass = require('./IgeClass'),
	IgeEventingClass = require('./IgeEventingClass');

var EndPoint = IgeEventingClass.extend({
	handle: function (req, res, method) {
		var i, reqRes = {};
		
		// Add the req and res to the reqRes variable
		reqRes.req = req;
		reqRes.res = res;
		
		// Normalise variables
		req.params = req.params || {};
		req.query = req.query || {};
		
		// Check for body data and mix with req.query
		if (req.body) {
			for (i in req.body) {
				if (req.body.hasOwnProperty(i)) {
					req.query[i] = req.body[i];
				}
			}
		}
		
		// Call handler method
		this[method](req.params, req.query, reqRes, function (err, data) {
			data = data || {};
			data.err = err;
			res.send(data);
		});
	}
});

module.exports = EndPoint;