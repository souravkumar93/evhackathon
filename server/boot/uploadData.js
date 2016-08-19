/**
 * This script is used to load data into the database for demo purposes.
 * It iterates through entries in a starting file (meta.json) and loads
 * the data corresponding to each entry synchronously.
 *
 * meta.json includes the context data as well that needs to be applied for each file entry.
 *
 *
 * Author: Ajith Vasudevan
 */

var fs = require('fs');
var async = require('async');
var loopback = require('loopback');
var debug = require('debug')('z-data-load');

// Base directory from where data needs to be loaded
// This folder needs to contain meta.json. See meta.json for format.
// The actual data (records in the form of JSON array) can be present
// either directly in this base directory, or in sub-dirs. The "files.file"
// property in meta.json needs to correspond to the relative path
// inside this base directory.
var dir = __dirname + '\\';

// Where it all starts
module.exports = function (app) {
	for(var i=0; i< process.argv.length; i++) {
		var val = process.argv[i];
		if(i > 1 && (val.toLowerCase() === "upload" || val.toLowerCase() === "--upload" || val.toLowerCase() === "-upload" || val.toLowerCase() === "--u" || val.toLowerCase() === "-u")) {
			app.once('booted', function() { // Listen for the "started" event
                if ('test' != process.env.NODE_ENV && 'production' != process.env.NODE_ENV) {
                	console.log("Load of data started");
                	load(app);
                }
			});
			return;
		}
    }
	//console.log("\n\nSkipping data load. (Use command-line parameter 'upload' or '--upload' or '-U' to enable upload)\n\n");
}

function load(app) {
    var models = ["Item", "Vendor", "Venue","Ticket","Role","snacksUser"];
	var filepath = ["Items.json","Vendor.json","Venue.json","ticket.json","roles.json","snacks-user.json"];
	
    async.eachSeries(models, function(modelName, callback){
        var model = loopback.findModel(modelName);
        console.log(dir + filepath[models.indexOf(modelName)]);
		var datatext = fs.readFileSync(dir + filepath[models.indexOf(modelName)], 'utf-8');
		var data = JSON.parse(datatext);
		model.create(data, function(err, data) {
	        if (!err) {
	            //console.log("DEBUG: (" + (currentcount) + " / " + filecount + ") Inserted " + data.length + " records in ", meta.contexts[entry.ctxId].tenantId, "."	+ entry.model);
	        }
	        else {
                console.log(err);
	            //console.error("ERROR: (" + (currentcount) + " / " + filecount + ") ", JSON.stringify(err));
	        }
            callback();
	    });
    })
	
}



