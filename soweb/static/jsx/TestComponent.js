/*** @jsx React.DOM */

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
        var s = this.state;
        var that = this;

        $.ajax({
            url: "/auth",
            type: "POST",
            data: data,
            dataType: "json",
            success: function (result) {
                if ("error" in result) {
                    s.loggedInStatus = "Invalid credentials"
                } else if ("sessionToken" in result) {
                    s.loggedInStatus = "Logged in as " + data.username
                }
                that.setState(s);
            },
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
            </div>
        );
    }
});

React.render(
    <TestComponent/>,
    document.getElementById("container")
);
