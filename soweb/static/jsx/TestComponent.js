/*** @jsx React.DOM */

var SESSION_TOKEN;
var map;

var SignupComponent = React.createClass({
    getInitialState: function() {
        return {
            signupStatus: "Not logged in"
        };
    },
    signup: function(e) {
        e.preventDefault();
        var data = {
            username: this.refs.username.getDOMNode().value,
            password: this.refs.password.getDOMNode().value,
            email: this.refs.email.getDOMNode().value
        };

        $.ajax({
            url: "/join",
            type: "POST",
            data: data,
            dataType: "json",
            success: function (result) {
                var s = this.state;
                if ("error" in result) {
                    s.signupStatus = "Invalid credentials"
                } else if ("sessionToken" in result) {
                    s.signupStatus = "Signed up as " + data.username
                    SESSION_TOKEN = result.sessionToken;
                }
                this.setState(s);
            }.bind(this),
            error: function (xhr, ajaxOptions, thrownError) {
                console.log(xhr, ajaxOptions, thrownError);
            }
        });
    },
    render: function() {
        return (
            <div class="signup">
                <h3>Signup for ShoutOut</h3>
                Username: <input type="text" ref="username"/><br/>
                Password: <input type="password" ref="password"/><br/>
                Email: <input type="email" ref="email"/><br/>
                <button className="btn btn-primary" onClick={this.signup}>Signup</button>
                <div>{this.state.signupStatus}</div>
            </div>
        );
    }
});

var LoginComponent = React.createClass({
    getInitialState: function() {
        return {
            loggedInStatus: "Not logged in",
        };
    },
    login: function(e) {
        e.preventDefault();
        var data = {
            username: this.refs.username.getDOMNode().value,
            password: this.refs.password.getDOMNode().value
        }

        $.ajax({
            url: "/auth",
            type: "POST",
            data: data,
            dataType: "json",
            success: function (result) {
                console.log(result);
                var s = this.state;
                if ("error" in result) {
                    s.loggedInStatus = "Invalid credentials"
                } else if ("sessionToken" in result) {
                    s.loggedInStatus = "Logged in as " + data.username
                    SESSION_TOKEN = result.sessionToken;
                    this.props.postLogin();
                }
                this.setState(s);
            }.bind(this),
            error: function (xhr, ajaxOptions, thrownError) {
                console.log(xhr, ajaxOptions, thrownError);
            }
        });
    },
    render: function() {
        return (
            <div className="login">
                <h3>Login to ShoutOut</h3>
                Username: <input type="text" ref="username"/><br/>
                Password: <input type="password" ref="password"/><br/>
                <button type="button" className="btn btn-default" onClick={this.login}>Login</button>
                <div>{this.state.loggedInStatus}</div>
            </div>
        );
    }
});

var MapComponent = React.createClass({
    getInitialState: function() {
        return {
            currentUser: null,
            otherUsers: []
        };
    },
    getDefaultProps: function() {
        return {
            map: null
        };
    },
    updateMapToLocation: function(position) {
        // Update all the markers on the map with new data
        var map = this.props.map;
        var defaultIcon = L.icon({
            iconUrl: "/default_profile_pic.jpg",
            iconRetinaUrl: "/default_profile_pic.jpg",
            iconSize: [40, 40],
            iconAnchor: [20, 20],
            popupAnchor: [0, -20]
        });
        var drawPinsWithData = function(data) {
            console.log(data);
            var results = data.results; 
            var markers = {}
            $.each(results, function(index, cur) {
                var curLat = cur.lat;
                var curLong = cur.lon;
                var marker = L.marker([curLat, curLong], {'icon': defaultIcon});
                marker.addTo(map)
                    .bindPopup('<strong>' + cur.username + '</strong>: ' + cur.status);
                var username = cur.username;
                markers[username] = marker;
                $.ajax({
                    url: "/profile_pic",
                    type: "POST",
                    data: {
                        "sessionToken": SESSION_TOKEN,
                        "username": cur.username
                    },
                    success: function(data) {
                        console.log(data);
                        if ("url" in data) {
                            var url = data.url;
                            var newIcon = L.icon({
                                iconUrl: url,
                                iconRetinaUrl: url,
                                iconSize: [40, 40],
                                iconAnchor: [20, 20],
                                popupAnchor: [0, -20]
                            });
                            markers[username].setIcon(newIcon);
                        }
                    },
                    error: function(xhr, ajaxOptions, thrownError) {
                        console.log(xhr, ajaxOptions, thrownError);
                    }
                });
            });
        }

        lat = position.coords.latitude;
        lon = position.coords.longitude;

        map.setView(L.latLng(lat, lon));

        var data = {
            sessionToken: SESSION_TOKEN,
            lat: lat, 
            lon: lon
        };

        if (SESSION_TOKEN !== null) {
            // find all of the relevant people for the current lat/long view.
            $.ajax({
                url: "/find",
                type: "POST",
                data: data,
                success: function(data) {
                    drawPinsWithData(data);
                }, 
                error: function (xhr, ajaxOptions, thrownError) {
                    console.log(xhr, ajaxOptions, thrownError);
                }
            });
        }
    },
    initializeMap: function() { 
        var cupertinoCoords = [37.311, -122.056]; //shoutout APPLE!
        var map = L.map(this.getDOMNode(), {
            center: cupertinoCoords,
            zoom: 13
        });

        // TODO: prettier maps, add subdomains for parallel fetching
        L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        // Update props with the new map
        this.props.map = map;
    },
    // Initalize the map once we have a DOM node
    componentDidMount: function() {
        this.initializeMap();
    },
    render: function() {
        return (
            <div id="map"> 
            </div>
        )
    }
});

var TestComponent = React.createClass({ 
    userLoggedIn: function() {
        if (navigator.geolocation) { 
            navigator.geolocation.getCurrentPosition(geolocCallback);
        } else {
            console.log("Geolocation is not supported");
        }

        var map = this.refs.mapComponent;

        function geolocCallback(position) { 
            map.updateMapToLocation(position);
        }
    },
    render: function() { 
        return (
            <div className="shoutout-app">
                <MapComponent ref="mapComponent"/>
                <LoginComponent postLogin={this.userLoggedIn} />
            </div>
        );
    }
});


React.render(
    <TestComponent/>,
    document.getElementById("container")
);
