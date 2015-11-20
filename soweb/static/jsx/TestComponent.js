/*** @jsx React.DOM */

var SESSION_TOKEN;
var map;

/** 
 * Allows a user to sign up, and adds them to the backend.
 */ 
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

/**
 * Our login component which handles logging in the user. 
 */
var LoginComponent = React.createClass({
    getInitialState: function() {
        return {
            loggedInStatus: "Not logged in",
        };
    },

    handleKeyPress: function(e) {
        var key = e.which || e.keyCode; 
        if (key === 13) {
            this.login(e);
        }
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

        this.refs.username.getDOMNode().value = ""; 
        this.refs.password.getDOMNode().value = "";
    },
    render: function() {
        return (
            <div className="login" onKeyPress={this.handleKeyPress} className="col-md-4">
                <h3>Login to ShoutOut</h3>
                <h6>{this.state.loggedInStatus}</h6>
                <form>
                    <div className="form-group">
                        <label for="inputEmail1">Username</label>
                        <input type="text" className="form-control" id="inputEmail1" placeholder="Email" ref="username" />
                    </div>
                    <div className="form-group">
                        <label for="inputPassword1">Password</label>
                        <input type="password" className="form-control" id="inputPassword1" placeholder="Password" ref="password" />
                    </div>
                    <button type="submit" className="btn btn-default" onClick={this.login} id="login-btn" ref="btn">Login</button>
                </form>
            </div>
        );
    }
});

/*
 * Represents our map. Contains all user annotations 
 * callouts representing their status and username.
 */ 
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

        map.setView(L.latLng(lat, lon), 20);

        var data = {
            sessionToken: SESSION_TOKEN,
            lat: lat, 
            lon: lon,
            limit: 20
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

        L.tileLayer('https://{s}.tiles.mapbox.com/v4/{mapId}/{z}/{x}/{y}.png?access_token={token}', {
            attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
            subdomains: ['a', 'b', 'c', 'd'],
            token: 'pk.eyJ1IjoiYWtsZWluZXIyNCIsImEiOiJjaWd3cDNwNnQwc2U5d3dtMHQ1MTUzNGc0In0.DT4ef66V1VAdbYMhQbyc5A',
            mapId: 'akleiner24.cigwp3o080scc4pm35hb1abwb'
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

var MessagesComponent = React.createClass({
    getInitialState: function() { 
        return { 
            messages: []
        }
    },

    getMessages: function() { 
        var data = { 
            sessionToken: SESSION_TOKEN
        };

        $.ajax({
            url: "/msgs",
            type: "POST",
            data: data,
            success: function(data) {
                // trigger a re-render  
                this.setState({messages: data}); 
            }.bind(this), 
            error: function (xhr, ajaxOptions, thrownError) {
                console.log(xhr, ajaxOptions, thrownError);
            }
        }); 
    },

    render: function() { 
        console.log(this.state.messages);
        var messageNodes = this.state.messages.map(function(message) { 
            return (
                <div className="message"> 
                    <em> {message.msg} </em> 
                </div> 
            )
        });

        return (
            <div id="messages-container" className="col-md-8">
                {messageNodes}
            </div> 
        )
    }
});

var ShoutOut = React.createClass({ 
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

        var messages = this.refs.messagesComponent;

        messages.getMessages(); 
    },
    render: function() { 
        return (
            <div className="shoutout-app">
                <MapComponent ref="mapComponent"/>
                <div className="row">
                    <LoginComponent postLogin={this.userLoggedIn} />
                    <MessagesComponent ref="messagesComponent"/> 
                </div> 
            </div>
        );
    }
});


React.render(
    <ShoutOut/>,
    document.getElementById("container")
);
