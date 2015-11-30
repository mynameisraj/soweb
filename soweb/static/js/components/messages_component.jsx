/** @jsx React.DOM */

var React = require('react');
var $ = require('jquery');

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
            sessionToken: this.props.sessionToken
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
                        <tr> 
                            <th>From</th>
                            <th>Message</th>
                        </tr> 
                    </thead>
                    <tbody>
                        {messageNodes}
                    </tbody>
                </table> 
            </div>
        )
    }
});

module.exports = MessagesComponent;
