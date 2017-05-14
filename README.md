# KingTable
Library for administrative tables that are able to build themselves, on the basis of their input data.
Supports client and server side pagination; client and server side search; custom filters views; automatic menu to hide columns and support for custom tools. Client side export feature into: csv, json, xml, Excel xlsx (using plugin) formats.

[![Live demo](https://robertoprevato.github.io/demos/kingtable/images/demo.gif)](https://robertoprevato.github.io/demos/kingtable/colors.html)

## Objectives of the library
* Allow the implementation of administrative tables with the [smallest amount of code possible](https://github.com/RobertoPrevato/KingTable/wiki/Minimum-effort).
* Allow for easy customization of generated HTML, to adapt to different needs: e.g. displaying pictures thumbnails, anchor tags, etc.
* Support both collections that require server side pagination, and collections that don't require server side pagination, but may still benefit from client side pagination.
* Avoid dependencies from third party libraries, to be reusable with any other kind of library (it's plain vanilla JavaScript)

## Live demo
The following demos are available online:
* [Index of demos](https://robertoprevato.github.io/demos/kingtable/index.html)
* [Colors demo (rich HTML, with export to Excel xlsx)](https://robertoprevato.github.io/demos/kingtable/colors.html)
* [People demo (rich HTML, with export to Excel xlsx)](https://robertoprevato.github.io/demos/kingtable/people.html)
* [People demo (plain HTML, without handlers)](https://robertoprevato.github.io/demos/kingtable/people-html.html)
* [People demo (plain text)](https://robertoprevato.github.io/demos/kingtable/people-plain.html)
* [How to display pictures](https://robertoprevato.github.io/demos/kingtable/default-by-type.html)
* [Formatting of amounts and currencies](https://robertoprevato.github.io/demos/kingtable/default-by-name.html)

Note how filters are automatically persisted upon page refresh. For example, using the search feature or changing page in one of the rich HTML demos, and then hitting F5. When searching, note how client side search algorithm also sorts results by relevance (number of occurrences, order of properties that generate a match).

**NB:** all these demos are [*fixed tables*](https://github.com/RobertoPrevato/KingTable/wiki/Working-modes#fixed-mode): tables that have all information loaded in memory, paginated and filtered on the client side. To see examples of tables paginated using AJAX requests (on the server side), see the [dedicated documentation](https://github.com/RobertoPrevato/KingTable/wiki/How-to-integrate-in-your-project#how-to-integrate-with-server-side-code) and [development server](https://github.com/RobertoPrevato/KingTable/tree/master/servers/flask) provided in the repository.

## Themes
[![Live demo - themes](https://robertoprevato.github.io/demos/kingtable/images/themes.gif)](https://robertoprevato.github.io/demos/kingtable/colors.html)

## Previous version
The previous version of the KingTable library is available at: [https://github.com/RobertoPrevato/jQuery-KingTable](https://github.com/RobertoPrevato/jQuery-KingTable).

## Documentation
Refer to the [wiki page](https://github.com/RobertoPrevato/KingTable/wiki).
A full list of possible options is available inside the dedicated [Options page](https://github.com/RobertoPrevato/KingTable/wiki/Options).

### Features of the new version
Following is a table listing the features that were added to KingTable 2.0.

| Feature | Description |
|---------|-------------|
| ES6 source code | ES6 source code, library is transpiled to ES5 for distribution. |
| Unit tested source code | Source code is integrated with Gulp tasks, Karma, Jasmine for unit tests. More than 300 tests - still to grow! |
| Removed dependencies | Removed dependency from jQuery, Lodash, I.js, R.js. |
| Improved exceptions | Raised exceptions include a link to GitHub wiki with detailed instructions. |
| Improved logic to fetch data | Allows to choose between HTTP GET method (filters in query string) or HTTP POST method (filters as JSON POST data). |
| LRU cache | _Least Recently Used_ caching mechanism to cache the last _n_ pages by filters, to reduce number of AJAX requests. |
| Table data fetch logic | Allows to define functions that return data required to render the table itself (e.g. dictionaries for custom filters views) |
| Caching of filters | Filters for each table are cached using client side storage (configurable), so they are persisted upon page refresh. |
| Improved _CS_ sorting | Strings that can be sorted like numbers (like "25%", "25.40 EUR", "217°") are automatically parsed as numbers when sorting. |
| Improved _CS_ sorting | Client side sorting by multiple properties. |
| Improved _CS_ search | Client side search feature has been improved: search works in culture dependent string representations of dates and numbers and other formatted strings. |
| Improved support for event handlers | Custom event handlers receive automatically the clicked item as parameter, if applicable. |
| Improved support for custom buttons | It's now possible to configure extra fields (such as buttons) to be rendered for each item. |
| Improved support for other medias | Support for NodeJS console applications and HTML tables rendering for email bodies sent using NodeJS. |

## Modes
The KingTable library implements two working modes:
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
The KingTable library includes a number of features to improve usability, both for final user and for programmers using the library:
* the user should be able to immediately understand the size of the collection, so the pagination bar is designed to display the total amount of rows; of pages, and the number of results currently displayed
* all filters are automatically stored in storage (configurable `sessionStorage`, `localStorage` or compatible object) and persisted upon page refresh - filters are collected by URL and, if possible, table id
* the above include: page number, page size, sorting criteria, text search and additional filters that can be implemented by programmer
* data is stored for a configurable amount of milliseconds, to avoid useless AJAX calls (LRU caching mechanism)
* support for browser navigation buttons
* ajax errors and loading state are automatically handled

For further information, refer to the [dedicated wiki page](https://github.com/RobertoPrevato/KingTable/wiki/About-usability).

## About localization
For full information, refer to the [dedicated wiki page](https://github.com/RobertoPrevato/KingTable/wiki/Implementing-localization).
The KingTable library includes logic to implement client side localization, which is used to display proper names of buttons (refresh, page number, results per page, etc.).

## How to integrate with your project
Please refer to the dedicated [wiki page](https://github.com/RobertoPrevato/KingTable/wiki/How-to-integrate-in-your-project), for instructions on how to integrate with your project and with server side code.

## Dependencies
* [Open Iconic](https://github.com/iconic/open-iconic)
* [Native Promise, or native-compatible Promise polyfill](https://github.com/stefanpenner/es6-promise)

