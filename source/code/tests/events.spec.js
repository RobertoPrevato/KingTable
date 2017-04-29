/**
 * Tests for EventsEmitter class.
 * https://github.com/RobertoPrevato/KingTable
 *
 * Copyright 2017, Roberto Prevato
 * https://robertoprevato.github.io
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */
import EventsEmitter from "../scripts/components/events";

class Cat extends EventsEmitter {
  constructor() {
    super();
  }
};

class Dog extends EventsEmitter {
  constructor() {
    super();
  }

  bark() {
    this.trigger("bark");
  }
}

var CACHE = {
  meow: 0,
  meowzz: 0
};

describe("EventsEmitter class", () => {

  it("must support custom event handlers", () => {
    var cat = new Cat();
    cat.on("meow", () => {
      CACHE.meow++;
    });

    cat.trigger("meow");
    expect(CACHE.meow).toEqual(1);

    cat.trigger("meow");
    expect(CACHE.meow).toEqual(2);
  });

  it("must support once event handlers", () => {
    var cat = new Cat();

    cat.once("meowzz", () => {
      CACHE.meowzz++;
    });

    cat.trigger("meowzz");
    expect(CACHE.meowzz).toEqual(1);

    cat.trigger("meowzz");
    expect(CACHE.meowzz).toEqual(1);

    cat.trigger("meowzz");
    expect(CACHE.meowzz).toEqual(1);
  });

  it("must allow to listen other events transmitters", () => {
    var cat = new Cat(), dog = new Dog(), n = 0;

    cat.listenTo(dog, "bark", function() {
      expect(this).toEqual(cat);
      cat.trigger("run");
      n++;
    });

    dog.trigger("bark");
    expect(n).toEqual(1);

    dog.trigger("bark");
    expect(n).toEqual(2);
  });

  it("must allow to listen other events transmitters", () => {
    var cat = new Cat(), dog = new Dog(), n = 0;

    // NB: context is respected only if using function () { } syntax
    cat.listenToOnce(dog, "bark", function() {
      expect(this).toEqual(cat);
      cat.trigger("run");
      n++;
    });

    dog.trigger("bark");
    expect(n).toEqual(1);

    dog.trigger("bark");
    expect(n).toEqual(1);

    dog.trigger("bark");
    expect(n).toEqual(1);
  });

});
