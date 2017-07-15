var expect = require("chai").expect;
var sparqlVarnish = require("../lib/sparql_varnish");

describe("sparql_varnish", function(){
  describe("rewriteQuery()", function(){
    it('rewrite this query', function(done) {

      var query = `
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
      `;

      this.timeout(400);

      var query2 = `PREFIX wdt: <http://www.wikidata.org/prop/direct/>
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
ORDER BY ?countryLabel`;

      var response = '';
      sparqlVarnish.rewriteQuery(query,function (data) {
        response = data;
        //console.log('got' + data);
        //assert.equal(data, query2);


        if (response != query2 ) {
          done ("Error");
        }        

        done();
      });
    });
  });
});

function main() {
  var generatedQuery ='ERROR';      
  

  
}

//main();
