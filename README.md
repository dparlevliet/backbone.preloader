Backbone.preloader
==================

A non-obtrusive way to preload specific collections/models before the page
render is complete.

Configuration
=============

###### Preloader.timeout
Default <tt>10</tt>. Number of seconds to wait before declaring the preload
a failure and triggering a <tt>timeout</tt> event

###### Preloader.parallel
Default <tt>true</tt>. If <tt>true</tt> then preloader will send <tt>fetch()</tt> attempts for
all instances at startup. Otherwise, if <tt>false</tt>, it will attempt to call them in
sequence.

Useful Accessors
================
###### Preloader.loaded
The number of successfully loaded instances.

###### Preloader.loading
The total number of instances Preloader will attempt to sync.

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
Preloader.on('loaded', function() {
  // do some dom animation stuff, maybe?
});
Preloader.on('error', function() {
  console.log('Error:', arguments);
})
Preloader.on('complete', function() {
  Backbone.history.start();
});
$(document).ready(function() {
  Preloader.start();
});

```

Trigger Events
==============
```
__variable__:loading   - called when fetch() is called.
__variable__:loaded    - called when a variable sync is returned.
__variable__:error     - called with variable error is returned.
__variable__:loading   - called when a second 'sync' trigger is returned by __variable__. Useful for when 
                         using Backbone.cachingSync to know when the server sync is complete.
loaded                 - called when any loaded event is triggered.
error                  - called when any variable error is returned.
complete               - called when all variables are loaded.
timeout                - called when timeout is reached before complete.
```
