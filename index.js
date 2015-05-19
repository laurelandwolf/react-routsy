var React = require('react');
var _ = require('lodash');
var pathToRegexp = require('path-to-regexp');

var DOM = React.DOM;
var createClass = React.createClass;
var PropTypes = React.PropTypes;
var Children = React.Children;
var cloneElement = React.cloneElement;

var each = _.each;
var merge = _.merge;
var pluck = _.pluck;
var zipObject = _.zipObject;
var tail = _.tail;
var clone = _.clone;

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

  each(SmallRouter.listeners, function (fn) {

    fn();
  });
});

function onHashChange (fn) {

  SmallRouter.listeners.push(fn);
}

SmallRouter.Route = createClass({

  propTypes: {
    path: PropTypes.string.isRequired,
    paramsAs: PropTypes.object // TODO: rename to paramsAsProps
  },

  getDefaultProps: function () {

    return {
      paramsAs: {}
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

    var keys = pluck(tail(parsedPath), 'name');
    var values = tail(this.parseHash().match(pathRegex));

    return zipObject(keys, values);
  },

  render: function () {

    var element = null;
    var self = this;

    if (this.shouldRender()) {

      var params = this.parseParams();

      // TODO: only add props to elements, not text children!!!

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

        Object.keys(self.props.paramsAs).forEach(function (key) {

          var mapToKey = self.props.paramsAs[key]
          paramsAsProps[mapToKey] = params[key];
        });

        var props = merge(clone(self.props), {
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
