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

                    if (navigator.geolocation) { 
                        navigator.geolocation.getCurrentPosition(geolocCallback);
                    } else {
                        console.log("Geolocation is not supported");
                    }

                    var that = this;

                    function geolocCallback(position) { 
                        lat = position.coords.latitude;
                        lon = position.coords.longitude;

                        var data = {
                            sessionToken: SESSION_TOKEN,
                            lat: lat, 
                            lon: lon
                        };

                        if (SESSION_TOKEN !== null) {
                            // trigger the map pan to the current view port
                            // $("#map").trigger("pan")

                            // find all of the relevant people for the current lat/long view.
                            $.ajax({
                                url: "/find",
                                type: "POST",
                                data: data,
                                success: function(data) {
                                    var results = data.results; 
                                    for (var i = 0; i < results.length; i++) {
                                        var cur = results[i];
                                        var curLat = cur.geo.latitude;
                                        var curLong = cur.geo.longitude;
                                        L.marker([curLat, curLong]).addTo(map)
                                            .bindPopup(cur.displayName);
                                    }
                                }, 
                                error: function (xhr, ajaxOptions, thrownError) {
                                    console.log(xhr, ajaxOptions, thrownError);
                                }
                            });
                        }
                    }
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

    initializeMap: function() { 
        var cupertinoCoords = [37.311, -122.056]; //shoutout APPLE!

        /*this.props.*/map = L.map(this.getDOMNode(), {
            center: cupertinoCoords,
            zoom: 13
        });

        L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(/*this.props.*/map);

    },

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
    render: function() { 
        return (
            <div className="shoutout-app">
                <h2>Shoutout for Web</h2>
                <p> This is the web view for Shoutout. Shoutout SHOUTOUT!</p>
                <LoginComponent/>
                <SignupComponent/>
                <MapComponent/>
            </div>
        );
    }
});


React.render(
    <TestComponent/>,
    document.getElementById("container")
);
