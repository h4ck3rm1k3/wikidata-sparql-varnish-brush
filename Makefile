build :
	browserify lib/sparql_varnish.js > build/sparql_varnish.js
test:
	node use_sparql.js
