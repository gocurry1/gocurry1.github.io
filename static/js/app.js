function buildStateMetadata(state = 'AK', year = 2019) {
    // Build a metadata for a State
    var sample_metadata = d3.select("#sample-metadata");
    sample_metadata.html("");

    // get the current values for these two
    year = document.getElementById('year').value;
    state = document.getElementById('state').value;
    console.log(year)

    d3.json(`/${state}/${year}/data`).then(function (data) {
        console.log(data);
        Object.entries(data).forEach((key) => {
            sample_metadata.append('p')
                .text(key[0] + ": " + key[1] + "\n");
        });
    });
}

function buildBarChart(state = 'AK', year = 2019) {
    // alert('Chart called')
    // Build a Bar Chart for a state
    // By default take the first state which is AK
    // var sample_bar = d3.select("#bar");

    // get the current values for these two
    year = document.getElementById('year').value;
    state = document.getElementById('state').value;

    var temp_x = []
    var temp_y = []

    d3.json(`/data/${state}`).then(function (data) {
        // look at the samples dictionary from samples.json
        data.metadata.forEach(function (item) {
            // console.log(item)
            // TODO: create a bar chart here...
            // based on the year get the avg price for abuot 10 cities in this State and 
            // plot them on the bar chart
            //console.log(item)
            if (year == 2020) {
                temp_x.push(item[6])
            }
            else if (year == 2019) {
                temp_x.push(item[5])
            }

            temp_y.push(item[4])
        });
        var dataPlot = [
            {
                x: temp_y.slice(1, 10),
                y: temp_x.slice(1, 10),
                type: 'bar',
            }
        ];

        var layout = {
            title: "Average House Price",
        };

        Plotly.newPlot('bar', dataPlot, layout);
    });
}


// function buildBubbleChart(state = 'AK', year = 2019) {

//     year = document.getElementById('year').value;
//     state = document.getElementById('state').value;

//     var temp_x = []
//     var temp_y = []

//     d3.json(`/data/${state}`).then(function (data) {
//         // look at the samples dictionary from samples.json
//         data.metadata.forEach(function (item) {
//             // console.log(item)
//             // TODO: create a bubble chart here...
//             // based on the year & state get the avg price for abuot 10 cities in this State and 
//             // plot them on the bubble chart
//             if (year == 2020) {
//                 temp_x.push(item[6])
//             }
//             else if (year == 2019) {
//                 temp_x.push(item[5])
//             }

//             temp_y.push(item[4])
//         });

//         // console.log(temp_y)
//         var data = [
//             {
//                 x: temp_x.slice(1, 10),
//                 y: temp_y.slice(1, 10),
//                 mode: 'markers',
//                 text: temp_x,
//                 marker: {
//                     // size: temp_y.map(price => price*20),
//                     size: temp_y,
//                     //color: temp_x
//                 }
//             }
//         ];

//         var layout = {
//             title: "Bubble Chart",
//             xaxis: { title: "Avg Price" },
//         };
//         //console.log(data);
//         Plotly.newPlot('bubble', data, layout);
//     });
// }

// ----------------------------------- MAP ----------------------------

// used this website to choose colors:
// https://www.google.com/search?client=firefox-b-1-d&q=color+picker
// TODO change this to reflect a range of Prices
function get_color(depth) {
    var color = "rgb(0, 255, 0)";
    // if depth is negative just set a light green color
    if (depth <= 50000) {
        color = "rgb(0, 255, 0)";
    }
    else if (depth > 50000 && depth <= 100000) {
        color = "rgb(200, 209, 67)";
    }
    else if (depth > 100000 && depth <= 250000) {
        color = "rgb(237, 192, 95)";
    }
    else if (depth > 250000 && depth <= 500000) {
        color = "rgb(230, 154, 83)";
    }
    else if (depth > 500000 && depth <= 1000000) {
        color = "rgb(227, 98, 43)";
    }
    else if (depth > 1000000) {
        color = "rgb(204, 19, 6)";
    }
    // console.log(color);
    return color;
}

