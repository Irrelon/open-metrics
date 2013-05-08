var IgeClass = require('./IgeClass'),
	IgeEventingClass = require('./IgeEventingClass');

var EndPoint = IgeEventingClass.extend({
	handle: function (req, res, method) {
		var i;
		
		// Normalise variables
		req.params = req.params || {};
		req.query = req.query || {};
		req.query._req = req;
		req.query._res = res;
		
		// Check for body data and mix with req.query
		if (req.body) {
			for (i in req.body) {
				if (req.body.hasOwnProperty(i)) {
					req.query[i] = req.body[i];
				}
			}
		}
		
		// Call handler method
		this[method](req.params, req.query, function (err, data) {
			data = data || {};
			data.err = err;
			res.send(data);
		});
	}
});

module.exports = EndPoint;