/** @jsx React.DOM */
var React = require("react");
var LoginComponent = require("./login_component.jsx");
var NavComponent = require("./nav_component.jsx");
var MapComponent = require("./map_component.jsx");
var MessagesComponent = require("./messages_component.jsx");

var ShoutOut = React.createClass({ 
    getInitialState: function() {
        return {
            username: '', 
            token: "", 
            map: null
        }
    },

    componentDidMount: function() {
        var map = this.refs.mapComponent;
        var mapObj = map.initializeMap();
        this.setState({map: mapObj});
    },

    userLoggedIn: function(username, sessionToken) {
        if (navigator.geolocation) { 
            navigator.geolocation.getCurrentPosition(geolocCallback);
        } else {
            console.log("Geolocation is not supported");
        }

        var s = this.state;
        s.username = username;
        s.token = sessionToken;
        this.setState(s);

        var map = this.refs.mapComponent;

        function geolocCallback(position) {
            map.updateMapToLocation(position);
        }

        var messages = this.refs.messagesComponent;
        messages.getMessages(); 
        messages.goFullWidth();
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
                        <MapComponent ref="mapComponent" map={this.state.map} sessionToken={this.state.token}/>
                    </div>
                    <div className="row">
                        <MessagesComponent ref="messagesComponent" sessionToken={this.state.token}/> 
                    </div> 
                </div>
            </div>
        );
    }
});

module.exports = ShoutOut;
