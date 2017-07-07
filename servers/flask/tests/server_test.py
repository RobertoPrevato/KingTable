import server
import unittest
from flask import json



class ServerTestCase(unittest.TestCase):
    """
      Generic server tests.
    """
    def setUp(self):
        """
          The code in the setUp() method is called before each individual test function is run.
        """
        self.app = server.app.test_client()

    def tearDown(self):
        """
          The code in the setUp() method is called before each individual test function is run.
        """
        #print("end..")

    def test_homepage(self):
        rv = self.app.get('/')
        assert b'<title>' in rv.data

    def test_api(self):
        rv = self.app.get('/api/colors?page=1&search=%&size=30&timestamp=2017-07-06T17%3A54%3A17.653Z')
        data = json.loads(rv.data)
        assert data["total"] == 1247
