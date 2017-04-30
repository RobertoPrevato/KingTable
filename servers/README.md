# Servers
This folder contains development web servers, to test server side integration of the KingTable library.
Currently, a single implementation using Python Flask web framework is implemented.

Development servers are meant to serve static files included in above `httpdocs` folder, which is prepared by running the gulp command, from `source` folder:
```bash
gulp dev-init
```

Each folder contains a README.md file with instructions on how to run the provided development server.

