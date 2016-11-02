/**
 * Promise with jittered backoff
 * https://github.com/loretoparisi/promise-backoff
 * @2016 Loreto Parisi (loretoparisi at gmail dot com)
 */
(function() {
var Deque = require('./deque/deque');
var Backoff=require('./backoff/index');
module.exports = function(options, items, block, done, fail, debug) {
    debug = debug || false;
    var promises = [];
    var backoff=Backoff.exponential(options);
    var backoffQueue=new Deque( items.length );
    backoff.failAfter(  items.length );
    backoff.on('ready', function(attempts, delay) { // next
        // Do something when backoff ends, e.g. retry a failed
        if ( debug ) console.log(attempts + ' ' + delay + 'ms');
        backoff.backoff();
    });
    backoff.on('backoff', function(attempts, delay) { // job
        // Do something when backoff starts
        if( !backoffQueue.isEmpty() ) {
            backoffQueue.shift()();
        }
    });
    backoff.on('fail', function() { // end
        // Do something when the maximum number of backoffs is reached
        backoff.reset();
    });
    items.forEach(function(item,index) {
        promises.push( function(item,i) {
            return new Promise(function(resolve, reject) {
                backoffQueue.enqueue( function () {
                    block.apply(this,[item,i,resolve,reject]);   
                });
            });
        }(item,index))
    });
    backoff.backoff();
    return Promise.all(promises).then(function AcceptHandler(results) {
        if(done) done( results );
    }, function ErrorHandler(error) {
        if(fail) fail( error );
    });
};
}).call(this);