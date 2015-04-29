import Ember from 'ember';

// don't use Ember directly see
// https://github.com/dockyard/styleguides/blob/master/ember.md
var Service = Ember.Service;
var run = Ember.run;

export default Service.extend({
  init: function() {
    Ember.$(document).ajaxStart(this.handler(this.startHandler));
    Ember.$(document).ajaxStop(this.handler(this.stopHandler));
  },

  handler: function(func) {
    var _this = this;
    return function() {
      // wrap the handler in a run function
      // see http://guides.emberjs.com/v1.11.0/understanding-ember/run-loop/#toc_how-is-runloop-behaviour-different-when-testing
      return run(function() {
        return func.apply(_this, arguments);
      });
    };
  },

  startHandler: function() {
    return this.set('isSaving', true);
  },

  stopHandler: function() {
    return this.set('isSaving', false);
  },

  isSaving: false
});