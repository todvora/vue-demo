const app = new Vue({
    el: '#app',
    data: {
        message: null,
        apiKey: '6cd40f2687b62e78176a8212050073e9', // registred to tdvorak, get your own key. In a real world, you would store it in local session or somewhere else ;-)
        location: 'Linz', // default predefined location
        map: null, // leaflet map element
        marker: null, // leaflet map marker (pointer) element
        forecast: { // example structure
            "coord": {"lon": 14.29, "lat": 48.31},
            "weather": [{"id": 800, "main": "Clear", "description": "clear sky", "icon": "01d"}],
            "base": "stations",
            "main": {"temp": 13, "pressure": 1018, "humidity": 66, "temp_min": 13, "temp_max": 13},
            "visibility": 10000,
            "wind": {"speed": 6.7, "deg": 80},
            "clouds": {"all": 0},
            "dt": 1539235200,
            "sys": {
                "type": 1,
                "id": 5932,
                "message": 0.0038,
                "country": "AT",
                "sunrise": 1539234997,
                "sunset": 1539274897
            },
            "id": 2772400,
            "name": "Linz",
            "cod": 200
        }, // example data, will be refreshed during init
        history: ['Salzburg', 'Prague', 'Vienna', 'Rio de Janeiro'] // some elements already pre-filled so you know what to try
    },
    methods: {
        initMap: function () { // initialize leaflet, add tiles layer and contribution info
            this.map = new L.Map('mapid');
            const osmUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
            const osmAttrib = 'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors';
            const osm = new L.TileLayer(osmUrl, {attribution: osmAttrib});
            this.map.addLayer(osm);
            this.centerMap();
        },
        centerMap: function () { // move map center, add marker
            this.map.setView(new L.LatLng(this.forecast.coord.lat, this.forecast.coord.lon), 7);
            if (this.marker) {
                this.map.removeLayer(this.marker);
            }
            this.marker = L.marker([this.forecast.coord.lat, this.forecast.coord.lon]).addTo(this.map);
        },
        fetchData: function () {
            return fetch(`https://api.openweathermap.org/data/2.5/weather?q=${this.location}&units=metric&appid=${this.apiKey}`)
                .then(res => res.json())
                .then(data => {
                    if (data.cod === 200) {
                        this.forecast = data;
                    } else {
                        this.message = `Error ${data.cod}: ${data.message}`;
                    }
                });
        },
        formSubmitted: function () { // fetch data only on explicit submit or [ENTER], if we would listen to changes
            // of the input, we would request also partial names, which doesn't make sense.
            this.fetchData();
        },
        historyEntryClicked: function (location) {
            this.location = location; // restore the history entry to the current input
            this.formSubmitted();
        }
    },
    mounted: function () { // lifecycle hook, see https://vuejs.org/v2/guide/instance.html#Lifecycle-Diagram
        this.initMap();
        this.fetchData();
    },
    watch: { // what should happen if any of these values is changed?
        'forecast.coord': function () {
            this.centerMap();
        },
        'forecast.name': function (newValue, oldValue) {
            if (this.history.indexOf(oldValue) === -1) {
                this.history.push(oldValue);
            }
        },
        'message': function () {
            setTimeout(() => this.message = null, 3000); // let the message disappear after 3s
        }
    },
    computed: {
        forecastIcon: function () { // computed only when the underlying data really change
            return `https://openweathermap.org/img/w/${this.forecast.weather[0].icon}.png`
        }

    }
});