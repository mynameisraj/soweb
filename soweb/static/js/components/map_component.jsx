/** @jsx React.DOM */

var React = require("react");
var ReactDOM = require("react-dom");
var $ = require("jquery");
var L = require("leaflet");

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
        var sessionToken = this.props.sessionToken;

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
                        "sessionToken": sessionToken,
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
            sessionToken: sessionToken,
            lat: lat, 
            lon: lon 
        };

        $.ajax({
            url: "/update/location",
            type: "PUT",
            data: data,
            success: function(data) { 
                return;
            },
            error: function (xhr, ajaxOptions, thrownError) {
                console.log(xhr, ajaxOptions, thrownError);
            }
        });

        data.limit = 20;

        if (this.props.sessionToken !== null) {
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
        var map = L.map(this.refs.mapNode, {
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
            <div id="map" className="col-md-12" ref="mapNode"> 
            </div>
        )
    }
});

module.exports = MapComponent;