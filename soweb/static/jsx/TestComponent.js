/*** @jsx React.DOM */

var TestComponent = React.createClass({ 
    render: function() { 
        return (
            <h2> React is up and running! </h2>
        );
    }
});

React.render(
    <TestComponent/>,
    document.getElementById("container")
);
