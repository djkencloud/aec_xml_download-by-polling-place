"use strict";

var _ = require('lodash');

var XMLToJSON = function() {

    this._obj =  {};
    this._nodeList = [];

    this.parseInit = function(nodeList, srcXML) {

        this._nodeList = nodeList;
        return this.parse(srcXML);

    };

    this.checkNodeList = function(name) {
        var match = false;
        for (var i = 0; i < this._nodeList.length; i++) {
            if (name === this._nodeList[i]) {
                match = true
            }
        }
        return match;
    };

    this.parse = function(xml) {

        //console.log('xml - ', xml)


        var data = {};

        //console.log('xml.nodeType ', xml.nodeType)

        var isText = xml.nodeType === 3;
        var isElement = xml.nodeType === 1;
        var body = xml.textContent && xml.textContent.trim();
        var hasChildren = xml.childNodes && xml.childNodes.length;
        var hasAttributes = xml.attributes && xml.attributes.length;


        // if it's text just return it
        if (isText) {
            return xml.nodeValue.trim();
        }

        // if it doesn't have any children or attributes, just return the contents
        if (!hasChildren && !hasAttributes) {
            return body;
        }

        // if it doesn't have children but _does_ have body content, we'll use that
        if (!hasChildren && body.length) {
            data.text = body;
        }

        // If the item is a span tag with nested crap - grab all the text data - kinda messy but Ok for this hansard shizzz.
        if (xml.nodeName == 'span' && body.length) {
            data.text = body;
        }


        // if it's an element with attributes, add them to data.attributes
        if (isElement && hasAttributes) {
            data.attributes = _.reduce(xml.attributes, function(obj, name, id) {
                var attr = xml.attributes.item(id);
                obj[attr.name] = attr.value;
                return obj;
            }, {});
        }


        // recursively call #parse over children, adding results to data
        _.each(xml.childNodes, function(child) {


            var name = child.nodeName;
            //console.log('name ', name)

            // if node type is a comment or an empty value - don't add to objects... stops end #text arrays
            if (child.nodeType === 8 || (child.nodeType === 3 && !/\S/.test(child.nodeValue))) {
                return;
            }

            // force some nodes to always be arrays - check if array is already there
            // allows us to easily loop over later instead of checking for objects/arrays.
            if (this.checkNodeList(name) && !_.isArray(data[name])) {
                data[name] = [];
                data[name].push(this.parse(child));
                return;
            }

            // if we've not come across a child with this nodeType, add it as an object
            // and return here
            if (!_.has(data, name)) {
                data[name] = this.parse(child);
                return;
            }

            // if we've encountered a second instance of the same nodeType, make our
            // representation of it an array
            if (!_.isArray(data[name])) {
                data[name] = [data[name]];
            }

            // and finally, append the new child
            data[name].push(this.parse(child));

        }.bind(this));

        // if we can, let's fold some attributes into the body
        _.each(data.attributes, function(value, key) {
            if (data[key] != null) { return; }
            data[key] = value;
            delete data.attributes[key];
        });

        // if data.attributes is now empty, get rid of it
        if (_.isEmpty(data.attributes)) { delete data.attributes; }

        // simplify to reduce number of final leaf nodes and return
        return this.flatten(data);
    };

    this.flatten = function(object) {
        var check = _.isPlainObject(object) && _.size(object) === 1;
        return check ? this.flatten(_.values(object)[0]) : object;
    };

};


module.exports = XMLToJSON;

