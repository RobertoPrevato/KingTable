/**
 * Tests for common utilities.
 * https://github.com/RobertoPrevato/KingTable
 *
 * Copyright 2017, Roberto Prevato
 * https://robertoprevato.github.io
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */
import _ from "../scripts/utils";

describe("Base utilities", () => {

  it("must allow to extend objects", () => {
    var a = { a: 1 };
    var b = { b: 2 };

    var o = _.extend({}, a, b);
    expect("a" in o).toEqual(true);
    expect("b" in o).toEqual(true);
  });

  it("must allow to remove value types from arrays (without generating new arrays)", () => {
    var a = [1, 2, 3, 4, 5];
    _.removeItem(a, 4);
    expect(a).toEqual([1, 2, 3, 5]);
  })

  it("must allow to remove reference types from arrays (without generating new arrays)", () => {
    var sentinel = {}
    var a = {}, b = {}, sentinel = {}, c = {}, d = {};
    var e = [a, b, sentinel, c, d];
    _.removeItem(e, sentinel);
    expect(e).toEqual([a, b, c, d]);

    _.removeItem(e, a);
    expect(e).toEqual([b, c, d]);
  })

  it("must allow to check if objects quacks", () => {
    var a = { quack: function () {} };
    var b = { bark: function () {}, wag: function () {} };

    expect(_.quacks(a, ["quack"])).toEqual(true, "the given object quacks like a duck");
    expect(_.quacks(b, ["quack"])).toEqual(false, "the given object does not quack");
    expect(_.quacks(b, ["bark", "wag"])).toEqual(true, "the given object barks and wags");
  });

  it("must allow to check if objects quacks, passing string params", () => {
    var a = { quack: function () {} };
    var b = { bark: function () {}, wag: function () {} };

    expect(_.quacks(a, "quack")).toEqual(true, "the given object quacks like a duck");
    expect(_.quacks(b, "quack")).toEqual(false, "the given object does not quack");
    expect(_.quacks(b, "bark", "wag")).toEqual(true, "the given object barks and wags");
  });

  it("must allow to check if objects quacks", () => {
    var a = { quack: function () {} };
    var b = { bark: function () {} };

    expect(_.quacks(a, ["quack"])).toEqual(true, "the given object quacks like a duck");
    expect(_.quacks(b, ["quack"])).toEqual(false, "the given object does not quack");
  });

  it("must allow to extend objects in precise order", () => {
    var a = { a: 1, c: false };
    var b = { b: 2, c: true };

    var o = _.extend({}, a, b);
    expect("a" in o).toEqual(true);
    expect("b" in o).toEqual(true);
    expect(o.c).toEqual(true, "values from following parameters must override the values from previous parameters");
  });

  it("must allow to obtain keys from an object", () => {
    var a = {
      page: 1,
      size: 30,
      orderBy: "id",
      sortOrder: "asc",
      search: "",
      timestamp: 10000
    };
    var keys = _.keys(a);
    expect(keys instanceof Array).toEqual(true, "returned keys must be an instance of array");
    expect(keys.length).toEqual(6, "returned array must contain the same number of keys of the source object");
    // NB: object properties are not guaranteed to be ordered in JavaScript (although they are in practice, in most implementation and cases)
    expect(keys.indexOf("page")).not.toEqual(-1);
    expect(keys.indexOf("size")).not.toEqual(-1);
    expect(keys.indexOf("orderBy")).not.toEqual(-1);
    expect(keys.indexOf("sortOrder")).not.toEqual(-1);
    expect(keys.indexOf("search")).not.toEqual(-1);
    expect(keys.indexOf("timestamp")).not.toEqual(-1);
  });

  it("must allow to sort arrays of numbers", () => {
    var a = [6,12,4,6,7,23,1,9,-1];
    _.sortNums(a);

    expect(a[0]).toEqual(-1);
    expect(a[1]).toEqual(1);
    expect(a[2]).toEqual(4);
    expect(a[3]).toEqual(6);
    expect(a[4]).toEqual(6);
    expect(a[5]).toEqual(7);
    expect(a[6]).toEqual(9);
    expect(a[7]).toEqual(12);
    expect(a[8]).toEqual(23);
  })

  it("must allow to obtain values from an object", () => {
    var a = {
      page: 1,
      size: 30,
      orderBy: "id",
      sortOrder: "asc",
      search: "",
      timestamp: 10000
    };
    var values = _.values(a);
    expect(values instanceof Array).toEqual(true, "returned values must be an instance of array");
    expect(values.length).toEqual(6, "returned array must contain the same number of values of the source object");
    // NB: object properties are not guaranteed to be ordered in JavaScript (although they are in practice, in most implementation and cases)
    expect(values.indexOf(1)).not.toEqual(-1);
    expect(values.indexOf(30)).not.toEqual(-1);
    expect(values.indexOf("id")).not.toEqual(-1);
    expect(values.indexOf("asc")).not.toEqual(-1);
    expect(values.indexOf("")).not.toEqual(-1);
    expect(values.indexOf(10000)).not.toEqual(-1);
  });

  it("must allow to return subset of objects", () => {
    var a = {
      page: 1,
      size: 30,
      orderBy: "id",
      sortOrder: "asc",
      search: "",
      timestamp: 10000
    };
    var b = _.minus(a, ["orderBy", "sortOrder", "timestamp"]);
    expect(a).not.toEqual(b, "return object must be a new object");
    expect(typeof b).toEqual("object", "return object must be of object type");
    expect(_.equal(b, {
      page: 1,
      size: 30,
      search: ""
    })).toEqual(true, "return object must be a copy of the original, without the given properties");
  });

  it("must allow to detect empty objects", () => {
    var a = {
      page: 1,
      size: 30,
      orderBy: "id",
      sortOrder: "asc",
      search: "",
      timestamp: 10000
    };

    expect(_.isEmpty(a)).toEqual(false, "an object with properties is not empty");
    expect(_.isEmpty({})).toEqual(true, "an object without properties is empty");
    expect(_.isEmpty([])).toEqual(true, "an empty array is empty");
    expect(_.isEmpty(_.minus({ a: 1 }, ["a"]))).toEqual(true, "an empty object is empty");
  });

  it("must allow to not edit objects after first argument", () => {
    var a = { a: 1 };
    var b = { b: 2 };

    _.extend({}, a, b);
    expect("a" in b).toEqual(false);
    expect("b" in a).toEqual(false);
  });

  it("must allow to converts arguments to arrays", () => {
    function a() {
      return _.toArray(arguments);
    }

    var b = a(1, 2, 3, 4);

    expect(b instanceof Array).toEqual(true);
  });

  it("must allow to filter items in arrays", () => {
    var a = _.where([1, 2, 3, 4], x => {
      return x > 2;
    });

    expect(a.length).toEqual(2);
    expect(a[0]).toEqual(3);
    expect(a[1]).toEqual(4);
  });

  it("must allow to check if any item in array respects a predicate", () => {
    var a = _.any([1, 2, 3, 4], x => {
      return x > 2;
    });

    expect(a).toEqual(true);

    var a = _.any([1, 2, 3, 4], x => {
      return x > 20;
    });

    expect(a).toEqual(false);
  });

  it("must allow to check if any key-value pair in object respects a predicate", () => {
    var a = _.any({
      a: true,
      b: null,
      c: undefined
    }, (k, v) => {
      return v === null;
    });

    expect(a).toEqual(true, "one item is null");

    var a = _.any({
      a: true,
      b: null,
      c: undefined
    }, (k, v) => {
      return k === "c";
    });

    expect(a).toEqual(true, "one key is 'c'");

    var a = _.any({
      a: true,
      b: null,
      c: undefined
    }, (k, v) => {
      return v === 10;
    });

    expect(a).toEqual(false, "none of the values is 10");
  });

  it("must allow to check if all items in array respects a predicate", () => {
    var a = _.all([1, 2, 3, 4], x => {
      return x > 2;
    });

    expect(a).toEqual(false, "not all items inside the array are > 2");

    var a = _.all([1, 2, 3, 4], x => {
      return x < 20;
    });

    expect(a).toEqual(true, "all items inside the array are < 20");
  });

  it("must allow to check if all key-value pair in object respects a predicate", () => {
    var a = _.all({
      a: true,
      b: null,
      c: undefined
    }, (k, v) => {
      return typeof v != "number";
    });

    expect(a).toEqual(true, "none of the values is a number");

    var a = _.all({
      a: true,
      b: null,
      c: undefined
    }, (k, v) => {
      return ["a", "b", "c"].indexOf(k) > -1;
    });

    expect(a).toEqual(true, "all keys are in 'a', 'b', 'c'");

    var a = _.all({
      a: true,
      b: null,
      c: undefined
    }, (k, v) => {
      return !v;
    });

    expect(a).toEqual(false, "not all values are falsy");
  });

  it("must allow to check for equivalent objects in Pythonic fashion", () => {
    var a = _.equal([1, 2, 3, 4], [1, 2, 3, 4]);
    expect(a).toEqual(true, "list with same items in the same order are equal");

    a = _.equal([4, 3, 2, 1], [1, 2, 3, 4]);
    expect(a).toEqual(false, "list with same items in different order are not equal");

    a = { a: 1 };
    var b = { a: 1 };
    expect(_.equal(a, b)).toEqual(true);
    expect(_.equal(a, b)).toEqual(true);

    a = { a: 2 };
    expect(_.equal(a, b)).toEqual(false);

    b = { a: 2, b: false };
    expect(_.equal(a, b)).toEqual(false);
  });

  it("must allow to check for equivalent objects with empty values", () => {
    var a, b;
    a = {
      "page": 1,
      "size": 30,
      "orderBy": "",
      "sortOrder": "",
      "search": "",
      x: undefined,
      y: null
    }
    b = {
      "page": 1,
      "size": 30,
      "orderBy": "",
      "sortOrder": "",
      "search": "",
      x: undefined,
      y: null
    }
    expect(_.equal(a, b)).toEqual(true, "items with empty values");
  })

  it("must allow to check for equivalent arrays of objects", () => {
    var a = _.equal([
      {
        "name": "id",
        "type": "id",
        "hidden": true,
        "secret": true,
        "css": "id",
        "displayName": "id"
      },
      {
        "name": "name",
        "type": "string",
        "displayName": "Name",
        "position": 0,
        "css": "name"
      },
      {
        "name": "value",
        "type": "string",
        "displayName": "Value",
        "position": 1,
        "css": "value"
      }
    ], [
      {
        "name": "id",
        "type": "id",
        "hidden": true,
        "secret": true,
        "css": "id",
        "displayName": "id"
      },
      {
        "name": "name",
        "type": "string",
        "displayName": "Name",
        "position": 0,
        "css": "name"
      },
      {
        "name": "value",
        "type": "string",
        "displayName": "Value",
        "position": 1,
        "css": "value"
      }
    ]);

    expect(a).toEqual(true)

    var columns = [
      {
        "name": "id",
        "type": "id",
        "hidden": true,
        "secret": true,
        "css": "id",
        "displayName": "id"
      },
      {
        "name": "name",
        "type": "string",
        "displayName": "Name",
        "position": 0,
        "css": "name"
      },
      {
        "name": "value",
        "type": "string",
        "displayName": "Value",
        "position": 1,
        "css": "value"
      }
    ];
    expect(_.equal(columns, [
      {
        "name": "id",
        "type": "id",
        "hidden": true,
        "secret": true,
        "css": "id",
        "displayName": "id"
      },
      {
        "name": "name",
        "type": "string",
        "displayName": "Name",
        "position": 0,
        "css": "name"
      },
      {
        "name": "value",
        "type": "string",
        "displayName": "Value",
        "position": 1,
        "css": "value"
      }
    ])).toEqual(true);
  });

  it("must allow to check for equivalent objects with subproperties", () => {
    var a = { a: 1, c: { d: 2 } };
    var b = { a: 1, c: { d: 2 } };

    expect(_.equal(a, b)).toEqual(true);
  });

  it("must allow to flatten arrays", () => {
    var a = _.flatten([[1, 2, 3, 4], [5, 6], [7, 8]]);
    expect(_.equal(a, [1, 2, 3, 4, 5, 6, 7, 8])).toEqual(true);
  });

  it("must allow to check if objects have properties", () => {
    expect(_.has({ a: false }, "a")).toEqual(true);
    expect(_.has({ a: false }, "b")).toEqual(false);
  });

  it("must allow to execute functions at most n times", () => {
    var a = 0;
    function b() { a++; }
    var c = _.atMost(5, b);

    c();
    expect(a).toEqual(1);

    c();
    expect(a).toEqual(2);

    c();
    expect(a).toEqual(3);

    c();
    expect(a).toEqual(4);

    c();
    expect(a).toEqual(5);

    c();
    expect(a).toEqual(5);

    c();
    expect(a).toEqual(5);
  });

  it("must allow to execute functions at most once", () => {
    var a = 0;
    function b() { a++; }
    var c = _.once(b);

    c();
    expect(a).toEqual(1);

    c();
    expect(a).toEqual(1);

    c();
    expect(a).toEqual(1);
  });

  it("must allow to execute functions at most once, with context", () => {
    var a = 0, sentinel = {};
    function b() {
      a++;
      expect(this).toEqual(sentinel);
    }
    var c = _.once(b, sentinel);

    c();
    expect(a).toEqual(1);

    c();
    expect(a).toEqual(1);
  });

  it("must allow to get max items by predicate", () => {
    var a = [
      { name: "Roberto", age: 30 },
      { name: "Edyta", age: 28 },
      { name: "Tyberiusz", age: 1 }
    ];

    expect(_.max(a, x => { return x.age; })).toEqual(30);
    expect(_.min(a, x => { return x.age; })).toEqual(1);

    expect(_.withMax(a, x => { return x.age; })).toEqual(a[0]);
    expect(_.withMin(a, x => { return x.age; })).toEqual(a[2]);
  });

  it("must allow to clone objects deeply", () => {
    var a = {
      b: /test/g,
      c: "ASD",
      d: false,
      e: {
        a: 100,
        b: ["a", "b", "c", { a: "foo" }]
      },
      f: new Date(1986, 4, 30)
    };

    var x = _.clone(a);
    expect(a !== x).toEqual(true, "cloned object must not reference the original object");
    expect(x.b instanceof RegExp).toEqual(true, "cloned object must keep regex property");
    expect(x.b !== a.b).toEqual(true, "cloned regex property must not reference the original property");
    expect(x.b.source == a.b.source && x.b.flags == a.b.flags).toEqual(true, "cloned regex property must equal the original regex");
    expect(typeof x.c == "string" && x.c == a.c).toEqual(true, "cloned string property must equal the original");
    expect(typeof x.d == "boolean" && x.d === a.d).toEqual(true, "cloned boolean property must equal the original");
    expect(x.f instanceof Date).toEqual(true, "cloned Date property must be a Date");
    expect(x.f.getTime() == a.f.getTime()).toEqual(true, "cloned Date property must equal the original");
    expect(typeof x.e == "object" && _.equal(x.e, a.e)).toEqual(true, "cloned object property must equal the original");
    expect(typeof x.e.a == "number" && x.e.a === a.e.a).toEqual(true, "cloned subproperty of a clone object property must equal the original");
    expect(x.e.b instanceof Array).toEqual(true, "cloned Array subproperty of a clone object property must be an array");
    expect(x.e.b.length === a.e.b.length).toEqual(true, "cloned Array subproperty must be of the same length of the original");
    expect(x.e.b !== a.e.b).toEqual(true, "cloned Array subproperty must be a different instance than the original");
    expect(x.e.b[0] == a.e.b[0]).toEqual(true, "cloned Array subproperty item must equal to the original");
    expect(x.e.b[3] !== a.e.b[3]).toEqual(true, "cloned Array subproperty object item must be a clone of the original");
    expect(x.e.b[3].a === a.e.b[3].a).toEqual(true, "cloned Array subproperty object item subproperty must be a clone of the original");
  });

  it("must allow to clone items", () => {
    var a = {
      b: /test/g,
      c: "ASD",
      d: false
    };

    var b = _.clone(a);
    expect(b.d).toEqual(a.d);

    a.d = true;
    expect(b.d).toEqual(false);
  })

  it("must allow to clone items with null values", () => {
    var a = {
      message: null,
      greetings: "Ciao",
      something: undefined
    };

    var b = _.clone(a);
    expect(b.message).toEqual(a.message);
    expect(b.greetings).toEqual(a.greetings);
    expect(b.something).toEqual(a.something);
  })

  it("must allow to clone items with arrays, deeply", () => {
    var a = {
      b: [1, 2, 3, 4]
    };

    var b = _.clone(a);
    expect(b.b).toEqual(a.b);

    a.b.push(5);
    expect(b.b).toEqual([1, 2, 3, 4]);
  })

  it("must allow to clone items with arrays with objects, deeply", () => {
    var a = {
      b: [{ message: "Hello"}]
    };

    var b = _.clone(a);
    expect(b.b).toEqual(a.b);

    a.b[0].message = "World";
    expect(b.b[0].message).toEqual("Hello");
  })

  it("must allow to define partial functions", () => {
    var sentinel = {};
    function a(b, c) {
      expect(b).toEqual(sentinel);
      expect(c).toEqual("hello");
      return c;
    }

    var partial = _.partial(a, sentinel);
    partial("hello");
  });

  it("must allow to check whether an object quacks like a Promise", () => {
    var PromiseLike = {
      then: function () {

      }
    };

    expect(_.quacksLikePromise(PromiseLike)).toEqual(true, "An object with `then` function quacks like a Promise");
    expect(_.quacksLikePromise([])).toEqual(false, "An array does not quack like a Promise");
    expect(_.quacksLikePromise(null)).toEqual(false, "null does not quack like a Promise");
    expect(_.quacksLikePromise(3)).toEqual(false, "A number does not quack like a Promise");
    expect(_.quacksLikePromise(new Promise(function (resolve, reject) {
      resolve();
    }))).toEqual(true, "An instance of Promise definitely quacks like a Promise!");
  });

  it("must allow to rotate matrixes", () => {
    var m = [
      ["A", "B", "C", "D"],
      [1, 2, 3, 4],
      [5, 6, 7, 8],
      [9, 10, 11, 12]
    ];

    var cols = _.cols(m);
    expect(_.equal(cols, [
      ["A", 1, 5, 9],
      ["B", 2, 6, 10],
      ["C", 3, 7, 11],
      ["D", 4, 8, 12],
    ])).toEqual(true);
  });

  it("must allow to obtain list of string arguments", () => {
    function aa() {
      var a = _.stringArgs(arguments);
      expect(a.length).toEqual(3, "a single argument with spaces should be splitted");
      expect(a[0]).toEqual("vestigia");
      expect(a[1]).toEqual("nulla");
      expect(a[2]).toEqual("retrorsum");
    }
    aa("vestigia nulla retrorsum");
  })

  it("must allow to obtain list of string (single string)", () => {
    function aa() {
      var a = _.stringArgs(arguments);
      expect(a.length).toEqual(1, "a single argument must be kept as is");
      expect(a[0]).toEqual("Paracletus");
    }
    aa("Paracletus");
  })

  it("must allow to obtain list of string arguments (multiple)", () => {
    function aa() {
      var a = _.stringArgs(arguments);
      expect(a.length).toEqual(2, "two arguments should be kept");
      expect(a[0]).toEqual("vestigia nulla retrorsum");
      expect(a[1]).toEqual("Paracletus");
      expect(a[2]).toEqual(undefined);
    }
    aa("vestigia nulla retrorsum", "Paracletus");
  })

  it("must allow to obtain list of string arguments (none)", () => {
    function aa() {
      var a = _.stringArgs(arguments);
      expect(a instanceof Array).toEqual(true, "no arguments should not cause exception");
      expect(a.length).toEqual(0, "no arguments should return empty array");
    }
    aa();
  })

  it("must allow to execute a function n times", () => {
    var i = 0;
    function a() { i++; }

    _.exec(a, 10);
    expect(i).toEqual(10, "given function must be executed n times synchronously");
  })

  it("must allow to edit items in arrays", () => {
    var a = [1, 2, 3, 4, 5];
    _.reach(a, i => { return i * 2; });

    expect(a[0]).toEqual(2, "first item must be modified");
    expect(a[1]).toEqual(4, "second item must be modified");
    expect(a[2]).toEqual(6, "third item must be modified");
    expect(a[3]).toEqual(8, "fourth item must be modified");
    expect(a[4]).toEqual(10, "fifth item must be modified");
  })

  it("must allow to edit items in arrays, deeply", () => {
    var a = [[1, 2, 3, 4, 5], [50, 60, 70]];
    _.reach(a, i => { return i * 2; });

    expect(a[0][0]).toEqual(2, "first item must be modified");
    expect(a[0][1]).toEqual(4, "second item must be modified");
    expect(a[0][2]).toEqual(6, "third item must be modified");
    expect(a[0][3]).toEqual(8, "fourth item must be modified");
    expect(a[0][4]).toEqual(10, "fifth item must be modified");

    expect(a[1][0]).toEqual(100, "first item must be modified");
    expect(a[1][1]).toEqual(120, "second item must be modified");
    expect(a[1][2]).toEqual(140, "third item must be modified");
  })

  it("must allow to find items in arrays", () => {
    var a = [{ a: 1 }, { a: 2 }, { a: 3 }];
    var item = _.find(a, o => { return o.a === 3; });
    expect(item).toEqual(a[2], "the third item has `a` equal to 3")

    item = _.find(a, o => { return o.a > 1; });
    expect(item).toEqual(a[1], "the first item respecting the predicate must be returned")
  })

  it("must allow to find items in objects", () => {
    var a = {
      "name": { a: 1 },
      "lorem": { a: 2 },
      "ipsum": { a: 3 }
    };
    var item = _.find(a, o => { return o.a === 3; });
    expect(item).toEqual(a["ipsum"], "the ipsum property has `a` equal to 3")

    item = _.find(a, o => { return o.a > 1; });
    expect(item).toEqual(a["lorem"], "the lorem property is the first with `a` property respecting the predicate")
  })

  it("must allow to replace mustaches variables in strings", () => {
    var a = "Hello {{name}}";
    var s = _.format(a, { name: "World" });
    expect(s).toEqual("Hello World")
  })

  it("must allow to replace mustaches variables in strings, with many recourrences", () => {
    var a = "Hello {{name}} {{name}} {{name}}";
    var s = _.format(a, { name: "World" });
    expect(s).toEqual("Hello World World World")
  })

  it("must allow to replace mustaches variables in strings, supporting missing values", () => {
    var a = "Hello {{name}} {{foo}}";
    var s = _.format(a, { name: "World" });
    expect(s).toEqual("Hello World {{foo}}")
  })

  it("must allow to obtain unique ids", () => {
    var a = _.uniqueId(), b = _.uniqueId();
    expect(/^id\d+$/.test(a) && /^id\d+$/.test(b)).toEqual(true);
    expect(a != b).toEqual(true);
  })

  it("must allow to obtain unique ids with prefix", () => {
    var a = _.uniqueId("foo");
    expect(/^foo\d+$/.test(a)).toEqual(true);
  })

  it("must allow to reset unique id seed", () => {
    _.resetSeed();
    var a = _.uniqueId("foo");
    expect(a).toEqual("foo0");

    a = _.uniqueId("foo");
    expect(a).toEqual("foo1");

    a = _.uniqueId("foo");
    expect(a).toEqual("foo2");

    a = _.uniqueId("foo");
    expect(a).toEqual("foo3");

    _.resetSeed();
    a = _.uniqueId("foo");
    expect(a).toEqual("foo0");
  })

  it("must allow to map arrays", () => {
    var a = [1, 2, 3, 4, 5];
    var b = _.map(a, x => x * x);

    expect(b).toEqual([1, 4, 9, 16, 25])
  })

  it("must allow to map objects", () => {
    var a = {
      "foo": "FOO",
      "ofo": "OFO"
    };
    var b = _.map(a, (k, v) => {
      return k + v;
    });

    expect(b).toEqual(["fooFOO", "ofoOFO"])
  })

  it("must distinguish plain objects", () => {
    expect(_.isPlainObject({})).toEqual(true);
    expect(_.isPlainObject({ a: "Hello" })).toEqual(true);
    expect(_.isPlainObject([])).toEqual(false);
    expect(_.isPlainObject("")).toEqual(false);
    expect(_.isPlainObject(1)).toEqual(false);
    expect(_.isPlainObject(/asd/)).toEqual(false);
    expect(_.isPlainObject(true)).toEqual(false);
    expect(_.isPlainObject(null)).toEqual(false);
    expect(_.isPlainObject(undefined)).toEqual(false);
    expect(_.isPlainObject(function() {})).toEqual(false);
  })
});
