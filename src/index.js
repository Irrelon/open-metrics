require('../lib/IgePrimitives');

var IgeClass = require('../lib/IgeClass'),
	IgeEventingClass = require('../lib/IgeEventingClass');

var MetricsSrv = IgeEventingClass.extend({
	classId: 'App.EventSrv',
	
	init: function () {
		var self = this;
		
		this.options = {
			port: 8000,
			version: 'v1.1'
		};
		
		this.apiRootPath = '/' + this.options.version;
		
		this.http = require('http');
		this.querystring = require('querystring');
		this.async = require('async');
		this.express = require('express');
		this.route = this.express();
		this.crypto = require('crypto');
		this.exec = require('child_process').exec;
		this.fs = require('fs');
		this.urlUtil = require('url');
		this.monge = new (require('monge').MongeManager)();
		
		// Setup the object to contain endpoint instances
		this.endPoint = {};
		
		// Setup mongodb connection
		this.monge.connect([{
			name: 'metrics', host: 'localhost', db: 'metrics'
		}], function (err) {
			if (!err) {
				// Start the server
				self.log('DB Connected, Starting Server...');
				self.startServer();
			} else {
				// Kill this process and it will be restarted by forever
				self.log('Could not connect to DB!');
				process.exit();
			}
		});
	},
	
	startServer: function () {
		var self = this;
		
		// Setup endpoint objects
		//self.endPoint.action = require('./endPoint/action.js').setup(this);
		
		// Listen for connections
		
	},
	
	md5: function (str) {
		return this.crypto.createHash('md5').update(str).digest('hex');
	},
	
	unescape: function (query, key) {
		var self = this;
		
		if (query[key]) {
			if (!query.__unescaped || !query.__unescaped[key]) {
				query.__unescaped = query.__unescaped || {};
				query.__unescaped[key] = true;
				
				query[key] = self.querystring.unescape(query[key].replace(/\+/g, '%20'));
			}
		}
		
		return query[key];
	}
});

var metricsSrv = new MetricsSrv();