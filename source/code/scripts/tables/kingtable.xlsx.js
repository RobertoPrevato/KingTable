/**
 * KingTable plugin for Excel client side export using SheetJS/js-xlsx library
 * https://github.com/RobertoPrevato/KingTable
 *
 * Copyright 2017, Roberto Prevato
 * https://robertoprevato.github.io
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */
import raise from "../../scripts/raise"
var und = "undefined";

// KingTable is immediately necessary
if (typeof KingTable == und) raise(39, "KingTable is not defined in global namespace");

var _ = KingTable.Utils;
var dateValue = KingTable.DateUtils.toExcelDateValue;

function sheetFromArrayOfArrays(data, opts) {
  var ws = {};
  var range = {s: {c:10000000, r:10000000}, e: {c:0, r:0 }};
  for(var R = 0; R != data.length; ++R) {
    for(var C = 0; C != data[R].length; ++C) {
      if(range.s.r > R) range.s.r = R;
      if(range.s.c > C) range.s.c = C;
      if(range.e.r < R) range.e.r = R;
      if(range.e.c < C) range.e.c = C;
      var value = data[R][C];
      var cell = {v: value };
      if(cell.v == null) continue;
      var cell_ref = XLSX.utils.encode_cell({c:C,r:R});
      
      if (typeof value == "number") { 
        cell.t = "n";
        // TODO: support desired precision of numbers
        //cell.z = ...
      }
      else if (typeof value == "boolean") cell.t = "b";
      else if (value instanceof Date) {
        cell.t = "n"; cell.z = XLSX.SSF._table[14];
        cell.v = dateValue(cell.v);
      }
      else cell.t = "s";
      
      ws[cell_ref] = cell;
    }
  }
  if(range.s.c < 10000000) ws["!ref"] = XLSX.utils.encode_range(range);
  return ws;
}

function Workbook() {
  if(!(this instanceof Workbook)) return new Workbook();
  this.SheetNames = [];
  this.Sheets = {};
}
 
function s2ab(s) {
  var buf = new ArrayBuffer(s.length);
  var view = new Uint8Array(buf);
  for (var i=0; i!=s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
  return buf;
}

function handler(itemsToDisplay) {
  // at this point, dependencies are required
  if (typeof XLSX == und) raise(2, "Missing dependency: js-xlsx");
  if (typeof Blob == und) raise(2, "Missing dependency: Blob");

  var self = this, o = self.options;
  var data = self.optimizeCollection(itemsToDisplay, null, {
    format: o.excelAllStrings
  });
  var wb = new Workbook(), ws = sheetFromArrayOfArrays(data);
  
  // add worksheet to workbook
  var wsName = o.excelWorkbookName;
  wb.SheetNames.push(wsName);
  wb.Sheets[wsName] = ws;

  // columns auto width
  // for each column, get the cell width
  var padding = o.excelCellPadding, minCellWidth = o.excelCellMinWidth;
  var cols = _.cols(data),
    wscols = _.map(cols, x => {
      return {wch:Math.max(_.max(x, y => { return y.length; }), minCellWidth) + padding};
    });
  ws["!cols"] = wscols;

  var wbout = XLSX.write(wb, {bookType:"xlsx", bookSST:true, type: "binary"});
  return new Blob([s2ab(wbout)], {type:"application/octet-stream"});
}

// regional settings
KingTable.regional.en.exportFormats.xlsx = "Excel (.xlsx)";

// extend options
KingTable.defaults.excelWorkbookName = "data";
KingTable.defaults.excelCellPadding = 0;
KingTable.defaults.excelCellMinWidth = 0;
KingTable.defaults.excelAllStrings = false;

// add export format for client side Xlsx
KingTable.defaults.exportFormats.unshift({
  name: "Xlsx",
  format: "xlsx",
  type: "application/octet-stream",
  cs: true,  // client side
  handler: handler
});

