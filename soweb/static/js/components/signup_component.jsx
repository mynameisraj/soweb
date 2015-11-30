/** @jsx React.DOM */

var React = require('react');
var $ = require("jquery");

/** 
 * Allows a user to sign up, and adds them to the backend.
 */ 
var SignupComponent = React.createClass({
    getInitialState: function() {
        return {
            signupStatus: "Not logged in"
        };
    },
    getDefaultProps: function() {
        return {
            sessionToken: ""
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

module.exports = SignupComponent;