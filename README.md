# KingTable 2
Table widget for administrative tables that are able to build themselves, on the basis of their input data.
Supports client and server side pagination; client and server side search; custom filters views; automatic menu to hide columns and support for custom tools. Client side export feature into: csv, json and xml formats.

## Objectives of the library
* Allow the implementation of administrative tables with the [smallest amount of code possible](https://github.com/RobertoPrevato/KingTable/wiki/Minimum-effort).
* Allow for easy customization of generated HTML, to adapt to different needs: e.g. displaying pictures thumbnails, anchor tags, etc.
* Support both collections that require server side pagination, and collections that don't require server side pagination, but may still benefit from client side pagination.

## Live demo
The following demos are available online:
* [Live demo](https://robertoprevato.github.io/demos/kingtable/index.html)

## Documentation
Refer to the [wiki page](https://github.com/RobertoPrevato/KingTable/wiki).
A full list of possible options is available inside the dedicated [wiki page](https://github.com/RobertoPrevato/KingTable/wiki/Options).

## Browsers support
KingTable 2.0 has been tested in the following browsers:

| Browser  | Version |
|----------|---------|
| Chrome   | 55      |
| Firefox  | 53      |
| Edge     | TODO: TEST      |
| IE       | 11      |
| IE       | 10      |

## Previous version
The previous version of the KingTable library is still available at: [https://github.com/RobertoPrevato/jQuery-KingTable](https://github.com/RobertoPrevato/jQuery-KingTable).

### Features of the new version
Following is a table listing the features that were added to KingTable 2.0.

| Feature                             | Description                                                                                                                                                        |
|-------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| ES6 source code                     | ES6 source code, library is transpiled to ES5 for distribution.                                                                                                    |
| Unit tested source code             | Source code is integrated with Gulp tasks, Karma, Jasmine for unit tests. Almost 300 tests.                                                                        |
| Removed dependencies                | Removed dependency from jQuery, Lodash, I.js, R.js.                                                                                                                |
| Improved exceptions                 | Raised exceptions include a link to GitHub wiki with detailed instructions                                                                                         |
| LRU cache                           | _Least Recently Used_ caching mechanism to cache the last _n_ pages by filters, to reduce number of AJAX requests.                                                 |
| Caching of filters                  | Filters for each table are cached using client side storage (configurable), so they are persisted upon page refresh.                                               |
| Improved _CS_ sorting               | Strings that can be sorted like numbers (like "25%", "25.40 EUR", "217°") are automatically parsed as numbers when sorting.                                        |
| Improved _CS_ sorting               | Client side sorting by multiple properties.                                                                                                                        |
| Improved _CS_ search                | Client side search feature has been improved: search works in culture dependent string representations of dates and numbers and other formatted strings.           |
| Improved support for event handlers | Custom event handlers receive automatically the clicked item as parameter, if applicable.                                                                          |
| Improved support for custom buttons | It's now possible to configure extra fields (such as buttons) to be rendered for each item.                                                                        |
| Improved support for other medias   | Support for NodeJS console applications and HTML tables rendering for email bodies sent using NodeJS.                                                              |

## Modes
The KingTable widget implements two working modes:
* fixed (collections that do not require server side pagination)
* normal (collections that require server side pagination)

And supports both optimized and simple collections. Refer to the [dedicated wiki page](https://github.com/RobertoPrevato/KingTable/wiki/Working-modes) for more information.

### Fixed mode
A fixed table is displaying a collection that doesn't require server side pagination, but may still benefit from client side pagination.
When working on applications, it commonly happens to deal with collections that are not meant to grow over time, and they have a small size.
For example, a table of *categories* in a e-commerce website to sell clothes, or a table of *user roles* in most applications.
In these cases, it makes sense to return whole collections to the clients.
There are two ways to define a fixed KingTable:
* instantiating a KingTable with **url** from where to fetch a collection; then code the server side to return an array of items
* instantiating a KingTable passing a **data** option with an instance of array: in this case, it is assumed that the collection is fixed
```js
var table = new KingTable({
  data: [{...},{...},{...}]
});
//or... code the server side to return an array of items (instead of an object describing a paginated set of results)
var table = new KingTable({
  element:  document.getElementById("my-table"),
  url: "/api/categories"
});
```
Fixed tables perform search and pagination on the client side.

### Normal mode
A normal table is one displaying a collection that requires server side pagination, since it is meant to grow over time.
This is true in most cases, for example tables of *products* and *customers* in a e-commerce website.
```js
var table = new KingTable({
  url: "/api/profiles"
});
```
When receiving an AJAX response, a normal table expects to receive the following structure:
```js
{
  subset: [array],// array of items that respect the given filters
  total: [number] // the total count of items that respect the given filters; excluding the pagination: for example 13000
}
```
## Usability
The KingTable widget is designed to follow "old-school" design principles
* the user should be able to immediately understand the size of the collection, so the pagination bar is designed to display the total amount of rows; of pages, and the number of results currently displayed
* keyboard navigation: the KingTable controls can be navigated using the TAB; it is possible to navigate through pages using the left, right, A and D keys
* support for browser navigation buttons
* the table logic handles ajax errors and displays a preloader while fetching data

### Inline editing feature
The KingTable widget doesn't offer built-in inline editing feature.
This is intentional, since in most situations we deal with complex objects that cannot be easily edited inline.
In any case, the library makes it easy to configure HTML and event handlers to implement inline editing feature,
for example:
```js
//example of custom logic to implement inline-editing feature
var table = new KingTable({
  element:  document.getElementById("my-table"),
  url: "/api/colors",
  events: {
    "click .edit-btn": function (e, item) {
      // e.currentTarget is the clicked element
      // item is the item related to the clicked element
      // implement here your logic to display HTML controls to edit the clicked item (second parameter)
    }
  },
  fields: {
    edit: {
      name: "edit-btn",
      html: function (item) { return "<button class='edit-btn'>Edit</button>"; }
    }
  }
});
```

## About localization
For full information, refer to the [dedicated wiki page](https://github.com/RobertoPrevato/KingTable/wiki/Implementing-localization).
The KingTable widget includes logic to implement client side localization, which is used to display proper names of buttons (refresh, page number, results per page, etc.).

## How to integrate with your project
Please refer to the dedicated [wiki page](https://github.com/RobertoPrevato/KingTable/wiki/How-to-integrate-with-your-project), for instructions on how to integrate with your project and with server side code.

## Repository structure
* The *source* folder contains library source code and tasks related code
* The *httpdocs* folder is a container for built code, when testing using the provided example server
* The *servers* folder is meant to contain development servers; currently a single a development server written in Python, using the wonderful [Flask framework](http://flask.pocoo.org/)
* The *dist* folder contains the bundled source code `/dist/kingtable.js`; and the minified source `/dist/kingtable.min.js`

## Code organization
* Source ES6 code is contained in `source\code` folder
* Unit tests are contained in `source\code\tests` folder

## Dependencies
* [OPEN iconic](https://github.com/iconic/open-iconic)
* [Native Promise, or native-compatible Promise polyfill](https://github.com/stefanpenner/es6-promise)

