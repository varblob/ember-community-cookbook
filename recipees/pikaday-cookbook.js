import Ember from 'ember';

// NEED to test this
// Possible issue with setting the initial value pikaday will be null
export default Ember.Component.extend({
  tagName: 'input',
  _pikaday: null,

  // this is likely to become https://github.com/emberjs/rfcs/pull/11
  value: function(key, value, prevVal){
    var pikaday = this.get('_pikaday');
    if(arguments.length > 1){// set
      pikaday.setDate(value, true);
    } else { // get
      pikaday.get('_pikaday').getDate()
    }
  }.property(),

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
          _this.sendAction('selected');
        });
      }
    });
    this.set('_pikaday', pikaday);
  },

  // because the dom element corresponding to this component
  // will be destroyed and recreated whenever there is a template
  // rerender it's essential to cleanup your third party lib
  willDestroyElement: function() {
    this.get('_pikaday').destroy();
  }
});