Wikidata proposal here:
https://www.mediawiki.org/wiki/Talk:Wikidata_query_service#Adding_simple_sameas_reasoning

This utility allows you to write sparql using user defined aliases.
The names to be replaced are declared in ontologies using owl:sameAs.
The ontologies are imported using the varnish:import predicate.

The Sparql query is parsed using sparqljs.
Each ontology is imported using a parallel fetch and n3.js parsing. The resulting renames are applied using the traverse module.

These extra data field are embedded in meaningless sparql optional clauses that are interpreted only by the varnish brush.
This lib will be embedded in a modified version of the wikidata sparql query page later.

Input looks like this :
```
  PREFIX wdt: <http://www.wikidata.org/prop/direct/>
  PREFIX bd: <http://www.bigdata.com/rdf#>
  PREFIX wikibase: <http://wikiba.se/ontology#>
  PREFIX wd: <http://www.wikidata.org/entity/>
  prefix enmap: <https://raw.githubusercontent.com/h4ck3rm1k3/wikidata_varnish/master/enmap.ttl#>
  prefix enent: <https://raw.githubusercontent.com/h4ck3rm1k3/wikidata_varnish/master/enent.ttl#>
  prefix varnish: <https://raw.githubusercontent.com/h4ck3rm1k3/wikidata_varnish/master/varnish.ttl#>
  prefix objects: <https://raw.githubusercontent.com/h4ck3rm1k3/wikidata_varnish/master/objects.ttl#>
  prefix owl: <http://www.w3.org/2002/07/owl#>
  prefix void: <http://rdfs.org/ns/void#>
  SELECT ?countryLabel WHERE {
    OPTIONAL {varnish:done varnish:import enmap:ontology}
    OPTIONAL {varnish:done varnish:import enent:ontology}
    OPTIONAL {objects:Cat owl:sameAs wd:Q146}
    ?country enmap:instance_of enent:country.
      SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
  }
  ORDER BY ?countryLabel
```

The results look like this :
```
PREFIX wdt: <http://www.wikidata.org/prop/direct/>
PREFIX bd: <http://www.bigdata.com/rdf#>
PREFIX wikibase: <http://wikiba.se/ontology#>
PREFIX wd: <http://www.wikidata.org/entity/>
PREFIX enmap: <https://raw.githubusercontent.com/h4ck3rm1k3/wikidata_varnish/master/enmap.ttl#>
PREFIX enent: <https://raw.githubusercontent.com/h4ck3rm1k3/wikidata_varnish/master/enent.ttl#>
PREFIX varnish: <https://raw.githubusercontent.com/h4ck3rm1k3/wikidata_varnish/master/varnish.ttl#>
PREFIX owl: <http://www.w3.org/2002/07/owl#>
SELECT ?countryLabel WHERE {
  OPTIONAL { varnish:done varnish:import enmap:ontology. }
  OPTIONAL { varnish:done varnish:import enent:ontology. }
  OPTIONAL { wd:Q146 owl:sameAs wd:Q146. }
  ?country wdt:P31 wd:Q6256.
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
ORDER BY ?countryLabel
```
