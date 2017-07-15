.PHONY dobuild :
	browserify lib/sparql_varnish.js -s sparql_varnish  > build/sparql_varnish.js
test:
	node use_sparql.js
