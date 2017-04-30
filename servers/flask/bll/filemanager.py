import os, time
import re
import json
from os import listdir
from os.path import isfile, join, isdir
from core.lists.listutils import ListUtils


class FileManager:
    """Provides methods to work with files collections"""
    def __init__(self):
        self.initialized = True


    def get_size(start_path = '.'):
        total_size = 0
        for dirpath, dirnames, filenames in os.walk(start_path):
            for f in filenames:
                fp = os.path.join(dirpath, f)
                total_size += os.path.getsize(fp)
        return total_size


    def get_catalog(self, data):
        if data is None:
            raise TypeError

        # timestamp = data["timestamp"] # timestamp of the first time a page was required
        folder = data["folder"] if "folder" in data else "/home/ug/Pictures/"#"/media/ug/My Passport/Music/Musica Metal-Punk/"
        page_number = data["page"]
        page_size = data["size"]
        search = data["search"] if "search" in data else ""
        order_by = data["orderBy"]
        sort_order = data["sortOrder"]
        # get the collection
        collection, total_rows = self.get_catalog_page(folder, page_number, page_size, search, order_by, sort_order)
        result = {"subset": collection, "page": page_number, "total": total_rows}
        return result

    def get_data_path(self):
        root_dir = os.path.dirname(os.getcwd())
        rel = os.path.join(root_dir, "servers", "data", self.file_path)
        return os.path.abspath(rel)

    def get_catalog_page(self, folder, page_number, page_size, search, order_by, sort_order):
        """Gets a catalog page of the managed collection."""
        collection = self.get_all(folder)
        if search is not None and search != "":
            """
            # NB: if a search filter is provided by the client; then the server side should:
            # 1. search inside the properties we know should be searched into, and skim the results.
            # 2. set the total items count as the total of items that respond to the search.
            # 3. return the full set of items that respect the search criteria.
            #
            # As a side note, keep in mind that some properties, like dates and decimal, should be evaluated for their
            # culture-dependent string representations of values; not their intrinsic values.
            # Example: a date in UK English can be dd/mm/yyyy; in US English can be mm/dd/yyyy.
            # A well designed search implementation adapts to the current user's culture.
            """
            collection = ListUtils.search(collection, search, "*")

        # NB: if an order by is defined; we need to order before paginating results!
        if order_by is not None and order_by != "":
            collection = ListUtils.sort_by(collection, order_by, sort_order)

        collection = sorted(collection, key=lambda x: isdir(x["fullpath"]), reverse=True)

        # return a paginated result to the client:
        skip = ((page_number-1)*page_size) if page_number > 0 else 0

        # the client needs to know the total items count, in order to build the pagination
        total_items_count = len(collection)

        result = ListUtils.sampling(collection, skip, page_size)
        # return the collection and the count of results:
        return result, total_items_count

    def get_all(self, path):
        """Gets the complete list of files under the given directory."""
        """TODO: get only the necessary directories!"""
        elements = [{
                    "name": f,
                    "fullpath": path + f,
                    "stat": os.stat(path + f),
                    "type":  "file" if isfile(path + f) else "directory"
                    } for f in listdir(path) if f[:1] != "."]
        a = [{
             "name": f["name"],
             "fullpath": f["fullpath"],
             "type": f["type"],
             "size": f["stat"].st_size if isfile(f["fullpath"]) else "",
             "mtime": time.asctime(time.localtime(f["stat"].st_mtime)) if f["stat"] is not None else "",
#             "ctime": time.asctime(time.localtime(f["stat"].st_ctime)) if f["stat"] is not None else "",
             } for f in elements]
        return a