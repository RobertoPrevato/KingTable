/**
 * Tests for menus HTML functions.
 * https://github.com/RobertoPrevato/KingTable
 *
 * Copyright 2017, Roberto Prevato
 * https://robertoprevato.github.io
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */
import _ from "../scripts/utils"
import { VHtmlElement, VTextElement, VCommentElement, VWrapperElement } from "../scripts/data/html"
import { menuBuilder, menuItemBuilder } from "../scripts/menus/kingtable.menu.html"

describe("Function menuItemBuilder", () => {

  it("must allow to generate HTML for a menu item with span", () => {
    var el = menuItemBuilder({
      name: "Lorem ipsum"
    })
    expect(el instanceof VHtmlElement).toEqual(true);
    var html = el.toString();
    expect(html).toEqual(`<li><span tabindex="0">Lorem ipsum</span></li>`);
  })

  it("must allow to generate HTML for a menu item with span and id for wrapper", () => {
    var el = menuItemBuilder({
      id: "lorem",
      name: "Lorem ipsum"
    })
    expect(el instanceof VHtmlElement).toEqual(true);
    var html = el.toString();
    expect(html).toEqual(`<li id="lorem"><span tabindex="0">Lorem ipsum</span></li>`);
  })

  it("must allow to generate HTML for a menu item with span and id for wrapper and child element", () => {
    var el = menuItemBuilder({
      id: "lorem",
      name: "Lorem ipsum",
      attr: {
        id: "ipsum"
      }
    })
    expect(el instanceof VHtmlElement).toEqual(true);
    var html = el.toString();
    expect(html).toEqual(`<li id="lorem"><span tabindex="0" id="ipsum">Lorem ipsum</span></li>`);
  })

  it("must allow to generate HTML for a menu item with span and class", () => {
    var el = menuItemBuilder({
      name: "Lorem ipsum",
      attr: {
        "class": "lorem-ipsum"
      }
    })
    expect(el instanceof VHtmlElement).toEqual(true);
    var html = el.toString();
    expect(html).toEqual(`<li><span tabindex="0" class="lorem-ipsum">Lorem ipsum</span></li>`);
  })

  it("must allow to generate HTML for a menu item with span and class using `css` property", () => {
    var el = menuItemBuilder({
      name: "Lorem ipsum",
      attr: {
        css: "lorem-ipsum"
      }
    })
    expect(el instanceof VHtmlElement).toEqual(true);
    var html = el.toString();
    expect(html).toEqual(`<li><span tabindex="0" class="lorem-ipsum">Lorem ipsum</span></li>`);
  })

  it("must allow to generate HTML for a menu item with anchor", () => {
    var el = menuItemBuilder({
      name: "Lorem ipsum",
      href: "#/lorem-ipsum"
    })
    expect(el instanceof VHtmlElement).toEqual(true);
    var html = el.toString();
    expect(html).toEqual(`<li><a href="#/lorem-ipsum">Lorem ipsum</a></li>`);
  })

  it("must allow to generate HTML for a menu item with anchor and class", () => {
    var el = menuItemBuilder({
      name: "Lorem ipsum",
      href: "#/lorem-ipsum",
      attr: {
        "class": "lorem-ipsum"
      }
    })
    expect(el instanceof VHtmlElement).toEqual(true);
    var html = el.toString();
    expect(html).toEqual(`<li><a href="#/lorem-ipsum" class="lorem-ipsum">Lorem ipsum</a></li>`);
  })

  it("must allow to generate HTML for a menu item with anchor and class using `css` property", () => {
    var el = menuItemBuilder({
      name: "Lorem ipsum",
      href: "#/lorem-ipsum",
      attr: {
        css: "lorem-ipsum"
      }
    })
    expect(el instanceof VHtmlElement).toEqual(true);
    var html = el.toString();
    expect(html).toEqual(`<li><a href="#/lorem-ipsum" class="lorem-ipsum">Lorem ipsum</a></li>`);
  })

  it("must allow to generate HTML for a menu item with label and checkbox", () => {
    _.resetSeed();
    var el = menuItemBuilder({
    name: "Display name",
    type: "checkbox",
    attr: { // any attribute to add to the generated html
      "name": "input-attribute",  // input attribute
      "class": "some-item"
    }
  })
    expect(el instanceof VHtmlElement).toEqual(true);
    // indentation is used to improve readability of text;
    var html = el.toString(2, "_");
    expect(html).toEqual(
`<li>
__<input name="input-attribute" class="some-item" id="mnck-0" type="checkbox" />
__<label for="mnck-0">
____Display name
__</label>
</li>
`);
  })

  it("must allow to generate HTML for a menu item with label and checked checkbox", () => {
    _.resetSeed();
    var el = menuItemBuilder({
    name: "Display name",
    type: "checkbox",
    checked: true,
    attr: { // any attribute to add to the generated html
      "name": "input-attribute",  // input attribute
      "class": "some-item"
    }
  })
    expect(el instanceof VHtmlElement).toEqual(true);
    // indentation is used to improve readability of text;
    var html = el.toString(2, "_");
    expect(html).toEqual(
`<li>
__<input name="input-attribute" class="some-item" id="mnck-0" type="checkbox" checked />
__<label for="mnck-0">
____Display name
__</label>
</li>
`);
  })

  it("must allow to generate HTML for a menu item with label and radio", () => {
    _.resetSeed();
    var el = menuItemBuilder({
    name: "Display name",
    checked: true,
    type: "radio",
    value: "some-value", // this is the radio value; and is required
    attr: { // any attribute to add to the generated html
      "name": "input-attribute",  // input attribute
      "class": "some-item"
    }
  })
    expect(el instanceof VHtmlElement).toEqual(true);
    // indentation is used to improve readability of text;
    var html = el.toString(2, "_");
    expect(html).toEqual(
`<li>
__<input name="input-attribute" class="some-item" id="mnrd-0" type="radio" checked value="some-value" />
__<label for="mnrd-0">
____Display name
__</label>
</li>
`);
  })
})

