import re
import locale
import unidecode
locale.setlocale(locale.LC_ALL, "")


class ListUtils:

    @staticmethod
    def parse_sort_by(s):
        """
        Parses a sort by string, converting it into an array of arrays.
        
        :param s: sort by string
        """
        if not s:
            return
        parts = re.split("\s*,\s*", s)
        result = []
        for part in parts:
            a = re.split("\s*", part)
            name = a[0]
            order = a[1] if len(a) == 2 else "asc"
            result.append([name, 1 if order.startswith("asc") else -1])
        return result

    @staticmethod
    def sort_by(a, criteria):
        """
        Sorts an array of items by one or more properties.

        :param a: array to sort
        :param criteria: sort criteria
        :return:
        """
        if isinstance(criteria, str):
            criteria = ListUtils.parse_sort_by(criteria)
        # assume that properties are in order of importance, sorting must be from less important
        # to most important property:
        criteria.reverse()
        for k in criteria:
            prop, order = k
            def fn(o):
                v = o.get(prop)
                if isinstance(v, str):
                    # TODO: check if the string look like a number
                    # (like '100%', if so, parse as number)
                    # normalize
                    v = unidecode.unidecode(v)
                return v
            a.sort(key=fn, reverse=order == -1)
        return a


    @staticmethod
    def sampling(selection, offset=0, limit=None):
        return selection[offset:(limit + offset if limit is not None else None)]

    @staticmethod
    def optimize_list(collection):
        """
         Optimizes a collection of items; into a collection of arrays.
         The first array contains the property names; the others the items values.
        """
        if len(collection) == 0:
            return collection
        first = collection[0]
        data = []
        data.append([x for x in first.keys()])
        for o in collection:
            data.append([x for x in o.values()])
        return data


    @staticmethod
    def search(collection, search, properties):
        """Simple search method, that supports only exact text."""
        # escape characters that need to be escaped
        search = re.escape(search)
        rx = re.compile(search, re.IGNORECASE)
        result = []
        for item in collection:
            if properties == "*":
                for x in item:
                    # TODO: support better non-strings with their culture-dependent representations
                    if rx.search(item[x]):
                        result.append(item)
            else:
                for p in properties:
                    if rx.search(item[p]):
                        result.append(item)
                        break
        return result