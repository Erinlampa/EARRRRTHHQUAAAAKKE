// Store our API endpoint inside queryUrl
var earthquakeURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson";

var tectonicPlatesURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

// Perform a GET request to the query URL
d3.json(earthquakeURL, function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
});

function createFeatures(earthquakeData) {

  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the magnitude, place and time of the earthquake
  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: function(feature, layer) {
      layer.bindPopup("<h3>Magnitude: " + feature.properties.mag +"</h3><h3>Location: "+ feature.properties.place +
        "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
    },
    
    pointToLayer: function (feature, latlng) {
      return new L.circle(latlng,
        {radius: getRadius(feature.properties.mag),
        fillColor: getColor(feature.properties.mag),
        fillOpacity: .6,
        color: "#000",
        stroke: true,
        weight: .8
    })
  }
  });

  
  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);
}


function createMap(earthquakes) {

    // Define streetmap and darkmap layers
    var outdoors = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v10/tiles/256/{z}/{x}/{y}?" +
      "access_token=pk.eyJ1IjoiZXJpbmxhbXBhIiwiYSI6ImNqdGJtYTU5cDBuYjg0YW9iZ2FnZzVwamwifQ.kUBX29nxBqBw9CyJ6sXNrA");
  
    var satellite = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/256/{z}/{x}/{y}?" +
      "access_token=pk.eyJ1IjoiZXJpbmxhbXBhIiwiYSI6ImNqdGJtYTU5cDBuYjg0YW9iZ2FnZzVwamwifQ.kUBX29nxBqBw9CyJ6sXNrA");

    var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/dark-v9/tiles/256/{z}/{x}/{y}?" +
      "access_token=pk.eyJ1IjoiZXJpbmxhbXBhIiwiYSI6ImNqdGJtYTU5cDBuYjg0YW9iZ2FnZzVwamwifQ.kUBX29nxBqBw9CyJ6sXNrA");
  
    // Define a baseMaps object to hold our base layers
    // Pass in our baseMaps 
    var baseMaps = {
      "Outdoors": outdoors,
      "Satellite": satellite,
      "Dark Map": darkmap
    };

    // Creat a layer for the tectonic plates
    var tectonicPlates = new L.LayerGroup();

    // Create overlay object to hold our overlay layer
    var overlayMaps = {
      "Earthquakes": earthquakes,
      "Tectonic Plates": tectonicPlates
    };

    // Create our map, giving it the outdoors, earthquakes and tectonic plates layers to display on load
    var myMap = L.map("map", {
      center: [
        37.09, -95.71],
      zoom: 3.25,
      layers: [outdoors, earthquakes, tectonicPlates]
    }); 

    // Add Fault lines data
    d3.json(tectonicPlatesURL, function(plateData) {
      // Adding our geoJSON data, along with style information, to the tectonicplates
      // layer.
      L.geoJson(plateData, {
        color: "brown",
        weight: 2
      })
      .addTo(tectonicPlates);
  });

  
    // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
      collapsed: false
    }).addTo(myMap);

  //Create a legend on the bottom left
  var legend = L.control({position: 'bottomleft'});

    legend.onAdd = function(myMap){
      var div = L.DomUtil.create('div', 'info legend'),
        grades = [0, 1, 2, 3, 4, 5],
        labels = [];

  // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }
    return div;
  };

  legend.addTo(myMap);
}
   

  //Create color range for the circle diameter 
  function getColor(d){
    return d > 5 ? "#7000E0F":
    d  > 4 ? "#313766":
    d > 3 ? "#3F4E78":
    d > 2 ? "#495056":
    d > 1 ? "#ADAB9E":
             "#ADAB9E";
  }

  //Change the maginutde of the earthquake by a factor of 25,000 for the radius of the circle. 
  function getRadius(value){
    return value*25000
  }