// data markers should reflect the magnitude of the earthquake by their size
// TODO: change this to reflect the average prices

function process_data() {
    // array to hold info abou markers for avg prices
    var markers = [];

    d3.json(`/data`).then(function (data) {
        console.log(data);
        // go through all the data and get only the info that we need
        data.forEach(function (item) {

            // TODO: figure out how to make the marker layers here.... this solution is a WIP
            // console.log(item)
            var place = item[4];
            var avg = item[5];
            // console.log(place)

            // [lat, lon]
            var latlon = [item[1], item[2]];
            //console.log(latlon)

            // get a color based on the magnitude
            var color = get_color(avg); // change 1 to avg and adjust get_color
            // get the marker_size based on magnitude

            // console.log(size)

            var marker_properties = {
                radius: 500,
                fillColor: color,
                color: color,
                weight: 5,
                opacity: 1,
                fillOpacity: 0.8
            };
            // console.log(latlon)
            var marker = L.circle(latlon, marker_properties).bindPopup(`<h3>${place}</h3>`);
            //var marker = L.marker(latlon);

            markers.push(marker);

        });
        //console.log(markers);
        //});
        var price_mark = L.layerGroup(markers);
        // createMap(price_mark);
        // }

        // function createMap(prices_markers) {

        // Create the base layers.
        var street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        })

        var topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
            attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
        });

        // Create a baseMaps object.
        var baseMaps = {
            "Street Map": street,
            "Topographic Map": topo
        };

        // Create an overlay object to hold our overlay.
        var overlayMaps = {
            "Avg Prices": price_mark
        };
        console.log(overlayMaps);
        // Create our map, giving it the streetmap and avgprices layers to display on load.
        var myMap = L.map("mapid", {
            center: [
                37.09, -95.71
            ],
            zoom: 5,
            layers: [street, price_mark]
        });

        // Create a layer control.
        // Pass it our baseMaps and overlayMaps.
        // Add the layer control to the map.
        L.control.layers(baseMaps, overlayMaps, {
            collapsed: false
        }).addTo(myMap);
        add_legend(myMap);
    });
};
// referenced this web site
// https://www.igismap.com/legend-in-leafletjs-map-with-topojson/
function add_legend(map) {
    // add legend to the map
    var legend = L.control({ position: "bottomright" })
    var labels = [];

    legend.onAdd = function (map) {
        var div = L.DomUtil.create('div', 'info legend'),
        grades = ["<$50,000", "$50,000 - 100,000", "$100,000 - 250,000", "$250,000 - 500,000", "$500,000 - 1,000,000", "$1,000,000<"],
            colors = ["rgb(0, 255, 0)",
                "rgb(200, 209, 67)",
                "rgb(237, 192, 95)",
                "rgb(230, 154, 83)",
                "rgb(227, 98, 43)",
                "rgb(204, 19, 6)"
            ]

        grades.forEach((element, index) => {
            div.innerHTML +=
                labels.push(
                    '<i class="circle" style="background:' + colors[index] + '"></i> ' +
                    (element ? element : '+'));
        });
        div.innerHTML = labels.join('<br>');
        return div;
    };
    legend.addTo(map);
}
// -------------------------- END MAP ----------------------------------

// this gets triggered when the option for State has changed
function optionChanged(sample_name) {
    buildStateMetadata(sample_name);
    buildBarChart(sample_name);
    //buildBubbleChart(sample_name);
}

// this gets triggered when the option for Year has changed
function yearChanged(sample_name, year) {
    buildStateMetadata(sample_name = sample_name, year = year);
    buildBarChart(sample_name = sample_name, year = year);
    //buildBubbleChart(sample_name = sample_name, year = year);
}

function main() {
    buildStateMetadata();
    buildBarChart();
    //buildBubbleChart();
    process_data();
}

main();
