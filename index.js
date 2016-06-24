"use strict";

// vendor
var fs = require('fs');
var http = require('http');
var _ = require('lodash');

var ParseXML = require('./parse-xml');
var CreateReadableJSON = require('./create-readable-json');

// parse XML
var parseXML = new ParseXML();

// a little helper to parse JSON into something a bit nicer
var createReadable = new CreateReadableJSON();



parseXML.eventBus.on('onParseXMLComplete', onParseXMLCompleteHandler);
parseXML.eventBus.on('onParseXMLError', onParseXMLErrorHandler);



function onExtractErrorHandler(err) {
    console.log('Zip extract error ', err)
}

function onParseXMLCompleteHandler(data) {
    console.log('On Parse XML ', data);

    var changeJSON = createReadable.change(data);
    writeToFile(changeJSON);
}
function onParseXMLErrorHandler(err) {
    console.log('On Parse XML error ', err);
}

var jsonString = {};
function writeToFile(data) {

    // save out each individual place file...
    _.each(data.house.divisions, function(obj) {

        var file = 'json/' + obj.id + '.json'

        var str = JSON.stringify(obj);

        fs.writeFile(file, str, {}, function() {
            console.log('done ', file)
        })

    }.bind(this))

    // save out the lot
    var file = 'json/data.json'
    var str = JSON.stringify(data);

    fs.writeFile(file, str, {}, function() {
        console.log('done')
    })

}


// bypass downloading and extracting the zip file and just goto xml to json conversion.
//parseXML.init('aec-mediafeed-results-detailed-verbose-20499.xml');
parseXML.init('aec-mediafeed-results-detailed-verbose-17496.xml');
