$(function () {
  console.log( "ready!" );
  
  // constants
  var ACCESS_TOKEN = 'pk.eyJ1IjoidG1mcm56IiwiYSI6ImNpbWE3OXQybzAzenV2Ymx1eG1zM2Jzb20ifQ.g617dsajL9ZJ3fz2kpZrrw';
  var MAP_ID = 'tmfrnz.e2f297b5';
	var MB_ATTR = 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
			'<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
			'Imagery © <a href="http://mapbox.com">Mapbox</a>';
	var MB_URL = 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=' + ACCESS_TOKEN;
  
  // variables
  var start = '2016-03-24'
  var end = 'today'
  var interactions = {
    "ga" : {
      "locations" : [],
      "query" : [],
      "results" : []
    }
  }
  var mapOptions = {
    maxZoom : 12
  }
  var layers = {
    "ga" : {
      "markers" : L.markerClusterGroup({
        "showCoverageOnHover" : false,
        "spiderfyOnMaxZoom" : true,
        "maxClusterRadius" : 50
      })
    }
  }
  
  // undefined variables
  var map
  
  //////////////////////////////////////////////////////////////////////////////
  // run application
  $(function () {
    
    // load GA data
    loadGA(start,end,gaLoaded)
    
    // init map
    initMap();
  });
  
  
  
  $(document).ready(function(){  
    
  })
  
  
  
  //////////////////////////////////////////////////////////////////////////////
  
  // functions
  var loadGA = function(start,end,callback) {
    // run GA query      
    $.ajax({
      url: "gaQuery.php?start="+start+"&end="+end,
      dataType: "JSON",
      success: function(json){
        console.log( "json!" );
        callback({'data':json})
      }
    })  
  }
  var gaLoaded = function(args){
    console.log('gaLoaded!')
    
    var latIndex = _.findIndex(args.data.results.columns,function(col){return col.name === "ga:latitude"})
    var lonIndex = _.findIndex(args.data.results.columns,function(col){return col.name === "ga:longitude"})
    var countIndex = _.findIndex(args.data.results.columns,function(col){return col.name === "ga:sessions"})
    
    interactions.ga.query.push(args.data.query)
    interactions.ga.results.push(args.data.results)
    interactions.ga.locations.push(_.map(args.data.results.rows,function(row){
      return {
        "point" : {
          "lat": row[latIndex],
          "lon": row[lonIndex]
        },
        "count" : row[countIndex]
      }
      
    }))
    
    mapInteractions({source:'ga',interactions: _.last(interactions.ga.locations)})
    
  }
  var initMap = function(){
    map  = L.map('map', mapOptions)
    L.tileLayer(
      MB_URL, 
      {attribution: MB_ATTR, id: 'tmfrnz.e2f297b5'}
    ).addTo(map);
  }
  var mapInteractions = function(args){    

    var mapLoaded = function (){
      console.log('map that shit')
      layers[args.source].markers.addLayers(_.map(args.interactions, function(interaction){
        return L.marker(interaction.point)
      }))
      map.addLayer(layers[args.source].markers)
      map.fitBounds(layers[args.source].markers.getBounds());
    }    
    
    // check for map loaded
    waitFor(
      function(){
        // waiting for
        return typeof map !== 'undefined' 
      },
      function(){
        // loaded
        mapLoaded()
      }      
    )
    
    var mapLoaded = function (){
      console.log('map that shit')
    }
    
  }
  //////////////////////////////////////////////////////////////////////////////
  //utility
  var waitFor = function (condition,callback,s){
    s = typeof s !== 'undefined' ? s : 100
     
    if (condition()){
       callback()
    } else {
      setTimeout(function(){
      waitFor(condition,callback)
    },s)
  }
}




  
  
})
