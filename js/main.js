$(function () {
  
  // constants
  var ACCESS_TOKEN = 'pk.eyJ1IjoidG1mcm56IiwiYSI6ImNpbWE3OXQybzAzenV2Ymx1eG1zM2Jzb20ifQ.g617dsajL9ZJ3fz2kpZrrw';
  var MAP_ID = 'tmfrnz.463d7dbb';
	var MB_ATTR = 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
			'<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
			'Imagery © <a href="http://mapbox.com">Mapbox</a>';
	var MB_URL = 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=' + ACCESS_TOKEN;
  
  // variables
  var start = '2016-03-24'
  var end = 'today'
  var clusterMarkerRadius = {
    min : 7.5,
    max : 20
  }
  
  var interactions = {
    "ga" : {
      "locations" : [],
      "query" : [],
      "results" : [],
      "maxValue" : 0
    }
  }
  var mapOptions = {
    "maxZoom" : 6,
    "zoom" : 2,
    "center" : [22,0],
    "scrollWheelZoom" : false
  }
  var layers = {
    "ga" : {
      "markers" : L.markerClusterGroup({
        "showCoverageOnHover" : false,
        "maxClusterRadius" : 20,     
        "spiderfyOnMaxZoom" : false,
        "singleMarkerMode" : true,
        "iconCreateFunction" : function(cluster){
          return clusterCreate(cluster, 'ga')
        }
      })
    }
  }
  
  var countryCentroids
  
  $.ajax({
      url: "data/country-centroids.csv",
      dataType: "text",
      success: function(csv){
        console.log( "success loading country centroid data" );
        countryCentroids = $.csv.toObjects(csv)
      }
    })  
  
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
  
  
  
  //////////////////////////////////////////////////////////////////////////////
  
  // functions
  
  // interaction data
  var loadGA = function(start,end,callback) {
    // run GA query      
    $.ajax({
      url: "gaQuery.php?start="+start+"&end="+end+"&query=location",
      dataType: "jsonp",
      success: function(json){
        console.log( "success loading GA data" );
        callback({'data':json})
      }
    })  
  }
  var gaLoaded = function(args){
    
    var latIndex = _.findIndex(args.data.results.columns,function(col){return col.name === "ga:latitude"})
    var lonIndex = _.findIndex(args.data.results.columns,function(col){return col.name === "ga:longitude"})
    var countIndex = _.findIndex(args.data.results.columns,function(col){return col.name === "ga:sessions"})
    var countryIndex = _.findIndex(args.data.results.columns,function(col){return col.name === "ga:countryIsoCode"})
    
    interactions.ga.query.push(args.data.query)
    interactions.ga.results.push(args.data.results)
      
    
    var countriesLoaded = function(){
      
      // try by country centroid
      var rows = _.map(args.data.results.rows,function(row){
        if (parseFloat(row[latIndex]) === 0 && parseFloat(row[lonIndex]) === 0 ) {
          
          // country
          var country = _.findWhere(countryCentroids,{'ISO2':row[countryIndex]})
          
          row[latIndex] = typeof country !== 'undefined' ? country.LAT : 0
          row[lonIndex] = typeof country !== 'undefined' ? country.LON : 0 
        }
        return row
        
      })
      
      // ignore 0/0 locations
      var rows = _.filter(rows,function(row){
        return !(row[latIndex] === 0 && row[lonIndex] === 0 )
      })      
      
      interactions.ga.locations.push(_.map(rows,function(row){
        return {
          "point" : {
            "lat": row[latIndex],
            "lon": row[lonIndex]
          },
          "count" : parseInt(row[countIndex])
        }

      }))
      interactions.ga.maxValue = _.reduce(rows,function(initial, row){
        return Math.max(parseInt(row[countIndex]),initial)
      }, 0) // initial

      mapInteractions({source:'ga',interactions: _.last(interactions.ga.locations)})
    }
    
        // check for map loaded
    waitFor(
      function(){
        // waiting for
        return typeof countryCentroids !== 'undefined' 
      },
      function(){
        // loaded
        countriesLoaded()
      }      
    )   
    

    
    
    
  }
  
  
  
  
  // map 
  
  var initMap = function(){
    map  = L.map('map', mapOptions)
    L.tileLayer(
      MB_URL, 
      {attribution: MB_ATTR, id: MAP_ID}
    ).addTo(map);
  }
  var mapInteractions = function(args){    

    var mapLoaded = function (){
      layers[args.source].markers.addLayers(_.map(args.interactions, function(interaction){
        return L.marker(
          interaction.point,
          { 
            count : interaction.count
          }
        )
      }))
      map.addLayer(layers[args.source].markers)
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
    
  }
  
  var clusterCreate = function (cluster, source) {
		
    var sessionCount = 0 
    
    _.each(cluster.getAllChildMarkers(),function(marker){
      sessionCount += marker.options.count
    })
    
    var getIconSize = function(value, maxValue) {
            
      var rMax = clusterMarkerRadius.max
      //max Value ~ clusterMarkerRadius.max
      // scale by area
      var r = Math.sqrt((rMax*rMax) / (maxValue/value))
      
      // make sure at least minimum size
      return Math.max(clusterMarkerRadius.min, r)
    }
    
    var iconSize = getIconSize(sessionCount, interactions[source].maxValue )
    
    var c = ' marker-cluster-custom-'+ source
    
		return new L.DivIcon({ 
      html: '\
<div>\n\
<div class="leaflet-popup-content-wrapper">\n\
<div class="leaflet-popup-content">\n\
<strong>'+sessionCount+'</strong> visits\n\
</div>\n\
</div>\n\
<div class="leaflet-popup-tip-container">\n\
<div class="leaflet-popup-tip"></div>\n\
</div>\n\
</div>', 
      className: 'marker-cluster marker-cluster-custom' + c, 
      iconSize: new L.Point(iconSize, iconSize) 
    });
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
