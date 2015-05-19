var React = require('react');
var pathToRegexp = require('path-to-regexp');
var assign = require('object-assign');
var zipObject = require('zip-object');
var clone = require('lodash.clone');
var pluck = require('pluck');

var DOM = React.DOM;
var createClass = React.createClass;
var PropTypes = React.PropTypes;
var Children = React.Children;
var cloneElement = React.cloneElement;

var SmallRouter = {
  // Private, singleton store for all routes
  // TODO: add scope to props of route element?
  routes: [],
  listeners: [],

  navigateTo: function (path) {

    window.location.hash = path;
  },

  currentPath: function () {

    var rawPath = window.location.hash.split('#')[1];

    if (rawPath === undefined) {
      rawPath = '';
    }

    return rawPath;
  },

  currentPathMatches: function (path) {

    return path === SmallRouter.currentPath();
  }
};

// No need to remove this event listener. It needs
// to live as long as the app does
window.addEventListener('hashchange', function () {

  SmallRouter.listeners.forEach(function (fn) {

    fn();
  });
});

function onHashChange (fn) {

  SmallRouter.listeners.push(fn);
}

SmallRouter.Route = createClass({

  propTypes: {
    path: PropTypes.string.isRequired,
    paramsAsProps: PropTypes.object
  },

  getDefaultProps: function () {

    return {
      paramsAsProps: {}
    }
  },

  getInitialState: function () {

    return {
      path: this.parseHash()
    }
  },

  componentDidMount: function () {

    SmallRouter.routes.push({
      path: this.props.path
    });

    onHashChange(this.hashChange);
  },

  hashChange: function () {

    var path = this.parseHash();
    this.setState({path});
  },

  parseHash: function () {

    return SmallRouter.currentPath();
  },

  shouldRender: function () {

    return pathToRegexp(this.props.path).exec(this.parseHash());
  },

  parseParams: function () {

    var pathRegex = pathToRegexp(this.props.path);
    var parsedPath = pathToRegexp.parse(this.props.path);

    var keys = pluck('name')(parsedPath.slice(1));
    var values = this.parseHash().match(pathRegex).slice(1);

    return zipObject(keys, values);
  },

  render: function () {

    var element = null;
    var self = this;

    if (this.shouldRender()) {

      var params = this.parseParams();

      // For now, cloning the element and adding the router
      // information to the props is the only way to get
      // information into the children.
      // Hopefully we can change this in the future.
      var children = Children.map(this.props.children, function (child) {

        if (typeof child === 'string') {
          return child;
        }

        // Map params from paramsAs
        var paramsAsProps = {};

        Object.keys(self.props.paramsAsProps)
        .forEach(function (key) {

            var mapToKey = self.props.paramsAsProps[key]
            paramsAsProps[mapToKey] = params[key];
          });

        var props = assign(clone(self.props), {
          router: {
            params: params
          }
        }, paramsAsProps);

        return cloneElement(child, props);
      });

      element = DOM.div(null, children);
    }

    return element;
  }
});

module.exports = SmallRouter;
