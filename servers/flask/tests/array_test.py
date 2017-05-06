import unittest
import unidecode
import random
from core.lists.listutils import ListUtils

PEOPLE = [
  { "name": "Adam", "age": 60 },
  { "name": "Adam", "age": 40 },
  { "name": "Łukasz", "age": 40 },
  { "name": "Lucia", "age": 30 },
  { "name": "Lucia", "age": 48 },
  { "name": "Luca", "age": 35 },
  { "name": "Luca", "age": 20 },
  { "name": "Lucetta", "age": 21 },
  { "name": "Lucio", "age": 40 },
  { "name": "Monica", "age": 10 },
  { "name": "Monica", "age": 14 },
  { "name": "Roberto", "age": 20 },
  { "name": "Roberto", "age": 31 },
  { "name": "Stanisław", "age": 30 },
  { "name": "Bogumił", "age": 29 }
]

"""
The simplest way is to take advantage of sort-stability and do
successive sorts. For example, to sort by a primary key ascending and
a secondary key decending:

L.sort(key=lambda r: r.secondary, reverse=True)
L.sort(key=lambda r: r.primary)

A less general technique is to transform fields in a way that reverses
their comparison order:

L.sort(key=lambda r: (-r.age, r.height)) # sorts descending age
and ascending height
"""

def sort_by_v1(a, criteria):
    def fn(o):
        props = []
        for k in criteria:
            prop, order = k
            v = o.get(prop)
            if isinstance(v, str):
                # normalize
                v = unidecode.unidecode(v)

                if order == "desc":
                    # revert
                    v = [[-ord(c) for c in v]]
            elif order == "desc":
                v = -v
            props.append(v)
        return tuple(props)
    a.sort(key=fn)


def sort_by_v2(a, criteria):
    """
    Sorts an array of items by multiple properties;

    :param a:
    :param criteria:
    :return:
    """
    # take advantage of sort-stability and do successive sorts
    # assume that properties are in order of importance, sorting must be from less important
    # to most important property:
    criteria.reverse()
    for k in criteria:
        prop, order = k
        def fn(o):
            v = o.get(prop)
            if isinstance(v, str):
                # normalize
                v = unidecode.unidecode(v)
            return v
        a.sort(key=fn, reverse="desc" in order)
    return a


class ArrayUtilsTestCase(unittest.TestCase):
    """
      Tests for Array utilities.
    """
    def test_parse_sort_by(self):
        a = ListUtils.parse_sort_by("name")
        self.assertEqual(a, [["name", 1]])

        a = ListUtils.parse_sort_by("name desc")
        self.assertEqual(a, [["name", -1]])

        a = ListUtils.parse_sort_by("name, age desc")
        self.assertEqual(a, [["name", 1], ["age", -1]])

        a = ListUtils.parse_sort_by("name desc, age desc")
        self.assertEqual(a, [["name", -1], ["age", -1]])

    def test_sort_by_criteria(self):
        random.shuffle(PEOPLE)
        sort_by_v2(PEOPLE, [["name", "desc"], ["age", "asc"]])

        self.assertEqual("Stanisław", PEOPLE[0].get("name"))
        self.assertEqual(30, PEOPLE[0].get("age"))
        self.assertEqual("Roberto", PEOPLE[1].get("name"))
        self.assertEqual(20, PEOPLE[1].get("age"))
        self.assertEqual("Roberto", PEOPLE[2].get("name"))
        self.assertEqual(31, PEOPLE[2].get("age"))
        self.assertEqual("Monica", PEOPLE[3].get("name"))
        self.assertEqual(10, PEOPLE[3].get("age"))
        self.assertEqual("Monica", PEOPLE[4].get("name"))
        self.assertEqual(14, PEOPLE[4].get("age"))
        self.assertEqual("Łukasz", PEOPLE[5].get("name"))
        self.assertEqual(40, PEOPLE[5].get("age"))
        self.assertEqual("Lucio", PEOPLE[6].get("name"))
        self.assertEqual(40, PEOPLE[6].get("age"))
        self.assertEqual("Lucia", PEOPLE[7].get("name"))
        self.assertEqual(30, PEOPLE[7].get("age"))
        self.assertEqual("Lucia", PEOPLE[8].get("name"))
        self.assertEqual(48, PEOPLE[8].get("age"))
        self.assertEqual("Lucetta", PEOPLE[9].get("name"))
        self.assertEqual(21, PEOPLE[9].get("age"))
        self.assertEqual("Luca", PEOPLE[10].get("name"))
        self.assertEqual(20, PEOPLE[10].get("age"))
        self.assertEqual("Luca", PEOPLE[11].get("name"))
        self.assertEqual(35, PEOPLE[11].get("age"))
        self.assertEqual("Bogumił", PEOPLE[12].get("name"))
        self.assertEqual(29, PEOPLE[12].get("age"))
        self.assertEqual("Adam", PEOPLE[13].get("name"))
        self.assertEqual(40, PEOPLE[13].get("age"))
        self.assertEqual("Adam", PEOPLE[14].get("name"))
        self.assertEqual(60, PEOPLE[14].get("age"))