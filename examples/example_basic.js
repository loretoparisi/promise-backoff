/**
 * Promise with jittered backoff
 * https://github.com/loretoparisi/promise-backoff
 * @2016 Loreto Parisi (loretoparisi at gmail dot com)
*/
(function() {

// this simple example shows how to initialize and
// load a jittered backoff on a sample of items to process

var PromiseBackoff = require('../lib/index');

function makeid() {
    var text = "", possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for( var i=0; i < 10; i++ ) text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}
function arrayRangeMap(a,block){var c=[];while(a--) c[a]=block() ; return c};

var samples=arrayRangeMap(10,function() {
    return makeid();
});
var backoffOptions={
    randomisationFactor: 0.11304999836,
    initialDelay: 1000 * 1, // initial time msec
    maxDelay: 1000 * 3, // maximum time msec
    factor : Math.E // Exponential Timer Grow Factor
};
PromiseBackoff(backoffOptions, samples
, function(item,index,resolve,reject) {
    console.log("item %s/%s is %s", index, samples.length, item);
    return resolve(item);
}
, function(results) { // aggregated results
    console.log("done items:%d",results.length);
}
, function(error) { // error
    console.log("error %s", error.toString());
}, false);//no debug

}).call(this);