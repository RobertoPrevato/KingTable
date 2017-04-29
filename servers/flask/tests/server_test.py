import server
import unittest


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

    def test_hello_world(self):
        print("Hello World!")
        assert True == True
        
    def test_homepage(self):
        rv = self.app.get('/')
        #print(rv.data)
        print("Hello World!")
        assert "<title>" in rv.data
