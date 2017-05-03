/**
 * Tests for HTML generation classes.
 * https://github.com/RobertoPrevato/KingTable
 *
 * Copyright 2017, Roberto Prevato
 * https://robertoprevato.github.io
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */
import { VHtmlElement, VTextElement, VCommentElement, VWrapperElement } from "../scripts/data/html"

describe("Virtual element classes", () => {
  it("must allow to generate HTML for a single element", () => {
    var a = new VHtmlElement("span")
    expect(a.toString()).toEqual("<span></span>");
  })

  it("must handle boolean attribute `checked`", () => {
    var a = new VHtmlElement("input", {
      "type": "checkbox",
      "checked": true,
      "name": "foo"
    })
    expect(a.toString()).toEqual(`<input type="checkbox" checked name="foo" />`);
  })

  it("must handle boolean attribute `multiple`", () => {
    var a = new VHtmlElement("select", {
      "multiple": true,
      "name": "foo"
    }, [
      new VHtmlElement("option", {
        "value": 1
      }, new VTextElement("A")),
      new VHtmlElement("option", {
        "value": 2
      }, new VTextElement("B")),
      new VHtmlElement("option", {
        "value": 3
      }, new VTextElement("C"))
    ])
    expect(a.toString(2, "_")).toEqual(
`<select multiple name="foo">
__<option value="1">
____A
__</option>
__<option value="2">
____B
__</option>
__<option value="3">
____C
__</option>
</select>
`);
  })

  it("must allow to generate HTML for a single element with text content", () => {
    var a = new VHtmlElement("span", null, [new VTextElement("Hello World!")])
    expect(a.toString()).toEqual("<span>Hello World!</span>");
  })

  it("must allow to generate HTML with single children passed as third parameter", () => {
    var a = new VHtmlElement("span", null, new VTextElement("Hello World!"))
    expect(a.toString()).toEqual("<span>Hello World!</span>");
  })

  it("must escape a text element content", () => {
    var a = new VHtmlElement("span", null, [new VTextElement("<p>Hello World!</p>")])
    expect(a.toString()).toEqual("<span>&lt;p&gt;Hello World!&lt;/p&gt;</span>");
  })

  it("must support null or undefined text content", () => {
    var a = new VHtmlElement("span", null, [new VTextElement(null)])
    expect(a.toString()).toEqual("<span></span>");
  })

  it("must support a text element non-strings parameters", () => {
    var a = new VHtmlElement("span", null, [new VTextElement(200)])
    expect(a.toString()).toEqual("<span>200</span>");
  })

  it("must allow to generate HTML for a single element with HTML comment", () => {
    var a = new VHtmlElement("span", null, [new VCommentElement("Hello World Comment!")])
    expect(a.toString()).toEqual("<span><!--Hello World Comment!--></span>");
  })

  it("must remove inner comments tags from a comment virtual element", () => {
    var a = new VHtmlElement("span", null, [new VCommentElement("Hello <!--World--> Comment!")])
    expect(a.toString()).toEqual("<span><!--Hello World Comment!--></span>");
  })

  it("must allow to generate HTML for a single element with attributes", () => {
    var a = new VHtmlElement("span", {
      "id": "foo",
      "class": "beautiful-soup"
    })
    expect(a.toString()).toEqual("<span id=\"foo\" class=\"beautiful-soup\"></span>");
  })

  it("must allow to set id by attribute", () => {
    var a = new VHtmlElement("span")
    a.id = "foo";
    expect(a.toString()).toEqual("<span id=\"foo\"></span>");
  })

  it("must recognize empty elements", () => {
    var a = new VHtmlElement("img", {
      src: "/foo.jpg",
      alt: "Test image."
    })
    expect(a.empty).toEqual(true, "img is an empty element");
    expect(a.toString()).toEqual("<img src=\"/foo.jpg\" alt=\"Test image.\" />");
  })

  it("must recognize non-empty elements", () => {
    var a = new VHtmlElement("div")

    expect(a.empty).toEqual(false, "div is an empty element");
    expect(a.toString()).toEqual("<div></div>");
  })

  it("must recognize empty elements", () => {
    var a = new VHtmlElement("img", {
      src: "/foo.jpg",
      alt: "Test image."
    })

    expect(a.empty).toEqual(true, "img is an empty element");
    expect(a.toString()).toEqual("<img src=\"/foo.jpg\" alt=\"Test image.\" />");
  })

  it("must allow to define elements with children", () => {
    var a = new VHtmlElement("div", {
      "class": "container"
    }, [new VHtmlElement("span", { id: "foo" }), new VHtmlElement("span", { id: "ufo" })]);

    expect(a.toString()).toEqual('<div class="container"><span id="foo"></span><span id="ufo"></span></div>');
  })

  it("must allow to write HTML with indentation", () => {
    var a = new VHtmlElement("div", {
      "class": "container"
    }, [new VHtmlElement("dl", null, [
      new VHtmlElement("dt"),
      new VHtmlElement("dd")
    ])]);

    var expected =
`<div class="container">
    <dl>
        <dt></dt>
        <dd></dd>
    </dl>
</div>
`.trim()
    expect(a.toString(4).trim()).toEqual(expected);
  })

  it("must allow to write HTML and text elements with indentation", () => {
    var a = new VHtmlElement("div", {
      "class": "container"
    }, [new VHtmlElement("dl", null, [
      new VHtmlElement("dt", null, [new VCommentElement("lorem ipsum dolor sit amet"), new VTextElement("Name")]),
      new VHtmlElement("dd", null, [new VTextElement("Definition")])
    ])]);

    var expected =
`<div class="container">
    <dl>
        <dt>
            <!--lorem ipsum dolor sit amet-->
            Name
        </dt>
        <dd>
            Definition
        </dd>
    </dl>
</div>
`.trim()
    expect(a.toString(4).trim()).toEqual(expected);
  })

  it("must allow to write HTML and text elements with indentation of desired size", () => {
    var a = new VHtmlElement("div", {
      "class": "container"
    }, [new VHtmlElement("dl", null, [
      new VHtmlElement("dt", null, [new VCommentElement("lorem ipsum dolor sit amet"), new VTextElement("Name")]),
      new VHtmlElement("dd", null, [new VTextElement("Definition")])
    ])]);

    var expected =
`<div class="container">
  <dl>
    <dt>
      <!--lorem ipsum dolor sit amet-->
      Name
    </dt>
    <dd>
      Definition
    </dd>
  </dl>
</div>
`.trim()
    expect(a.toString(2).trim()).toEqual(expected);
  })

  it("must allow to write HTML and text elements with indentation of desired size and char", () => {
    var a = new VHtmlElement("div", {
      "class": "container"
    }, [new VHtmlElement("dl", null, [
      new VHtmlElement("dt", null, [new VCommentElement("lorem ipsum dolor sit amet"), new VTextElement("Name")]),
      new VHtmlElement("dd", null, [new VTextElement("Definition")])
    ])]);

    var expected =
`<div class="container">
__<dl>
____<dt>
______<!--lorem ipsum dolor sit amet-->
______Name
____</dt>
____<dd>
______Definition
____</dd>
__</dl>
</div>
`.trim()
    expect(a.toString(2, "_").trim()).toEqual(expected);
  })

  it("must allow to mix HTML fragments to VHTML objects", () => {
    var a = new VHtmlElement("div", {
      "class": "container"
    }, [new VHtmlElement("p", null, [
      "<span>Hello</span><br>",
      "<span>World</span>"
    ])]);

    var expected =
`<div class="container">
__<p>
__<span>Hello</span><br>
__<span>World</span>
__</p>
</div>
`.trim()
    expect(a.toString(2, "_").trim()).toEqual(expected);
  })

  it("must generate HTML skipping hidden elements", () => {
    var a = new VHtmlElement("div", {}, [
      new VHtmlElement("p", null, new VTextElement("Hello")),
      new VHtmlElement("p", null, new VTextElement("World")),
      new VHtmlElement("p", null, new VTextElement("Kitty"))
    ])
    a.children[2].hidden = true;
    expect(a.toString()).toEqual("<div><p>Hello</p><p>World</p></div>");
  })

  it("must allow to generate HTML elements without single root", () => {
    var a = new VWrapperElement([
      new VHtmlElement("p", null, new VTextElement("Hello")),
      new VHtmlElement("p", null, new VTextElement("World"))
    ])
    expect(a.toString()).toEqual("<p>Hello</p><p>World</p>");
  })

  it("must allow to hide VWrapperElement", () => {
    var a = new VHtmlElement("div", null, [
      new VHtmlElement("p", null, new VTextElement("Hello")),
      new VHtmlElement("p", null, new VTextElement("World")),
      new VWrapperElement([
        new VHtmlElement("span", null, new VTextElement("Lorem ipsum")),
        new VHtmlElement("span", null, new VTextElement("dolor sit amet"))
      ]),
      new VHtmlElement("em", null, new VTextElement("Kot"))
    ])
    expect(a.toString()).toEqual("<div><p>Hello</p><p>World</p><span>Lorem ipsum</span><span>dolor sit amet</span><em>Kot</em></div>");

    // hide
    a.children[2].hidden = true;
    expect(a.toString()).toEqual("<div><p>Hello</p><p>World</p><em>Kot</em></div>");
  })
});
