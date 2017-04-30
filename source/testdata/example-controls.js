(function () {
    
  var events = {
    "click next": function () {
      table.pagination.next();
    },
    "click prev": function () {
      table.pagination.prev();
    },
    "click first": function () {
      table.pagination.first();
    },
    "click last": function () {
      table.pagination.last();
    },
    "click refresh": function () {
      table.refresh();
    },
    "change page": function () {
      table.pagination.page = parseInt(document.getElementById("page").value);
    },
    "change search": function () {
      var v = document.getElementById("search").value;
      table.search(v);
    }
  };
  var x, a;
  for (x in events) {
    var a = x.split(/\s/);
    document.getElementById(a[1]).addEventListener(a[0], events[x], true);
  }
    
})();
