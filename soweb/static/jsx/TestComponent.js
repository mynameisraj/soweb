/*** @jsx React.DOM */

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
                <button onClick={this.signup}>Signup</button>
                <div>{this.state.signupStatus}</div>
            </div>
        );
    }
});

var LoginComponent = React.createClass({
    getInitialState: function() {
        return {
            loggedInStatus: "Not logged in"
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
                var s = this.state;
                if ("error" in result) {
                    s.loggedInStatus = "Invalid credentials"
                } else if ("sessionToken" in result) {
                    s.loggedInStatus = "Logged in as " + data.username
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
            <div class="login">
                <h3>Login to ShoutOut</h3>
                Username: <input type="text" ref="username"/><br/>
                Password: <input type="password" ref="password"/><br/>
                <button onClick={this.login}>Login</button>
                <div>{this.state.loggedInStatus}</div>
            </div>
        );
    }
});

var TestComponent = React.createClass({ 
    render: function() { 
        return (
            <div class="shoutout-app">
                <h2>Hello, World!</h2>
                <p>This is ShoutOut for web. Shoutout SHOUTOUT!</p>
                <LoginComponent/>
                <SignupComponent/>
            </div>
        );
    }
});

React.render(
    <TestComponent/>,
    document.getElementById("container")
);
