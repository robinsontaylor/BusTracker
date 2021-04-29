(function(){

    //initialize global variables
    const map = L.map('theMap').setView([44.650627, -63.597140], 14);
    const busLayer = L.geoJSON().addTo(map);
    let busFeatures = [];
    let busMarkers = [];

    // tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

    // api link
    const api_url = 'https://hrmbusapi.herokuapp.com/';

    // fetch data
    async function getBusses() {
        const response = await fetch(api_url);
        const data = await response.json();
 
        addMarkers(busList(data));
    };

    //fetch + plot
    getBusses();

    // repeat every 7 seconds
    setInterval(function () {
        // Remove markers before replot
        busLayer.clearLayers();
        // fetch + replot
        getBusses();
    }, 7000);

    // icon specs
    var busIcon = L.icon({
        iconUrl: 'bus.png',
        iconSize: [32, 40],
        iconAnchor: [16, 20],
    })

    // get active busses (filtered for routes 1-10)
    function busList(data)
    {
        let busses = data.entity.filter(b=>b.vehicle.trip.routeId <= 10);

        // let getVariables = busses.map(b=>b.id = busId, b.vehicle.trip.routeId = routeId,
        //     b.vehicle.position.latitude = busLat, b.vehicle.position.longitude = busLong,
        //     b.vehicle.position.bearing = busBearing, b.vehicle.position.speed = busSpeed)
        //     .filter(b=>b.vehicle.position.speed.includes(undefined)).map(b.busBearing = "Stopped")

        // refactor to array function
        for(i = 0; i < busses.length; i++) {

            // get current bus data into variables
            busId = busses[i].id;
            routeId = busses[i].vehicle.trip.routeId;
            busLat = busses[i].vehicle.position.latitude;
            busLong = busses[i].vehicle.position.longitude;
            busBearing = busses[i].vehicle.position.bearing;
            busSpeed = busses[i].vehicle.position.speed;
            if (busSpeed == undefined) busSpeed = "Stopped";

            // log current bus info to console
            console.log('Bus ID: ' + busId);
            console.log('Route: ' + routeId);
            console.log('Latitude: ' + busLat);
            console.log('Longitude: ' + busLong);
            console.log('Bearing: ' + busBearing);
            console.log('Speed: ' + busSpeed);
            console.log('-----------------------------------------------------------------------------');

            // geoJSON format conversion, (creates feature array)
            busFeatures[i] = {
                "type": "Feature",
                "geometry":{
                    "type": "Point",
                    "coordinates": [busLat, busLong],
                    "bearing": busBearing
                    },
                "properties": {
                    "busID": busId,
                    "routeID": routeId,
                    "speed": busSpeed,
                    "popupContent": "Bus ID: " + busId + "<br>" + "Route: " + routeId + "<br>" + "Speed: " + busSpeed
                }
            }
        };

        console.log('\t\t\t\t-- Active HRM busses (routes 1 - 10): ' + busses.length + ' --');
        console.log('-----------------------------------------------------------------------------');

        return busFeatures;
    }

    // add markers using geoJSON object
    function addMarkers(busFeatures) 
    {
        // refactor to array function
        for(i = 0; i < busFeatures.length; i++) {

            // put data into variables
            busLat = busFeatures[i].geometry.coordinates[0];
            busLong = busFeatures[i].geometry.coordinates[1];
            busBearing = busFeatures[i].geometry.bearing;
            busPopup = busFeatures[i].properties.popupContent;

            // populate marker array with bus data
            busMarkers[i] = L.marker([busLat, busLong], { icon: busIcon }).addTo(map);
            // rotate icon
            busMarkers[i].setRotationAngle(busBearing)
            // on click popup
            busMarkers[i].bindPopup(busPopup);
            // add to layer to allow clearing and replotting to map
            busLayer.addLayer(busMarkers[i]);
        };
    }
})()