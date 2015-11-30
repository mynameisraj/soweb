/** @jsx React.DOM */

var React = require("react");
var $ = require("jquery");

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
    getDefaultProps: function() {
        return {
            sessionToken: ""
        };
    },
    login: function(e) {
        e.preventDefault();
        $(this.refs.errorAlert).addClass("hidden");
        var data = {
            username: this.refs.username.value,
            password: this.refs.password.value
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
                    $('#close-btn').click();
                    this.props.postLogin(data.username, result.sessionToken);
                }
                this.setState(s);
            }.bind(this),
            error: function (xhr, ajaxOptions, thrownError) {
                console.log(xhr, ajaxOptions, thrownError);
            }
        });

        this.refs.username.value = ""; 
        this.refs.password.value = "";
    },
    render: function() {
        return (
            <div className="modal fade" id="login-modal" tabIndex="-1" role="dialog" aria-labelledby="loginModalLabel">
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
                                <label forHtml="inputEmail1">Username</label>
                                <input type="text" className="form-control" id="inputEmail1" placeholder="Email" ref="username" />
                            </div>
                            <div className="form-group">
                                <label forHtml="inputPassword1">Password</label>
                                <input type="password" className="form-control" id="inputPassword1" placeholder="Password" ref="password" />
                            </div>
                        </form>
                    </div>
                  </div>
                  <div className="modal-footer">
                      <form>
                          <button type="button" className="btn btn-default" data-dismiss="modal" id="close-btn">Close</button>
                          <button type="submit" className="btn btn-primary" onClick={this.login} id="login-btn" ref="btn">Login</button>
                      </form>
                  </div>
                </div>
              </div>
            </div>
        );
    }
});

module.exports = LoginComponent;
