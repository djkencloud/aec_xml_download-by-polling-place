"use strict";

var DecompressZip = require('decompress-zip');
var Emitter = require("events").EventEmitter;


var DownloadZip = function(){

    this.eventBus = new Emitter();
    var evt = this.eventBus;

    var fileNameMatch = 'aec-mediafeed-results-standard-verbose';

    this.init = function(file) {

        var unzipper = new DecompressZip('downloads/'+file)

        unzipper.on('error', function (err) {
            evt.emit('onExtractError', err);
        });

        unzipper.on('extract', function (log) {

            var filePath = "";
            log.forEach(function(obj) {
                if (obj['deflated']) {
                    if (obj['deflated'].indexOf(fileNameMatch) >= 0) {
                        filePath = obj['deflated'];
                    }
                }
            });

            if (filePath.length == 0) {
                evt.emit('onExtractError', 'No file name match');
                return;
            };

            evt.emit('onExtractComplete', filePath)

        });

        unzipper.on('progress', function (fileIndex, fileCount) {
            console.log('Extracted file ' + (fileIndex + 1) + ' of ' + fileCount);
        });

        unzipper.extract({
            path: 'extracted',
            filter: function (file) {
                return file.type !== "SymbolicLink";
            }
        });

    }

};

module.exports = DownloadZip;