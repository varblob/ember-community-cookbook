import Ember from 'ember';

// Future versions of Ember will be released as ES2015 modules, so
// we'll be able to import Ember.observer directly as observer.
// see https://github.com/dockyard/styleguides/blob/master/ember.md
var Component = Ember.Component;
var observer = Ember.observer;

export default Component.extend({
  tagName: 'input',
  _pikaday: null,

  // the date value is changed and accessed via two way binding because
  // it is an input whos explicit function is to mutate data.  Generally
  // two way bindings should be avoided.
  value: null,

  valueObserver: observer('value', function(){
    var pikaday = this.get('_pikaday');
    var value = this.get('value');
    if(value !== undefined && pikaday){
      pikaday.setDate(this.get('value'), true);
    }
  }),

  didInsertElement: function() {
    var _this = this;
    var pikaday = new Pikaday({
      // this.$() grabs the jquery dom element of this component
      // the zeroith element grabs the native dom element
      field: this.$()[0],
      onSelect: function() {
        // You need to wrap third party event logic in Ember.run
        // if you don't do this unit tests will require you wrap
        // calls that trigger this event in an Ember.run
        // http://guides.emberjs.com/v1.11.0/understanding-ember/run-loop/#toc_how-is-runloop-behaviour-different-when-testing
        Ember.run(function() {
          // sending an action so that parent components know data has changed
          _this.set('value', pikaday.getDate());
        });
      }
    });
    this.set('_pikaday', pikaday);
    // in case the value is already set
    pikaday.setDate(this.get('value'), true);
  },

  // because the dom element corresponding to this component
  // will be destroyed and recreated whenever there is a template
  // rerender it's essential to cleanup your third party lib
  willDestroyElement: function() {
    this.get('_pikaday').destroy();
  }
});