var React = require('react');
var pathToRegexp = require('path-to-regexp');
var assign = require('object-assign');
var zipObject = require('lodash/array/zipObject');
var clone = require('lodash/lang/clone');
var pluck = require('lodash/collection/pluck');

var DOM = React.DOM;
var createClass = React.createClass;
var PropTypes = React.PropTypes;
var Children = React.Children;
var cloneElement = React.cloneElement;

var Routsy = {
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

    return path === Routsy.currentPath();
  }
};

// No need to remove this event listener. It needs
// to live as long as the app does
window.addEventListener('hashchange', function () {

  Routsy.listeners.forEach(function (fn) {

    fn();
  });
});

function onHashChange (fn) {

  Routsy.listeners.push(fn);
}

Routsy.Link = createClass({

  propTypes: {
    path: PropTypes.string.isRequired,
    activeClassName: PropTypes.string,
    activeStyle: PropTypes.object
  },

  getDefaultProps: function () {

    return {
      activeClassName: 'active',
      activeStyle: {}
    };
  },

  getInitialState: function () {

    return {
      active: false
    };
  },

  componentDidMount: function () {

    this.setActiveClassName();
    onHashChange(this.hashChanged);
  },

  hashChanged: function () {

    this.setActiveClassName();
  },

  setActiveClassName: function () {

    this.setState({
      active: Routsy.currentPathMatches(this.props.path)
    });
  },

  gotoPath: function (e) {

    e.preventDefault();
    Routsy.navigateTo(this.props.path);
    this.setActiveClassName();
  },

  render: function () {

    let style = assign(
      {
        cursor: 'pointer'
      },
      this.props.style,
      this.state.active ? this.props.activeStyle : {}
    )

    return DOM.a({
      style: style,
      onClick: this.gotoPath,
      className: this.state.active ? this.props.activeClassName : null
    }, this.props.children);
  }
});

Routsy.Route = createClass({

  propTypes: {
    path: PropTypes.string.isRequired,
    paramsAsProps: PropTypes.object,
    willRender: PropTypes.func
  },

  getDefaultProps: function () {

    return {
      paramsAsProps: {},
      willRender: function () {}
    }
  },

  getInitialState: function () {

    return {
      path: this.parseHash()
    }
  },

  componentDidMount: function () {

    Routsy.routes.push({
      path: this.props.path
    });

    onHashChange(this.hashChange);
  },

  hashChange: function () {

    var path = this.parseHash();
    this.setState({path: path});
  },

  parseHash: function () {

    return Routsy.currentPath();
  },

  shouldRender: function () {

    return pathToRegexp(this.props.path).exec(this.parseHash());
  },

  parseParams: function () {

    var pathRegex = pathToRegexp(this.props.path);
    var parsedPath = pathToRegexp.parse(this.props.path);

    var keys = pluck(parsedPath.slice(1), 'name');
    var values = this.parseHash().match(pathRegex).slice(1);

    return zipObject(keys, values);
  },

  render: function () {

    var element = null;
    var self = this;


    if (this.shouldRender()) {

      var params = this.parseParams();

      this.props.willRender(params);

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

module.exports = Routsy;
