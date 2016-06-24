"use strict";

var _ = require('lodash');

var CreateReadableJSON = function() {


    this.change = function(orig) {

        var newJSON = {};

        // just get basic structure....

        newJSON.meta = {
            "evevntName": orig['MediaFeed']['Results']['eml:EventIdentifier']['eml:EventName'],
            "updated": orig['MediaFeed']['Cycle']['Created']
        };

        newJSON.house = {
            "name": orig['MediaFeed']['Results']['Election'][0]['eml:ElectionIdentifier']['eml:ElectionName'],
            "updated": orig['MediaFeed']['Results']['Election'][0]['Updated'],
            "divisionsTemp": orig['MediaFeed']['Results']['Election'][0]['House']['Contests'],
            "divisions": []
        };




        // loop through and fix and tidy up the json - remove all the crap and keep ...

        // DIVISONS
        _.each(newJSON.house.divisionsTemp, function(obj) {

            var tempObj = {};
            tempObj.name = obj['PollingDistrictIdentifier']['Name'];
            tempObj.id = obj['PollingDistrictIdentifier']['Id'];
            tempObj.state = obj['PollingDistrictIdentifier']['StateIdentifier'];

            tempObj.updated = obj['Updated'] ? obj['Updated'] : "";
            tempObj.declared =  obj['Declared'] ? obj['Declared'] : "";

            tempObj.pollingPlaces = _.map(obj['PollingPlaces'], function(pollObj) {

                var pollingTempObj = {};

                pollingTempObj.placeName = pollObj['PollingPlaceIdentifier']['Name'];
                pollingTempObj.placeId = pollObj['PollingPlaceIdentifier']['Id'];
                pollingTempObj.placeUpdated = pollObj['Updated']

                pollingTempObj.firstPref = _.map(pollObj['FirstPreferences']['Candidate'], function(pObj) {

                    return {
                        "candidateId" : pObj['eml:CandidateIdentifier'],
                        "votesTotal": pObj['Votes']['#text'],
                        "votesPercentage": pObj['Votes']['Percentage'],
                        "votesSwing": pObj['Votes']['Swing']
                    }
                });

                pollingTempObj.firstPrefInformal = {
                    "votesTotal": pollObj['FirstPreferences']['Informal']['#text'],
                    "votesPercentage": pollObj['FirstPreferences']['Informal']['Percentage'],
                    "votesSwing": pollObj['FirstPreferences']['Informal']['Swing']
                };

                //
                pollingTempObj.twoCandidate = [];

                if (pollObj['TwoCandidatePreferred'] && pollObj['TwoCandidatePreferred']['Candidate']) {

                    pollingTempObj.twoCandidate = _.map(obj['TwoCandidatePreferred']['Candidate'], function(cObj) {


                        return {
                            "candidateId": cObj['eml:CandidateIdentifier'],
                            "votesTotal": cObj['Votes']['#text'],
                            "votesPercentage": cObj['Votes']['Percentage'],
                            "votesSwing": cObj['Votes']['Swing']
                        }

                    });
                }

                return pollingTempObj;

            });

            newJSON.house.divisions.push(tempObj);

        });


        // delete temporary helpers...
        delete newJSON.house.divisionsTemp;


        return newJSON;

    }

};


module.exports = CreateReadableJSON;