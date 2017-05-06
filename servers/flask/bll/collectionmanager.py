"""
 * KingTable 2.0.0 example server
 * https://github.com/RobertoPrevato/KingTable
 *
 * Copyright 2017, Roberto Prevato
 * https://robertoprevato.github.io
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 *
 * This file contains the business logic to work with example collections. 
"""
import os
import json
from core.lists.listutils import ListUtils
from core.literature.scribe import Scribe


class CollectionManager:
    """Provides methods to work with underlying collections; read from static json structures"""
    def __init__(self, file_path):
        self.file_path = file_path
        self._collection = None

    def get_catalog(self, data):
        if data is None:
            raise TypeError

        # timestamp = data["timestamp"] # timestamp of the first time a page was required
        page_number = int(data.get("page"))
        page_size = int(data.get("size"))
        search = data.get("search")
        sort_by = data.get("sortBy")
        # get the collection
        collection, total_rows = self.get_catalog_page(page_number, page_size, search, sort_by)
        # optimize the collection
        collection = ListUtils.optimize_list(collection)
        result = {"subset": collection, "page": page_number, "total": total_rows}
        return result

    def get_data_path(self):
        root_dir = os.path.dirname(os.getcwd())
        rel = os.path.join(root_dir, "flask", "data", self.file_path)
        return os.path.abspath(rel)

    def get_catalog_page(self, page_number, page_size, search, sort_by):
        """Gets a catalog page of the managed collection."""
        collection = self.get_all()
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
        if sort_by:
            collection = ListUtils.sort_by(collection, sort_by)

        # return a paginated result to the client:
        skip = ((page_number-1)*page_size) if page_number > 0 else 0

        # the client needs to know the total items count, in order to build the pagination
        total_items_count = len(collection)

        result = ListUtils.sampling(collection, skip, page_size)
        # return the collection and the count of results:
        return result, total_items_count

    def get_all(self):
        """Gets the complete list of colors."""
        if self._collection is None:
            file_path = self.get_data_path()

            # read the colors.json file (this simulates the data access, without data access layer)
            file_data = Scribe.read(file_path)
            self._collection = json.loads(file_data)

        return self._collection
