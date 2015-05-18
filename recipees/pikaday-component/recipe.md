# Wrapping a third party library in a component

## Problem

You want to incorporate a third party lib into your app as a component to make for easy use in your application.

## Solution

### Importing the third party library

In many cases you can avoid the problem entirely by finding an ember addon that already exists, it is strongly recommended you search first before writting your own wrapper.  If you can't find an addon then the next best option is to include the file via bower and then import it into your application via the brocfile.

    
    // brocfile.js

    [
      'pikaday/css/pikaday.css',
      'pikaday/pikaday.js'
    ].forEach(function(i){
      app.import(app.bowerDirectory + '/' + i);
    });

### Intantiating

Most third party libraries need access to a dom component to work.  In an ember component the dom component is first available when `didInsertElement` is called.  Remember that properties set on the component will already be set before `didInsertElement` is called, these values can be used to set your third party components initial configuration.

      didInsertElement: function() {
        var _this = this;
        var pikaday = new Pikaday({
          // this.$() grabs the jquery dom element of this component
          // the zeroith element grabs the native dom element
          field: this.$()[0]
        });
        this.set('_pikaday', pikaday);
        // in case the value is already set
        pikaday.setDate(this.get('value'), true);
      },


### Listening for events

When listening for third party library events it's important to wrap your event logic in an `Ember.run` call.  if you don't do this unit tests will require you wrap calls that trigger this event in an `Ember.run`.  You can read more [here](http://guides.emberjs.com/v1.11.0/understanding-ember/run-loop/#toc_how-is-runloop-behaviour-different-when-testing).

    onSelect: function() {
      Ember.run(function() {
        _this.set('value', pikaday.getDate());
      });
    }

If you want to convert your event into an ember action simply

    onSelect: function() {
      Ember.run(function() {
        _this.sendAction('value', pikaday.getDate());
      });
    }

### Keeping in sync

Your library will probably have state that you will want to keep in sync so it can be used outside the component.  For example in the pikaday you will want to be able to set the initial date and also be notified of date changes from user input.  Because pikaday is an input and designed for the expressed purpose of mutating data it is acceptable to use a two way binding for this. 

    value: null,

    valueObserver: observer('value', function(){
      var pikaday = this.get('_pikaday');
      var value = this.get('value');
      if(value !== undefined && pikaday){
        pikaday.setDate(this.get('value'), true);
      }
    }),


### Cleaning up

Because the dom element corresponding to this component will be destroyed and recreated whenever there is a template rerender it's essential to cleanup your third party lib.  If the libarary hase a destroy like function it should be called here.  You should also be mindful of any events listeners you may have added and be sure to remove them if it is not done so automatically by the destroy function of your library.

      willDestroyElement: function() {
        this.get('_pikaday').destroy();
      }
    });