describe("Function menuBuilder", () => {

  it("must allow to generate HTML for a menu without items", () => {
    var el = menuBuilder({
      name: "Lorem ipsum"
    })
    expect(el instanceof VWrapperElement).toEqual(true);
    var html = el.toString();
    expect(html).toEqual(`<ul class="ug-menu"></ul>`);
  })

  it("must allow to generate HTML for a menu with one span item", () => {
    var el = menuBuilder({
      name: "Lorem ipsum",
      items: [
        {
          name: "Lorem ipsum"
        }
      ]
    })
    expect(el instanceof VWrapperElement).toEqual(true);
    var html = el.toString();
    expect(html).toEqual(`<ul class="ug-menu"><li><span tabindex="0">Lorem ipsum</span></li></ul>`);
  })

  it("must allow to generate HTML for a menu with one span item and one checkbox item", () => {
    _.resetSeed();
    var el = menuBuilder({
      name: "Lorem ipsum",
      items: [
        {
          name: "Lorem ipsum"
        },
        {
          name: "Display name",
          checked: true,
          type: "checkbox",
          attr: { // any attribute to add to the generated html
            "name": "input-attribute",  // input attribute
            "class": "some-item"
          }
        }
      ]
    })
    expect(el instanceof VWrapperElement).toEqual(true);
    var html = el.toString(2, "_");
    expect(html).toEqual(
`<ul class="ug-menu">
__<li>
____<span tabindex="0">
______Lorem ipsum
____</span>
__</li>
__<li>
____<input name="input-attribute" class="some-item" id="mnck-0" type="checkbox" checked />
____<label for="mnck-0">
______Display name
____</label>
__</li>
</ul>
`);
  })

  it("must allow to generate HTML for a menu with one span item and one radio item", () => {
    _.resetSeed();
    var el = menuBuilder({
      name: "Lorem ipsum",
      items: [
        {
          name: "Lorem ipsum"
        },
        {
          name: "Display name",
          checked: true,
          type: "radio",
          value: "some-value", // this is the radio value; and is required
          attr: { // any attribute to add to the generated html
            "name": "input-attribute",  // input attribute
            "class": "some-item"
          }
        }
      ]
    })
    expect(el instanceof VWrapperElement).toEqual(true);
    var html = el.toString(2, "_");
    expect(html).toEqual(
`<ul class="ug-menu">
__<li>
____<span tabindex="0">
______Lorem ipsum
____</span>
__</li>
__<li>
____<input name="input-attribute" class="some-item" id="mnrd-0" type="radio" checked value="some-value" />
____<label for="mnrd-0">
______Display name
____</label>
__</li>
</ul>
`);
  })

  it("must allow to generate HTML for a menu with many radio items, with unique id", () => {
    _.resetSeed();
    var el = menuBuilder({
      name: "Lorem ipsum",
      items: [
        {
          name: "Cats",
          checked: true,
          type: "radio",
          value: "cats", // this is the radio value; and is required
          attr: { // any attribute to add to the generated html
            "name": "favorite-animals",  // input attribute
            "class": "some-item"
          }
        },
        {
          name: "Dogs",
          checked: true,
          type: "radio",
          value: "dogs", // this is the radio value; and is required
          attr: { // any attribute to add to the generated html
            "name": "favorite-animals",  // input attribute
            "class": "some-item"
          }
        },
        {
          name: "Snakes",
          checked: true,
          type: "radio",
          value: "snakes", // this is the radio value; and is required
          attr: { // any attribute to add to the generated html
            "name": "favorite-animals",  // input attribute
            "class": "some-item"
          }
        },
      ]
    })
    expect(el instanceof VWrapperElement).toEqual(true);
    var html = el.toString(2, "_");
    expect(html).toEqual(
`<ul class="ug-menu">
__<li>
____<input name="favorite-animals" class="some-item" id="mnrd-0" type="radio" checked value="cats" />
____<label for="mnrd-0">
______Cats
____</label>
__</li>
__<li>
____<input name="favorite-animals" class="some-item" id="mnrd-1" type="radio" checked value="dogs" />
____<label for="mnrd-1">
______Dogs
____</label>
__</li>
__<li>
____<input name="favorite-animals" class="some-item" id="mnrd-2" type="radio" checked value="snakes" />
____<label for="mnrd-2">
______Snakes
____</label>
__</li>
</ul>
`);
})

  it("must allow to generate HTML for a menu with many checkbox items, with unique id", () => {
    _.resetSeed();
    var el = menuBuilder({
      items: [
        {
          name: "Cats",
          checked: true,
          type: "checkbox",
          attr: { // any attribute to add to the generated html
            "name": "cats",  // input attribute
            "class": "some-item"
          }
        },
        {
          name: "Dogs",
          checked: true,
          type: "checkbox",
          attr: { // any attribute to add to the generated html
            "name": "dogs",  // input attribute
            "class": "some-item"
          }
        },
        {
          name: "Snakes",
          checked: true,
          type: "checkbox",
          attr: { // any attribute to add to the generated html
            "name": "snakes",  // input attribute
            "class": "some-item"
          }
        },
        {
          name: "Tigers",
          checked: true,
          type: "checkbox",
          attr: { // any attribute to add to the generated html
            "name": "tigers",  // input attribute
            "class": "some-item"
          }
        }
      ]
    })
    expect(el instanceof VWrapperElement).toEqual(true);
    var html = el.toString(2, "_");
    expect(html).toEqual(
`<ul class="ug-menu">
__<li>
____<input name="cats" class="some-item" id="mnck-0" type="checkbox" checked />
____<label for="mnck-0">
______Cats
____</label>
__</li>
__<li>
____<input name="dogs" class="some-item" id="mnck-1" type="checkbox" checked />
____<label for="mnck-1">
______Dogs
____</label>
__</li>
__<li>
____<input name="snakes" class="some-item" id="mnck-2" type="checkbox" checked />
____<label for="mnck-2">
______Snakes
____</label>
__</li>
__<li>
____<input name="tigers" class="some-item" id="mnck-3" type="checkbox" checked />
____<label for="mnck-3">
______Tigers
____</label>
__</li>
</ul>
`);
  })

  it("must allow to generate HTML for a menu with submenus", () => {
    _.resetSeed();
    var el = menuBuilder({
      items: [
      {
        name: "Something",
        menu: {
          id: "some-menu",
          items: [
            {
              name: "Lorem"
            },
            {
              name: "Ipsum"
            },
            {
              name: "Dolor",
              menu: {
                items: [
                  {
                    name: "Sit"
                  },
                  {
                    name: "Amet"
                  },
                  {
                    name: "Consectetur"
                  }
                ]
              }
            }
          ]
        }
      }
    ]
  })
    expect(el instanceof VWrapperElement).toEqual(true);
    var html = el.toString(2, "_");
    expect(html).toEqual(
`<ul class="ug-menu">
__<li class="ug-submenu">
____<span tabindex="0">
______Something
______<span class="oi" data-glyph="caret-right"></span>
____</span>
____<ul id="some-menu" class="ug-menu">
______<li>
________<span tabindex="0">
__________Lorem
________</span>
______</li>
______<li>
________<span tabindex="0">
__________Ipsum
________</span>
______</li>
______<li class="ug-submenu">
________<span tabindex="0">
__________Dolor
__________<span class="oi" data-glyph="caret-right"></span>
________</span>
________<ul class="ug-menu">
__________<li>
____________<span tabindex="0">
______________Sit
____________</span>
__________</li>
__________<li>
____________<span tabindex="0">
______________Amet
____________</span>
__________</li>
__________<li>
____________<span tabindex="0">
______________Consectetur
____________</span>
__________</li>
________</ul>
______</li>
____</ul>
__</li>
</ul>
`);
  })

  it("must allow to generate HTML for a menu with submenus and checkboxes", () => {
    _.resetSeed();
    var el = menuBuilder({
      items: [
      {
        name: "Something",
        menu: {
          id: "some-menu",
          items: [
            {
              name: "Lorem"
            },
            {
              name: "Ipsum"
            },
            {
              name: "Animals invited in the temple",
              menu: {
                items: [
                  {
                    name: "Cats",
                    checked: false,
                    type: "checkbox",
                    attr: { // any attribute to add to the generated html
                      "name": "cats",  // input attribute
                      "class": "some-item"
                    }
                  },
                  {
                    name: "Dogs",
                    checked: false,
                    type: "checkbox",
                    attr: { // any attribute to add to the generated html
                      "name": "dogs",  // input attribute
                      "class": "some-item"
                    }
                  },
                  {
                    name: "Snakes",
                    checked: false,
                    type: "checkbox",
                    attr: { // any attribute to add to the generated html
                      "name": "snakes",  // input attribute
                      "class": "some-item"
                    }
                  },
                  {
                    name: "Tigers",
                    checked: true,
                    type: "checkbox",
                    attr: { // any attribute to add to the generated html
                      "name": "tigers",  // input attribute
                      "class": "some-item"
                    }
                  }
                ]
              }
            }
          ]
        }
      }
    ]
  })
    expect(el instanceof VWrapperElement).toEqual(true);
    var html = el.toString(2, "_");
    expect(html).toEqual(
`<ul class="ug-menu">
__<li class="ug-submenu">
____<span tabindex="0">
______Something
______<span class="oi" data-glyph="caret-right"></span>
____</span>
____<ul id="some-menu" class="ug-menu">
______<li>
________<span tabindex="0">
__________Lorem
________</span>
______</li>
______<li>
________<span tabindex="0">
__________Ipsum
________</span>
______</li>
______<li class="ug-submenu">
________<span tabindex="0">
__________Animals invited in the temple
__________<span class="oi" data-glyph="caret-right"></span>
________</span>
________<ul class="ug-menu">
__________<li>
____________<input name="cats" class="some-item" id="mnck-0" type="checkbox" />
____________<label for="mnck-0">
______________Cats
____________</label>
__________</li>
__________<li>
____________<input name="dogs" class="some-item" id="mnck-1" type="checkbox" />
____________<label for="mnck-1">
______________Dogs
____________</label>
__________</li>
__________<li>
____________<input name="snakes" class="some-item" id="mnck-2" type="checkbox" />
____________<label for="mnck-2">
______________Snakes
____________</label>
__________</li>
__________<li>
____________<input name="tigers" class="some-item" id="mnck-3" type="checkbox" checked />
____________<label for="mnck-3">
______________Tigers
____________</label>
__________</li>
________</ul>
______</li>
____</ul>
__</li>
</ul>
`);
  })
})