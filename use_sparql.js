'use strict';

var request = require('request-promise'); // https://www.npmjs.com/package/request-promise
var traverse = require('traverse');
var SparqlParser = require('sparqljs').Parser;
var SparqlGenerator = require('sparqljs').Generator;
var N3 = require('n3');

var renames = {}

var owl_sameAs = 'http://www.w3.org/2002/07/owl#sameAs';


var parser = new SparqlParser();
var generator = new SparqlGenerator();

function dofetch(url, resolve, reject) {
  return request(
                 { uri: url, resolveWithFullResponse: true }
  )
}

function process_sameas(i) {
  if (i.predicate == owl_sameAs){
    renames[i.subject]=i.object
    //add rename console.log(i.subject +" > "+ i.object);
  }
  else {
    //SKIP console.log(i);
  }
}

function process_statements(g) {
    for (var e in g) {
      var i = g[e];
      process_sameas(i);
    }

}

function process_ont(s, url) {

  //console.log("len" + s.length);
  
  if (null == s)  {
    console.log("no result");
    return
  } else {

    var n3parser = N3.Parser({ documentIRI: url + "#" });
    var g = n3parser.parse(s);
    process_statements(g)
  }      
}

function bgp(o) {
  //console.log(o);
  var promises = []

  for (t in o.triples){
//    console.log('each triple');
    var t = o.triples[t]
    //console.log(t);
    if (t.subject == 'https://raw.githubusercontent.com/h4ck3rm1k3/wikidata_varnish/master/varnish.ttl#done')
    {
      //console.log(t);
      if (t.predicate == 'https://raw.githubusercontent.com/h4ck3rm1k3/wikidata_varnish/master/varnish.ttl#import'){
        var ontology = t.object;       
        var url = ontology.substring(0,ontology.indexOf('#'));
        //console.log("fetch url:"+ url+"\n");
        var ont = dofetch(url)
        
        //console.log("new promise1\t" +ont);
        promises.push(ont)

      }      
    } else {
      //console.log(t);
      process_sameas(t); // look for single replacements
    }
  }
  return promises;
}


function postprocess_query(q) {
  // now replace all the urls
  
  traverse(q).forEach(function (x) {
    //console.log(x);

    //console.log(">" +JSON.stringify(x));
    if (x in renames){
      //console.log(">"+x);
      this.update(renames[x]);
    }
  });
  
  var generatedQuery = generator.stringify(q);
  console.log("generated:\n" +generatedQuery);
 
}

function process_query(q) {

  //console.log(">" +JSON.stringify(q));

  var promises = []
  for (var k in q.where) {
    var w = q.where[k]
    if (w.type == 'optional'){
      for (var p in w.patterns){
        var po = w.patterns[p]
        if (po.type == 'bgp')
        {
          var o = bgp(po)
          for (p in o) {
            var p2 = o[p]
            promises.push(p2);          
          }
        }
      }
    } else {      
    }
  }
  
  Promise.all(promises).then(function(data) {
    //console.log(data);
    //console.log(JSON.stringify(data));

    for (var d in data){
      //console.log(d);
      var d2 = data[d];
      var url = d2.req.res.request.href;
      //console.log("HREF:"+url);
//      console.log(d2.req);
  //    console.log("HREF"+d2.req.request.href);
      //console.log("HREF:"+d2.req.href);
      var body = d2.body;
      process_ont(body, url)
    }

    //var renamest = JSON.stringify(renames);         
    //console.log("renames\t" +renamest);

    // now we have loaded all the renames, lets rewrite the query
    postprocess_query(q);

  });

  
}


function main() {
  var generatedQuery ='ERROR';      
  
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
  `

  var parsedQuery = parser.parse(query);
  
  //var myJSONText = JSON.stringify(parsedQuery);
  process_query(parsedQuery);
}

main();
