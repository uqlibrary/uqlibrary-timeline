(function () {
  Polymer({
    is: 'uqlibrary-timeline',
    properties: {
      /**
       * The `events` attribute is an array of events to display on the timeline
       */
      events: {
        type: Array,
        value: function () { return []; }
      },
      /**
       * List of processed events
       */
      processedEvents: {
        type: Array,
        value: function () { return []; }
      },
      /**
       * JS Placeholder for when no click event is available
       */
      javascriptPlaceholder: {
        type: String,
        value: 'javascript:;'
      },
      /**
       * The `noEventsMessage` a message to display when there are no upcoming events
       */
      noEventsMessage: {
        type: String,
        value: 'Your room or equipment bookings will show up here.',
        notify: true
      },
      /**
       * Whether this timeline has any available events
       */
      _hasEvents: {
        type: Boolean,
        value: false
      }
    },
    observers: [
        '_eventsChanged(events.*)',
        '_processedEventsChanged(processedEvents.*)'
    ],
    ready: function () {
    },
    /**
     * The 'event-selected' event is fired when a user taps on an event in timeline,
     * object containing event details is returned
     */
    eventSelected: function (e) {
      var eventId = e.model.item.id;
      var selectedEvent = this.events.filter(function (event) {
        return event.id == eventId;
      });
      this.fire('event-selected', selectedEvent.length ? selectedEvent[0] : undefined);
    },
    /**
     * called whenever the events change
     * @param _
     * @param changeValue
     * @private
     */
    _eventsChanged: function (_, changeValue) {
      var events = JSON.parse(JSON.stringify(this.events));
      var processed = [];
      if (changeValue && changeValue.length) {
        if (changeValue && changeValue[0].addedCount == 1) {
          //if one new element is added, set its opened property to false
          events[changeValue[0].index].opened = false;
        } else if (changeValue[0] && changeValue[0].removed && changeValue[0].removed.length > 0) {
        }
      }
      //event has been removed from the list
      // Sort by date (ascending)
      events.sort(function (a, b) {
        var aDate = new Date(a.startDate).getTime();
        var bDate = new Date(b.startDate).getTime();
        if (aDate > bDate) {
          return 1;
        }
        if (aDate < bDate) {
          return -1;
        }
        return 0;
      });
      var haveDivider = false;
      //build processed events lists for display in timeline
      for (var i = 0; i < events.length; i++) {
        events[i].startDate = new Date(events[i].startDate);
        events[i].endDate = new Date(events[i].endDate);
        events[i].day = events[i].startDate.getDate();
        events[i].dayText = moment(events[i].startDate).format('ddd');
        events[i].monthText = moment(events[i].startDate).format('MMM');
        var startFormat = moment(events[i].startDate).format('a') == moment(events[i].endDate).format('a') ? 'h:mm' : 'h:mm a';
        events[i].timeText = moment(events[i].startDate).format(startFormat) + ' - ' + moment(events[i].endDate).format('h:mm a');
        events[i].class = 'event-item';
        if (!events[i].hasOwnProperty('opened')) {
          events[i].opened = true;
        } else {
          events[i].class = 'event-item event-item-hidden';
        }
        //same day events should not display date
        if (i > 0 && events[i].startDate.getDay() === events[i - 1].startDate.getDay() && events[i].startDate.getDate() === events[i - 1].startDate.getDate()) {
          events[i].day = '';
          events[i].dayText = '';
          events[i].monthText = '';
        }
        //insert divider between past and upcoming
        if (i > 0 && !haveDivider && new Date().getTime() < events[i].startDate.getTime() && new Date().getTime() >= events[i - 1].startDate.getTime()) {
          events[i - 1].class = 'last';
          haveDivider = true;
          processed.push({ isDivider: true });
        }
        processed.push(events[i]);
      }
      if (processed.length > 0) {
        processed[0].class = 'first';
        this._hasEvents = true;
      } else {
        this._hasEvents = false;
      }
      this.processedEvents = processed;
    },
    /**
     * Called whenever the processed events change
     * @param _
     * @param changeValue
     * @private
     */
    _processedEventsChanged: function (_, changeValue) {
      this.async(function () {
        Array.prototype.slice.call(Polymer.dom(this.$.timeline).querySelectorAll('core-collapse')).forEach(function (element) {
          if (element.opened === false) {
            element.opened = true;
          }
        });
      }, null, 100);
      this.async(function () {
        Array.prototype.slice.call(Polymer.dom(this.$.timeline).querySelectorAll('.event-item-hidden')).forEach(function (element) {
          element.className = 'event-item';
        });
      }, null, 100);
    },
    _computeHidden: function (processedEvents) {
      return processedEvents.length > 0;
    },
    _computeId: function (event) {
      return 'event-' + event.id;
    }
  });
}());