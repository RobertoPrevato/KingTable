/**
 * Events.
 * https://github.com/RobertoPrevato/KingTable
 *
 * Copyright 2017, Roberto Prevato
 * https://robertoprevato.github.io
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */
import _ from "../../scripts/utils";

var array = [];
var push = array.push;
var slice = array.slice;
var splice = array.splice;

// Regular expression used to split event strings.
const eventSplitter = /\s+/;

var eventsApi = function (obj, action, name, rest) {
  if (!name) return true;

  // Handle event maps.
  if (typeof name === "object") {
    for (var key in name) {
      obj[action].apply(obj, [key, name[key]].concat(rest));
    }
    return false;
  }

  // Handle space separated event names.
  if (eventSplitter.test(name)) {
    var names = name.split(eventSplitter);
    for (var i = 0, l = names.length; i < l; i++) {
      obj[action].apply(obj, [names[i]].concat(rest));
    }
    return false;
  }

  return true;
}

var triggerEvents = function (events, args) {
  var ev, i = -1, l = events.length, a1 = args[0], a2 = args[1], a3 = args[2];
  switch (args.length) {
    case 0: while (++i < l) (ev = events[i]).callback.call(ev.ctx); return;
    case 1: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1); return;
    case 2: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2); return;
    case 3: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2, a3); return;
    default: while (++i < l) (ev = events[i]).callback.apply(ev.ctx, args);
  }
}

//
// Base class for events emitters
//
export default class EventsEmitter {

  // Bind an event to a `callback` function. Passing `"all"` will bind
  // the callback to all events fired.
  on(name, callback, context) {
    if (!eventsApi(this, "on", name, [callback, context]) || !callback) return this;
    this._events || (this._events = {});
    var events = this._events[name] || (this._events[name] = []);
    events.push({ callback: callback, context: context, ctx: context || this });
    return this;
  }

  // Bind an event to only be triggered a single time. After the first time
  // the callback is invoked, it will be removed.
  once(name, callback, context) {
    if (!eventsApi(this, "once", name, [callback, context]) || !callback) return this;
    var self = this;
    var once = _.once(function () {
      self.off(name, once);
      callback.apply(this, arguments);
    });
    once._callback = callback;
    return this.on(name, once, context);
  }

  // Remove one or many callbacks.
  off(name, callback, context) {
    var retain, ev, events, names, i, l, j, k;
    if (!this._events || !eventsApi(this, "off", name, [callback, context])) return this;
    if (!name && !callback && !context) {
      this._events = {};
      return this;
    }

    names = name ? [name] : _.keys(this._events);
    for (i = 0, l = names.length; i < l; i++) {
      name = names[i];
      if (events = this._events[name]) {
        this._events[name] = retain = [];
        if (callback || context) {
          for (j = 0, k = events.length; j < k; j++) {
            ev = events[j];
            if ((callback && callback !== ev.callback && callback !== ev.callback._callback) ||
            (context && context !== ev.context)) {
              retain.push(ev);
            }
          }
        }
        if (!retain.length) delete this._events[name];
      }
    }

    return this;
  }

  // Trigger one or many events, firing all bound callbacks.
  trigger(name) {
    if (!this._events) return this;
    var args = slice.call(arguments, 1);
    if (!eventsApi(this, "trigger", name, args)) return this;
    var events = this._events[name];
    var allEvents = this._events.all;
    if (events) triggerEvents(events, args);
    if (allEvents) triggerEvents(allEvents, arguments);
    return this;
  }

  // Trigger one or many events, firing all bound callbacks.
  emit(name) {
    return this.trigger(name);
  }

  // Tell this object to stop listening to either specific events, or
  // to every object it's currently listening to.
  stopListening(obj, name, callback) {
    var listeners = this._listeners;
    if (!listeners) return this;
    var deleteListener = !name && !callback;
    if (typeof name === "object") callback = this;
    if (obj) (listeners = {})[obj._listenerId] = obj;
    for (var id in listeners) {
      listeners[id].off(name, callback, this);
      if (deleteListener) delete this._listeners[id];
    }
    return this;
  }

  listenTo(obj, name, callback) {
    // support calling the method with an object as second parameter
    if (arguments.length == 2 && typeof name == "object") {
      var x;
      for (x in name) {
        this.listenTo(obj, x, name[x]);
      }
      return this;
    }

    var listeners = this._listeners || (this._listeners = {});
    var id = obj._listenerId || (obj._listenerId = _.uniqueId("l"));
    listeners[id] = obj;
    if (typeof name === "object") callback = this;
    obj.on(name, callback, this);
    return this;
  }

  listenToOnce(obj, name, callback) {
    var listeners = this._listeners || (this._listeners = {});
    var id = obj._listenerId || (obj._listenerId = _.uniqueId("l"));
    listeners[id] = obj;
    if (typeof name === "object") callback = this;
    obj.once(name, callback, this);
    return this;
  }
};
