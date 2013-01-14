/**
 * @fileoverview Preloads model/collection instance data and stores it in a
 * defined variable.
 * @author David Parlevliet
 * @version 20130113
 * @preserve Copyright 2013 David Parlevliet.
 *
 * Preloader
 * =========
 * Preloads model/collection constants. These models are the most common objects
 * required for views to function without the need to poll the server. For this
 * to function correctly, every constant MUST have the typeOf variable
 * and matching the constant name. typeOf will be assigned on start();
 *
 * These objects should be attached to a Backbone caching plugin such as to save
 * load time for the end user. Backbone.cachingSync is recommended;
 * https://github.com/ggozad/Backbone.cachingSync
 *
 * Example Preloader Usage:
 *  Preloader.instances = {
 *    'Source': 'Destination',
 *  };
 *  Preloader.on('Source:loaded', function() {
 *    // do stuff
 *  });
 *  Preloader.on('complete', function() {
 *    Backbone.history.start();
 *  });
 *  $(document).ready(function() {
 *    Preloader.start();
 *  });
 */
var Preloader = _.extend({
  /** Time in seconds until the Preloader gives up and triggers complete */
  timeout     : 10,
  /** false to our fetch requests one at a time or true for all at once. */
  parallel    : true,
  /**
   * If true this.off() events will be called. This is required if you are using
   * Backbone.cachingSync, because 'sync' will be triggered twice -- Once when
   * the data is successfully loaded from cache, and then once more when it is
   * successfully pulled from the server.
   */
  untrigger   : true,
  /**
   * Backbone.Events overrides this and becomes a hook for capturing events.
   * Events List:
   * <ul>
   * <li>__variable__:loading - called when fetch() is called.</li>
   * <li>__variable__:loaded - called when a variable sync is returned</li>
   * <li>__variable__:error - called with variable error is returned</li>
   * <li>loaded - called when any loaded event is triggered</li>
   * <li>error - called when any variable error is returned</li>
   * <li>complete - called when all variables are loaded</li>
   * <li>timeout - called when timeout is reached before compelte</li>
   * </ul>
   */
  on          : undefined,
  /** Inherited from Backbone.Events */
  off         : undefined,
  /** Inherited from Backbone.Events */
  trigger     : undefined,
  /**
   * Start the preloading
   */
  start: function() {
    if (this.started) return;
    this.started      = true;
    this.loaded       = 0;
    this.loading      = 0;
    this.records      = {};
    for (var key in this.instances) {
      this.records[key] = {
        'destination': this.instances[key],
        'source': key,
        'status': false
      };
      this.loading += 1;
    }
    this.load_next();
    this.timer = setTimeout(function() {
      Preloader.timedout()
    }, this.timeout*1000);
  },
  /**
   * Start the preloading
   */
  load_next: function() {
    for (var key in this.records) {
      if (this.records[key].status===false) {
        window[this.records[key].destination] = new window[key]();
        var model = window[this.records[key].destination];
        model.typeOf = key;
        model.on('sync', this.load_complete, this);
        model.on('error', this.error, this);
        this.trigger(key+':loading');
        model.fetch();
        this.records[key].status = 'loading';
        if (this.parallel===false)
          break;
      }
    }
  },
  /**
   * When 'sync' event is triggered by fetch() it returns back here to clean
   * up and fire other events.
   */
  load_complete: function(subject, results, jqXHR) {
    if (subject.typeOf in this.records) {
      this.records[subject.typeOf].status = true;
      this.loaded += 1;
    }
    this.trigger('loaded', subject, results, jqXHR);
    this.trigger(subject.typeOf+':loaded', subject, results, jqXHR);
    if (this.loaded>=this.loading)
      this.complete();
    this.load_next();
    if (!this.untrigger) return;
    subject.off('sync');
    this.off(subject.typeOf+':loaded');
    this.off(subject.typeOf+':loading');
  },
  /**
   * When preloading is complete
   */
  complete: function() {
    this.trigger('complete', true);
    if (!this.untrigger) return;
    clearTimeout(this.timer);
    this.off('timeout');
    this.off('complete');
    this.off('loaded');
  },
  /**
   * Handles errors thrown from instances and calls other error triggers for the
   * user to intercept.
   */
  error: function(subject, jqXHR, response) {
    this.trigger(arguments[0].typeOf+':error', arguments);
    this.trigger('error', subject, jqXHR, response);
  },
  /**
   * Called after X seconds defined by this.timeout. If this is called it means
   * that the preloader took too long to complete and the user should do
   * something about it so the user doesn't close the browser out of
   * frustration.
   */
  timedout: function() {
    if (this.loaded<this.loading)
      this.trigger('timeout');
    this.trigger('complete', false);
  }
}, Backbone.Events);
