/** @jsx React.DOM */

/**
 * Our navigation component which contains links to log in, sign out, etc. 
 */

var React = require("react");

var NavComponent = React.createClass({
    getDefaultProps: function() {
        return {
            username: ""
        };
    },

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

module.exports = NavComponent;