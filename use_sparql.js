'use strict';

var request = require('request-promise'); // https://www.npmjs.com/package/request-promise


var renames = {}


//dofetch('https://raw.githubusercontent.com/h4ck3rm1k3/wikidata_varnish/master/enmap.ttl')

var N3 = require('n3');
var SparqlParser = require('sparqljs').Parser;
var n3parser = N3.Parser();
var SparqlGenerator = require('sparqljs').Generator;
var parser = new SparqlParser();
var generator = new SparqlGenerator();
/*
 * queryType
 * variables
 * where
 * order
 * type
 * prefixes
*/

function dofetch(url, resolve, reject) {
  return request(
                 { uri: url, resolveWithFullResponse: true }
  )
}

function process_ont(s) {

  console.log("len" + s.length);
  
  if (null == s)  {
    console.log("no result");
    return
  } else {
    
    var g = n3parser.parse(s);
    
    for (var e in g) {
      var i = g[e];
      if (i.predicate == 'http://www.w3.org/2002/07/owl#sameAs'){
        //          console.log("s:\t" +i.subject);
        //          console.log("res" +i.predicate);
        //console.log("o:\t" +i.object);
        
        //renames[i.object]=i.subject
        renames[i.subject]=i.object
      }
    }
    // { subject: 'enmap.ttl#official_language',
    //   predicate: 'http://www.w3.org/2002/07/owl#sameAs',
    //   object: 'http://www.wikidata.org/prop/direct/P37',
    //   graph: '' }       
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
        //console.log("url:"+ url+"\n");
        var ont = dofetch(url)

        //console.log("new promise1\t" +ont);
        promises.push(ont)

      }
    }      
  }
  return promises;
}

//for c in myJSONText.where



function process_query(q) {
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
            //console.log("new promise\t" +p2);
            //var t = JSON.stringify(p2);
            //            console.log("new promise\t" +t);
            // var promise = new Promise(
            //   function (resolve, reject)
            //   {
            //     p2.then(function(data) {
            //       //console.log(JSON.stringify(p2.uri.pathname));
            //       console.log("get\t" +     p2.uri.pathname);                  
            //       process_ont(data)
            //     })   
            //   });
            promises.push(p2);          
          }

          //console.log(o);
        }
      }
    } else {
      
    }
  }

  // console.log("promises\t" +promises);
  //  for (var p in promises) {
  //    var po = promises[p];


  //    po.then(function(data) {
  //      console.log(JSON.stringify(po.uri.pathname));
  //      console.log("get\t" +     po.uri.pathname);
       
  //      process_ont(data)
  //    })   
  //  }

  Promise.all(promises).then(function(data) {
    //console.log(data);
    //console.log(JSON.stringify(data));

    for (var d in data){
      //console.log(d);
      var d2 = data[d];
      //var dt = JSON.stringify(data[d]);
      //console.log(d2);
      var body = d2.body;
      process_ont(body)
    }

    var renamest = JSON.stringify(renames);         
    console.log("renames\t" +renamest);

  });
  //   // all loaded
    
  // }, function() {
  //      // one or more failed
  //      console.log("failed");
  //    });
  
}



//print();
/*$('#query').html(query);
$('#dump').html(myJSONText);
$('#clean').html(generatedQuery);
*/


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
    OPTIONAL {objects:country owl:sameas wd:Q146}
    ?country enmap:sameas objects:country.
      SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
  }
  ORDER BY ?countryLabel
  `

  var parsedQuery = parser.parse(query);
  generatedQuery = generator.stringify(parsedQuery);          
  var myJSONText = JSON.stringify(parsedQuery);
  process_query(parsedQuery);
}

main();
