# Python Flask development server
A development server is required for the development of the KingTable library, since some features require server side pagination, sorting and filtering (since filtering and sorting affect pagination). Python Flask has been chosen because it's a lightweight web framework that enables fast development (and to take a break from JavaScript!).
Following are instructions on how to run a Flask development server.

In order to run the provided Flask development server it is necessary to use Python and Flask (either Python 2.x or 3.x).
It is recommended to create a virtual environment and use **pip** (package management system for Python) to install Flask.
Steps:

* If necessary, install Python from the [official website](https://www.python.org/downloads/)
* When in doubt, version 3.x is recommended
* Depending on the operating system, Python could be already installed or using different PATH variables: in most Linux distributions both Python 3.x and 2.x are pre-installed, Python 3.x has the PATH name python3, while Python 2.x has the PATH name python; while in Windows they are not installed by default, and Python 3.x can be launched using py -3; Python 2.x using py -2 (when they are both installed)
* Learn how to create virtual environments: this is a best practice when working with Python, since it allows to keep the base installation clean and to install dependencies when needed, on a project-basis
```bash
# creating a virtual environment in a folder called 'env', using Python 3.x in Ubuntu:
python3 -m venv env

# creating a virtual environment in a folder called 'env', using Python 3.x in Windows:
py -3 -m venv env
```
* NB: in Linux, a Python virtual environment with name _"env"_ has its interpreter files under _env/bin/_ folder; in Windows under _env\Scripts\_ folder. In following instructions, _env/bin_ is used: adapt as needed if you are using Windows
* Install Flask using the command: `env/bin/pip install Flask`
* (OPTIONAL) Activate the virtual environment using the command: `source env/bin/activate`

* Run the development server.py included in the repository:
```bash
# if you activated the virtual environment, you can run simply using:
python server.py

# if you did not activate the virtual environment, you need to call the right Python executable:
env/bin/python server.py

# (or, for Windows users):
env\Scripts\python server.py
```
