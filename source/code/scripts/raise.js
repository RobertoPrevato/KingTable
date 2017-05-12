/**
 * KingTable raise function.
 * This function is used to raise exceptions that include a link to the GitHub wiki,
 * providing further information and details.
 * https://github.com/RobertoPrevato/KingTable
 *
 * Copyright 2017, Roberto Prevato
 * https://robertoprevato.github.io
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */

/**
 * Raises an exception, offering a link to the GitHub wiki.
 */
export default function raise(err, detail) {
  var message = (detail ? detail : "Error") + ". For further details: https://github.com/RobertoPrevato/KingTable/wiki/Errors#" + err;
  if (typeof console != "undefined") {
    console.error(message);
  }
  throw new Error(message);
}

/*
----------------------------------------------------
Errors
----------------------------------------------------
1. Missing Promise implementation.
2. Missing dependency.
3. KingTable initialization: Data is not an array.
4. KingTable: cannot determine id property of displayed objects.
5. KingTable: an AJAX request is required, but url is not configured.
6. KingTable: the returned object is not a catalog.
7. KingTable: missing total items count in response object.
8. KingTable: missing view configuration.
9. KingTable: missing views configuration.
10. KingTable: missing handler for view.
11. FiltersManager: missing search properties.
12. Feature not implemented.
13. getTableData is not returning a promise object.
14. getFetchPromise did not return a value when resolving.
15. Missing regional.
16. Invalid columns option.
17. Missing property name in column option.
18. Column name defined in options, not found inside data items.
19. Column does not exist.
20. Missing columns information (properties not initialized).
21. Missing view configuration for Rich HTML builder.
22. Missing view resolver for Rich HTML builder.
23. Invalid resolver for Rich HTML builder view.
24. Invalid `html` option for column (property).
25. Cannot display a built table, because the table is not bound to an element.
26. Cannot update without root element.
27. Invalid method definition (must be string or function).
28. Invalid sort mode for RHTML builder.
29. Missing format in export element.
30. Missing format information.
31. Invalid getItemTemplate function in extra view.
32. Missing property for template.
33. Missing resolver in view configuration.
34. Invalid extra views configuration (null or falsy value).
35. Missing 'name' property in extra view configuration.
36. Cannot retrieve an item by event data. Make sure that HTML elements generated for table items have 'kt-item' class.
37. Cannot retrieve an item by element data. Make sure that HTML elements generated for table items have 'data-ix' attribute.
38. Cannot obtain HTML from parameter.
39. KingTable is not defined in global namespace.
40. Tools is not an array or a function returning an array.
41. Invalid HTTP Method configuration.
*/
