"use strict";

var request = require('request');
var fs = require('fs');
var DOMParser = require('xmldom').DOMParser;
var Emitter = require("events").EventEmitter;

var xmlToJson = require('./xml-to-json');


var ParseXML = function() {

    var nodeList = [];
    var server = 'http://localhost:8888/extracted/';

    var parseToJson = new xmlToJson();

    this.eventBus = new Emitter();
    var evt = this.eventBus;

    this.init = function(path) {


        // updated to run from the file system
        fs.readFile(path, function(err, data) {
            if (err) {
                evt.emit('onParseXMLError', err);
            }

            console.log('data.toString() ', data.toString());
            var doc = new DOMParser().parseFromString(data.toString(), 'text/xml;charset=UTF-8');
            var jsonData = parseToJson.parseInit(nodeList, doc);

            evt.emit('onParseXMLComplete', jsonData);
        })



        /*
        request(server + path, onRequest);

        function onRequest(err, response, body) {

            if(err) {
                evt.emit('onParseXMLError', err);
            }

            var doc = new DOMParser().parseFromString(body, 'text/xml;charset=UTF-8');
            var jsonData = parseToJson.parseInit(nodeList, doc);

            evt.emit('onParseXMLComplete', jsonData);


        }*/
    }

};


module.exports = ParseXML;


