Backbone.preloader
==================

A non-obtrusive way to preload specific collections/models before the page render is complete.

Usage
=====

```
Preloader.instances = {
  'CollectionName'  : 'DestinationVariableName',
  'ModelName'       : 'DestinationVariableName',
};
Preloader.on('CollectionName:loaded', function() {
  // do some stuff, maybe?
});
Preloader.on('error', function() {
  console.log('Error:', arguments);
})
Preloader.on('complete', function() {
  Backbone.history.start();
});
```

Trigger Events
==============
```
__variable__:loading   - called when fetch() is called.
__variable__:loaded    - called when a variable sync is returned.
__variable__:error     - called with variable error is returned.
loaded                 - called when any loaded event is triggered.
error                  - called when any variable error is returned.
complete               - called when all variables are loaded.
timeout                - called when timeout is reached before complete.
```
