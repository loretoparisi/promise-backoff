# Promise with Jittered Backoff
This module performs a `Promise` all with backoff delayed execution based on a jitter.
It can be used in combination with any api module, to perform jittered api calls to a server 
to prevent the "predictable thundering hoardes" from hammering some services if one of them happens to go down.

## How to use this module
For the jittered backoff part the options are 

```json
var options={
    randomisationFactor: 0.11304999836,
    initialDelay: 1000 * 1, // initial time msec
    maxDelay: 1000 * 3, // maximum time msec
    factor : Math.E // Exponential Timer Grow Factor
};
```

Supposed to have an array `samples` of objects to do some processings with a jittered backoff

```javascript
var PromiseBackoff = require('promise-backoff');
PromiseBackoff(options, samples
, function(item,index,resolve,reject) {
    console.log("item %s/%s is %s", index, samples.length, item);
    return resolve( item );
}
, function(results) { // aggregated results
    console.log("done on items:%d",results.length);
}
, function(error) { // error
    console.log("error %s", error.toString());
},);
```

where the input function `function(item,index,resolve,reject)` can be combined with
an api call in order to resolve and/or reject its response like in the following example:

```javascript
function(item,index,resolve,reject) {
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
```

More examples are provided in the `examples/` folder.

## References
- The backoff module is inspired and taken from [node-backoff](https://github.com/MathieuTurcotte/node-backoff)
by [Mathieu Turcotte](https://github.com/MathieuTurcotte)
