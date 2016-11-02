/**
 * Promise with jittered backoff
 * https://github.com/loretoparisi/promise-backoff
 * @2016 Loreto Parisi (loretoparisi at gmail dot com)
*/
(function() {

// this simple example shows how to initialize and
// load a jittered backoff on list of api endpoint to scramble
// and to avoid to send a api calls storm on the servers
// example inspired to `How to search for a user by name using Spotify Web API`
// http://stackoverflow.com/questions/36536245/how-to-search-for-a-user-by-name-using-spotify-web-api/36537774#36537774
//
// 1- we search for spotify playlist api
// 2- we aggregate playlists results
// 3- we gather user profiles api for the first playlists results
// 4- we aggregate users results in a json

var PromiseBackoff = require('../lib/index');
var API = require('./api');

function makeid() {
    var text = "", possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for( var i=0; i < 10; i++ ) text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}
function arrayRangeMap(a,block){var c=[];while(a--) c[a]=block() ; return c};


// create a spotify api, port 80, timeout, ssl, json, debug
var api = new API("api.spotify.com", 80, 1000 * 10, true, false, true);
// 1- we search for spotify playlist
var calls = [
    { method: "/v1/search", params : {type : "playlist", q : "doom metal"}, headers : {} },
    { method: "/v1/search", params: {type : "playlist", q : "Adele"}, headers : {} }
];
var backoffOptions = {
    randomisationFactor: 0.11304999836,
    initialDelay: 1000 * 1, // initial time msec
    maxDelay: 1000 * 3, // maximum time msec
    factor : Math.E // Exponential Timer Grow Factor
};
PromiseBackoff(backoffOptions, calls
, function(item,index,resolve,reject) {
    console.log("item %s/%s", index, calls.length);
    api.RequestGet(item.method, item.headers, item.params
        , function(response) { // success

            var profileUrls = response.playlists.items.map(function(item, index) {
                return item.owner.href;
            })
            return resolve(profileUrls);
        }
        , function(error) { // error
            return reject( error );
        }
        , function(error) { // timeout
            return reject( error );
        });
}
, function(results) { // aggregated results
    
    // 2- we aggregate playlists results
    console.log("playlist search done on items:%d",results.length);
    
    // 3- we gather users for the first playlists results
    PromiseBackoff(backoffOptions, results[0], function(item, index, resolve, reject) {
        api.RequestGet(item, {}, {}
        , function(response) { // success
            console.log("received profile for user %s [%s]", response.id, response.display_name)
            return resolve({
                name: response.display_name ,
                url :response.href
            });
        }
        , function(error) { // error
            return reject( error );
        }
        , function(error) { // timeout
            return reject( error);
        });
    }, function(results) { // aggregated results

        // 4- we aggregate users results in a json
        console.log("All user profiles grabbbed " + results.length);
        console.log( JSON.stringify(results, null, 2) );
    }
    ,function(error) { // error
        console.log(error);
    })

}
, function(error) { // error
    console.log("error %s", error.toString());
});

}).call(this);