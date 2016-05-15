$(function () {
  
  // constants
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

    var styles = [
    {
        "featureType": "all",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#f2f6f8"
            }
        ]
    },
    {
        "featureType": "all",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "gamma": 0.01
            },
            {
                "lightness": 20
            }
        ]
    },
    {
        "featureType": "all",
        "elementType": "labels.text.stroke",
        "stylers": [
            {
                "saturation": -31
            },
            {
                "lightness": -33
            },
            {
                "weight": 2
            },
            {
                "gamma": 0.8
            }
        ]
    },
    {
        "featureType": "all",
        "elementType": "labels.icon",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "administrative",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "administrative.country",
        "elementType": "geometry.stroke",
        "stylers": [
            {
                "visibility": "on"
            },
            {
                "color": "#b3b3b3"
            }
        ]
    },
    {
        "featureType": "administrative.country",
        "elementType": "labels",
        "stylers": [
            {
                "visibility": "on"
            }
        ]
    },
    {
        "featureType": "administrative.country",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#888888"
            }
        ]
    },
    {
        "featureType": "administrative.country",
        "elementType": "labels.text.stroke",
        "stylers": [
            {
                "color": "#ffffff"
            }
        ]
    },
    {
        "featureType": "landscape",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "off"
            },
            {
                "color": "#cfdde6"
            }
        ]
    },
    {
        "featureType": "landscape",
        "elementType": "geometry",
        "stylers": [
            {
                "lightness": 30
            },
            {
                "saturation": 30
            }
        ]
    },
    {
        "featureType": "landscape.man_made",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "visibility": "off"
            },
            {
                "color": "#ff0000"
            }
        ]
    },
    {
        "featureType": "landscape.natural",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "on"
            },
            {
                "color": "#cfdde6"
            }
        ]
    },
    {
        "featureType": "landscape.natural.landcover",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "on"
            },
            {
                "color": "#cfdde6"
            }
        ]
    },
    {
        "featureType": "landscape.natural.terrain",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "visibility": "on"
            },
            {
                "color": "#b8c5cf"
            }
        ]
    },
    {
        "featureType": "poi",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "poi",
        "elementType": "geometry",
        "stylers": [
            {
                "saturation": 20
            }
        ]
    },
    {
        "featureType": "poi.park",
        "elementType": "geometry",
        "stylers": [
            {
                "lightness": 20
            },
            {
                "saturation": -20
            }
        ]
    },
    {
        "featureType": "road",
        "elementType": "geometry",
        "stylers": [
            {
                "lightness": 10
            },
            {
                "saturation": -30
            }
        ]
    },
    {
        "featureType": "road",
        "elementType": "geometry.stroke",
        "stylers": [
            {
                "saturation": 25
            },
            {
                "lightness": 25
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "transit",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "all",
        "stylers": [
            {
                "lightness": -20
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "visibility": "on"
            },
            {
                "color": "#f2f6f8"
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "geometry.stroke",
        "stylers": [
            {
                "visibility": "off"
            },
            {
                "color": "#f2f6f8"
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "labels",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    }
];

    var ggl = new L.Google('ROADMAP', {
      mapOptions: {
        styles: styles
      }
    });
    map.addLayer(ggl);
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
