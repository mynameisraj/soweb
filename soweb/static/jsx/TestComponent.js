/*** @jsx React.DOM */

var SESSION_TOKEN;
var map;

/**
 * Our navigation component which contains links to log in, sign out, etc. 
 */
var NavComponent = React.createClass({
    render: function() {
        return (
            <nav className="navbar navbar-default navbar-static-top">
              <div className="container">
                <div className="navbar-header">
                  <button type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target="#so-navbar-collapse" aria-expanded="false">
                    <span className="sr-only">Toggle navigation</span>
                    <span className="icon-bar"></span>
                    <span className="icon-bar"></span>
                    <span className="icon-bar"></span>
                  </button>
                  <a className="navbar-brand" href="#">ShoutOut</a>
                </div>

                <div className="collapse navbar-collapse" id="so-navbar-collapse">
                  <ul className="nav navbar-nav navbar-right">
                    <li className={this.props.username != '' ? 'hidden' : ''}><a href="#" data-toggle="modal" data-target="#login-modal">Login</a></li>
                    <li className="dropdown" className={this.props.username == '' ? '' : 'hidden'}>
                      <a href="#" className="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">Logged in as {this.props.username} <span className="caret"></span></a>
                      <ul className="dropdown-menu">
                        <li><a href="#">Action</a></li>
                        <li><a href="#">Another action</a></li>
                        <li><a href="#">Something else here</a></li>
                        <li role="separator" className="divider"></li>
                        <li><a href="#">Separated link</a></li>
                      </ul>
                    </li>
                  </ul>
                </div>
              </div>
            </nav>
       )
    }
});

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
            <div className="signup">
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
        $(this.refs.errorAlert).addClass("hidden");
        var data = {
            username: this.refs.username.getDOMNode().value,
            password: this.refs.password.getDOMNode().value
        }
        $(this.refs.btn).html("Logging in...");

        $.ajax({
            url: "/auth",
            type: "POST",
            data: data,
            dataType: "json",
            success: function (result) {
                var s = this.state;
                if ("error" in result) {
                    s.loggedInStatus = "Invalid credentials";
                    $(this.refs.errorAlert).removeClass("hidden");
                    $(this.refs.btn).html("Login");
                } else if ("sessionToken" in result) {
                    s.loggedInStatus = "Logged in as " + data.username
                    SESSION_TOKEN = result.sessionToken;
                    $('#login-modal').modal('toggle')
                    this.props.postLogin(data.username);
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
            <div className="modal fade" id="login-modal" tabindex="-1" role="dialog" aria-labelledby="loginModalLabel">
              <div className="modal-dialog" role="document">
                <div className="modal-content">
                  <div className="modal-header">
                    <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                    <h4 className="modal-title" id="loginModalLabel">Login to ShoutOut</h4>
                  </div>
                  <div className="modal-body">
                    <div className="alert alert-danger hidden" role="alert" ref="errorAlert">{this.state.loggedInStatus}</div>
                    <div className="login" onKeyPress={this.handleKeyPress}>
                        <form>
                            <div className="form-group">
                                <label for="inputEmail1">Username</label>
                                <input type="text" className="form-control" id="inputEmail1" placeholder="Email" ref="username" />
                            </div>
                            <div className="form-group">
                                <label for="inputPassword1">Password</label>
                                <input type="password" className="form-control" id="inputPassword1" placeholder="Password" ref="password" />
                            </div>
                        </form>
                    </div>
                  </div>
                  <div className="modal-footer">
                      <form>
                          <button type="button" className="btn btn-default" data-dismiss="modal">Close</button>
                          <button type="submit" className="btn btn-primary" onClick={this.login} id="login-btn" ref="btn">Login</button>
                      </form>
                  </div>
                </div>
              </div>
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

        $.ajax({
            url: "/update/location",
            type: "PUT",
            sessionToken: SESSION_TOKEN,
            lat: lat, 
            lon: lon
        });

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
        return map; 
    },

    render: function() {
        return (
            <div id="map" className="col-md-12"> 
            </div>
        )
    }
});

var MessagesComponent = React.createClass({
    getInitialState: function() { 
        return { 
            messages: [],
            messagesWidth: "hidden"
        }
    },

    goFullWidth: function() {
        var s = this.state;
        s.messagesWidth = "col-md-12";
        this.setState(s);
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
        var messageNodes = this.state.messages.map(function(message) { 
            return (
                <tr> 
                    <td>{message.from}</td>
                    <td>{message.msg}</td> 
                </tr>
            )
        });

        return (
            <div id="messages-container" className={this.state.messagesWidth}>
                <table className="message table"> 
                    <thead>
                        <th>From</th>
                        <th>Message</th>
                    </thead>
                    <tbody>
                        {messageNodes}
                    </tbody>
                </table> 
            </div>
        )
    }
});

var ShoutOut = React.createClass({ 
    getInitialState: function() {
        return {
            'username': ''
        }
    },

    getDefaultProps: function() { 
        return { 
            map: null
        }
    },

    componentDidMount: function() { 
        var map = this.refs.mapComponent;
        var mapObj = map.initializeMap();

        this.props.map = mapObj; 
    },

    userLoggedIn: function(username) {
        if (navigator.geolocation) { 
            navigator.geolocation.getCurrentPosition(geolocCallback);
        } else {
            console.log("Geolocation is not supported");
        }

        var map = this.refs.mapComponent;

        function geolocCallback(position) { 
            console.log("We hit the Geolocation callback!");
            map.updateMapToLocation(position);
        }

        var messages = this.refs.messagesComponent;
        messages.getMessages(); 
        messages.goFullWidth();

        var s = this.state;
        s.username = username;
        this.setState(s);
    },
    render: function() { 
        return (
            <div className="shoutout-app">
                <LoginComponent postLogin={this.userLoggedIn} ref="loginComponent" />
                <div className="nav" role="navigation">
                    <NavComponent username={this.state.username} ref="navComponent" />
                </div>
                <div className="container-fluid">
                    <div className="row">
                        <MapComponent ref="mapComponent" map={this.props.map}/>
                    </div>
                    <div className="row">
                        <MessagesComponent ref="messagesComponent"/> 
                    </div> 
                </div>
            </div>
        );
    }
});


React.render(
    <ShoutOut/>,
    document.getElementById("container")
);
