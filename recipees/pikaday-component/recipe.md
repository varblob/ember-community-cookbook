# Wrapping a third party `UI Component` in an `Ember.Component`

## Problem

You want to incorporate a third party `UI Component` into your app as an `Ember.Component` so you can interact with it using the familiar `Ember.Component` template syntax AND leverage all the great javascript libraries that already exist.

    {{pikaday-date-picker value=date}}

In this example we're using a simple date picker `UI Component` called pikaday but you can wrap pretty much any third party `UI Component` using the same techniques described below.

## Solution

### Importing the third party `UI Component`

In many cases you can avoid the problem entirely by finding an ember addon that already does this for you, it is therefore strongly recommended you search ([Ember Observer](http://emberobserver.com/), [Ember Addons](http://www.emberaddons.com/)) first before writting your own wrapper.  If you can't find an addon then the next best option is to download the file via bower and then import it into your application via the brocfile.

    
    // brocfile.js
    [
      'pikaday/css/pikaday.css',
      'pikaday/pikaday.js'
    ].forEach(function(i){
      app.import(app.bowerDirectory + '/' + i);
    });

If the file is also unavailable via bower you can download the javascript directly to vendor directory and include them via `app.import` similar to above. 

    // brocfile.js
    [
      'pikaday/css/pikaday.css',
      'pikaday/pikaday.js'
    ].forEach(function(i){
      app.import('vendor/' + i);
    });

### Intantiating

Most third party `UI Components` need access to a `DOM Element` to work.  In an `Ember.Component` the `DOM Element` is first available when `didInsertElement` is called.  Because properties set on the `Ember.Component` will already be set before `didInsertElement` is called, these values can be accessed to set your third party `UI Component`'s initial configuration.

      didInsertElement: function() {
        var _this = this;
        var pikaday = new Pikaday({
          // this.$() grabs the jquery DOM Element of this Ember.Component
          // the zeroith element grabs the native DOM Element
          field: this.$()[0]
        });
        this.set('_pikaday', pikaday);
        // in case the value is already set
        pikaday.setDate(this.get('value'), true);
      },


### Listening for events

When listening for third party `UI Component` events it's important to wrap your event logic in an `Ember.run` call.  If you don't do this unit tests will require you wrap calls that trigger this event in an `Ember.run`.  You can read more [here](http://guides.emberjs.com/v1.11.0/understanding-ember/run-loop/#toc_how-is-runloop-behaviour-different-when-testing).

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

Your library will probably have state that you will want to keep in sync so it can be used outside the `Ember.Component`.  For example in the pikaday you will want to be able to set the initial date and also be notified of date changes from user input.  Because pikaday is an input and designed for the expressed purpose of mutating data it is acceptable to use a two way binding for this. 

    value: computed({
      set(key, value){
        var pikaday = this.get('_pikaday');
        // pikaday is not yet instantiated when the value is first set
        if(pikaday !== null){
          pikaday.setDate(value, true);
        }
        // The return value of set gets cached by Ember
        return value;
      }
    }),


### Cleaning up

Because the `DOM Element` corresponding to this `Ember.Component` will be destroyed and recreated whenever there is a template rerender, it's essential to cleanup.  If your third party `UI Component` hase a destroy or similar function, it should be called here.  You should also be mindful of any event listeners you may have added and be sure to remove them if it is not done so automatically by the destroy function.  You can read more about cleaning up [here](https://medium.com/@chrisdmasters/cleaning-up-after-components-in-ember-js-73bbf0f16add)

      willDestroyElement: function() {
        this.get('_pikaday').destroy();
      }
    });


### Example

See a working example of an ember-cli application [here](https://github.com/varblob/ember-community-cookbook/tree/master/recipees/pikaday-component/dummy-app)