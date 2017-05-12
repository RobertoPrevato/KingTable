This folder contains distribution files.

## JS
The file `kingtable.js` is minified and transpiled from ES6 source code, it can be included in projects in classic way (i.e. downloading it and loading it using a script tag). To work with ES6 source code, look at [https://github.com/RobertoPrevato/KingTable/tree/master/source/gulp](https://github.com/RobertoPrevato/KingTable/tree/master/source/gulp).

## CSS
CSS files are organized inside the `styles` folder.

The file `kingtable.css` contains all themes. It is recommended to optimize your solution, by using the file: `kingtable.core.css`, which includes only the basic "flatwhite" theme; and eventually add the specific `.css` files of the desired themes.

## Open Iconic
Open Iconic fonts ([GitHub page](https://github.com/iconic/open-iconic)) are a dependency of KingTable styles. The folder `fonts` contains a copy of the font, used for the published demos. CSS rules for the fonts are already included inside kingtable .css files.

## KingTable plugins
This folder also contains optional plugins. Refer to [dedicated wiki page for detailed information](https://github.com/RobertoPrevato/KingTable/wiki/Plugins).

| File | Description |
|---------|-------------|
| kingtable.xlsx.js | Plugin to support client side export in Excel (xlsx) files. |
