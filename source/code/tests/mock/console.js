/**
 * Mocks, by monkey patching, the console object for unit tests.
 * https://github.com/RobertoPrevato/KingTable
 *
 * Copyright 2017, Roberto Prevato
 * https://robertoprevato.github.io
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */

/**
 * @example
   var mock = new MockConsole()

   mock.fire(() => {
     console.error("foo")
   })

   expect(mock.log[0]).toEqual("ERROR: foo")
   // dispose the mock console
   mock.dispose()
 */

class MockConsole {
  constructor(verbose=false) {
    this.log = []
    this.setup()
    this.verbose = verbose;
  }

  setup() {
    var self = this;
    var names = "log info error".split(" ");
    var original = {};
    for (var i = 0, l = names.length; i < l; i++) {
      var name = names[i];
      original[name] = console[name];

      console[name] = function (a) {
        if (self.verbose) {
          original[name](a);
        }
        self.log.push(name.toUpperCase() + ": " + a);
      }
    }
    self.original = original;
  }

  dispose() {
    var original = this.original;
    for (var x in original) {
      console[x] = original[x];
    }
  }

  fire(fn, eatExceptions = true) {
    // mock global console object
    var self = this;
    try {
      fn();
    } catch (ex) {
      if (!eatExceptions) {
        throw ex;
      }
    }
  }
}

export { MockConsole }
