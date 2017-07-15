grunt :
	grunt jshint

.PHONY dobuild :
	browserify lib/sparql_varnish.js -s sparqlVarnish  > build/sparql_varnish.js
test:
	./node_modules/mocha/bin/mocha
