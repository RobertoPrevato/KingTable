/**
 * Tests for DOM utility functions.
 * https://github.com/RobertoPrevato/KingTable
 *
 * Copyright 2017, Roberto Prevato
 * https://robertoprevato.github.io
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */
import $ from "../scripts/dom";

describe("DOM utilities", () => {

  afterAll(function() {
    // remove event handlers
    $.offAll();
    // empty body
    $.empty(document.body);
  });

  it("must distinguish DOM elements", () => {
    var a = document.createElement("script");
    expect($.isElement(a)).toEqual(true);

    expect($.isElement({})).toEqual(false);
  });

  it("must support events namespaces", () => {
    var name = "click.removable";

    var parts = $.splitNamespace(name);
    expect(parts.length).toEqual(2);
    expect(parts[0]).toEqual("click");
    expect(parts[1]).toEqual("removable");

    var name = "click.removable.aaa";
    var parts = $.splitNamespace(name);
    expect(parts.length).toEqual(2);
    expect(parts[0]).toEqual("click");
    expect(parts[1]).toEqual("removable.aaa");
  });

  it("must add and remove classes", () => {
    var a = document.createElement("p");
    $.addClass(a, "waa");

    expect(a.classList.contains("waa")).toEqual(true);

    $.addClass(a, "aaa bbb");

    expect(a.classList.contains("aaa")).toEqual(true);
    expect(a.classList.contains("bbb")).toEqual(true);

    $.removeClass(a, "waa")
    expect(a.classList.contains("waa")).toEqual(false);
  });

  it("must check if elements have classes", () => {
    var a = document.createElement("p");
    a.classList.add("aa");

    expect($.hasClass(a, "aa")).toEqual(true);
    expect($.hasClass(a, "bb")).toEqual(false);
  });

  it("must identify password elements", () => {
    var a = document.createElement("input");
    a.type = "text";
    expect($.isPassword(a)).toEqual(false);

    a.type = "password"
    expect($.isPassword(a)).toEqual(true);

    expect($.isPassword(null)).toEqual(null);
  });

  it("must allow to fire events on elements", () => {
    var a = document.createElement("span");
    
    document.body.appendChild(a);
    var k = 0;
    $.on(a, "click", function (e) {
      k++;
    });

    // fire event
    $.fire(a, "click");
    expect(k).toEqual(1);

    // fire event
    $.fire(a, "click");
    expect(k).toEqual(2);
  });

  it("must allow to define multiple events handlers on elements", () => {
    var a = document.createElement("span");
    
    document.body.appendChild(a);
    var k = 0, j = 0;
    $.on(a, "click", function (e) {
      k++;
    });

    $.on(a, "click", function (e) {
      j++;
    });
    // fire event
    $.fire(a, "click");
    expect(k).toEqual(1);
    expect(j).toEqual(1);

    // fire event
    $.fire(a, "click");
    expect(k).toEqual(2);
    expect(j).toEqual(2);
  });

  it("must allow to unset event handlers by namespace", () => {
    var a = document.createElement("span");
    
    document.body.appendChild(a);
    var k = 0, j = 0;
    $.on(a, "click.foo", function (e) {
      k++;
    });

    $.on(a, "click.ofo", function (e) {
      j++;
    });
    // fire event
    $.fire(a, "click");
    expect(k).toEqual(1);
    expect(j).toEqual(1);

    // off events with `ofo` namespace:
    $.off(a, ".ofo");

    // fire event
    $.fire(a, "click");
    expect(k).toEqual(2, "event handler for k must still be active");
    expect(j).toEqual(1, "event handler for j must be removed by namespace");
  });

  it("must allow to fire and handle events, with namespace", () => {
    var a = document.createElement("span");
    
    document.body.appendChild(a);
    var k = 0;
    $.on(a, "click.foo", function (e) {
      k++;
    });

    // fire event
    $.fire(a, "click");
    expect(k).toEqual(1);
  });

  it("must allow to fire events on elements, with extra data", () => {
    var a = document.createElement("span");
    
    document.body.appendChild(a);
    var k = 0;
    $.on(a, "click", function (e, data) {
      k++;
      expect(typeof data).toEqual("object", "extra data must be an object");
      expect(data.test).toEqual(true, "extra data must match the item passed to fire function");
    });

    // fire event
    $.fire(a, "click", { test: true });
    expect(k).toEqual(1);

    // fire event
    $.fire(a, "click", { test: true });
    expect(k).toEqual(2);
  });

  it("must allow to fire events on elements, with extra data", () => {
    var a = document.createElement("span");
    
    document.body.appendChild(a);
    var k = 0;
    $.on(a, "click", function (e, data) {
      k++;
      expect(typeof data).toEqual("object", "extra data must be an object");
      expect(data.test).toEqual(true, "extra data must match the item passed to fire function");
    });

    // fire event
    $.fire(a, "click", { test: true });
    expect(k).toEqual(1);

    // fire event
    $.fire(a, "click", { test: true });
    expect(k).toEqual(2);
  });

  it("must allow to unset all event handlers at once", () => {
    var a = document.createElement("span");
    
    document.body.appendChild(a);
    var k = 0, j = 0;
    $.on(a, "click.foo", function (e) {
      k++;
    });

    $.on(a, "click.ofo", function (e) {
      j++;
    });
    // fire event
    $.fire(a, "click");
    expect(k).toEqual(1);
    expect(j).toEqual(1);

    // off events with `ofo` namespace:
    $.offAll();

    // fire event
    $.fire(a, "click");
    expect(k).toEqual(1, "event handler for k must be removed");
    expect(j).toEqual(1, "event handler for j must be removed");
  });

  it("must allow to get the siblings of an element", () => {
    var a = document.createElement("ul");
    a.innerHTML = (`
    <li>lorem</li>
    <li>ipsum</li>
    <li>dolor</li>
    <li>sit</li>
    `);
    
    var ipsum = a.children[1];
    expect(ipsum.innerText).toEqual("ipsum")

    var siblings = $.siblings(ipsum);
    expect(siblings instanceof Array).toEqual(true, "siblings return object must be an array");
    expect(siblings.length).toEqual(3, "ipsum element has three siblings");
    expect(siblings[0].innerText).toEqual("lorem");
    expect(siblings[1].innerText).toEqual("dolor");
    expect(siblings[2].innerText).toEqual("sit");
  });

  it("must allow to get the next siblings of an element", () => {
    var a = document.createElement("ul");
    a.innerHTML = (`
    <li>lorem</li>
    <li>ipsum</li>
    <li>dolor</li>
    <li>sit</li>
    `);
    
    var ipsum = a.children[1];
    expect(ipsum.innerText).toEqual("ipsum")

    var siblings = $.nextSiblings(ipsum);
    expect(siblings instanceof Array).toEqual(true, "siblings return object must be an array");
    expect(siblings.length).toEqual(2, "ipsum element has two next siblings");
    expect(siblings[0].innerText).toEqual("dolor");
    expect(siblings[1].innerText).toEqual("sit");
  });

  it("must allow to get the previous siblings of an element", () => {
    var a = document.createElement("ul");
    a.innerHTML = (`
    <li>lorem</li>
    <li>ipsum</li>
    <li>dolor</li>
    <li>sit</li>
    `);
    
    var ipsum = a.children[1];
    expect(ipsum.innerText).toEqual("ipsum")

    var siblings = $.prevSiblings(ipsum);
    expect(siblings instanceof Array).toEqual(true, "siblings return object must be an array");
    expect(siblings.length).toEqual(1, "ipsum element has one previous sibling");
    expect(siblings[0].innerText).toEqual("lorem");
  });

  it("must allow to get the closest element by tagname", () => {
    var a = document.createElement("ul");
    a.innerHTML = (`
    <li>lorem
      <div>
        <div>
          <span class="foo">ipsum</span>
        </div>
      </div>
    </li>
    `);
    
    var lorem = a.querySelector(".foo")
    expect(lorem.innerText).toEqual("ipsum")

    var closestDiv = $.closestWithTag(lorem, "div")
    expect(closestDiv).toEqual(lorem.parentElement, "closest div of .foo is its parent");

    var closestLi = $.closestWithTag(lorem, "li")
    expect(closestLi).toEqual(a.children[0], "closest li of .foo is list's first child");

    var closestUl = $.closestWithTag(lorem, "ul")
    expect(closestUl).toEqual(a, "closest ul of .foo is list's element");
  });

  it("must return the element itself as its closest element by tag", () => {
    var a = document.createElement("ul");
    a.innerHTML = (`
    <li>lorem
      <div>
        <div>
          <span class="foo">ipsum</span>
        </div>
      </div>
    </li>
    `);
    
    var lorem = a.querySelector(".foo")
    expect(lorem.innerText).toEqual("ipsum")

    var closestSpan = $.closestWithTag(lorem, "span")
    expect(closestSpan).toEqual(lorem, "closest span of .foo is itself");
  });

  it("must return the element itself as its closest element by tag, excluding itself", () => {
    var a = document.createElement("ul");
    a.innerHTML = (`
    <li>lorem
      <div>
        <div>
          <span class="foo">ipsum</span>
        </div>
      </div>
    </li>
    `);
    
    var lorem = a.querySelector(".foo")
    expect(lorem.innerText).toEqual("ipsum")

    var closestSpan = $.closestWithTag(lorem, "span", true)
    expect(closestSpan).toEqual(undefined, "closest span of .foo, beside itself, is undefined");
  });
});
