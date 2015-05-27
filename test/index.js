import {assert} from 'chai';
import React from 'react/addons';

import {
  Route,
  navigateTo,
  currentPath,
  currentPathMatches,
  Link
} from '../';

let TestUtils = React.addons.TestUtils;

describe('Router', () => {

  let Html;

  beforeEach(() => {

    Html =
      <div>
        <Route path='/'>
          <p>Route for root path</p>
        </Route>
        <Route path='/path1'>
          <p>Path 1</p>
        </Route>
        <Route path='/path2'>
          Path 2
        </Route>
      </div>;
  });

  it('gets and sets the current path', () => {

    navigateTo('/test');

    assert.equal(currentPath(), '/test', 'current path');
  });

  it('matches paths', () => {

    navigateTo('/test');

    assert.ok(currentPathMatches('/test'), 'matched path');
  });

  it('Renders on root path "/"', () => {

    navigateTo('/')

    let component = TestUtils.renderIntoDocument(Html);
    let textContent = component.getDOMNode().textContent;

    assert.equal(textContent, 'Route for root path', 'rendered on root path');
  });

  it('renders route tag based on path', () => {

    navigateTo('/path1')

    let component = TestUtils.renderIntoDocument(Html);
    let textContent = component.getDOMNode().textContent;

    assert.equal(textContent, 'Path 1', 'renders only element for path');
  });

  it('handles text only in route component', () => {

    navigateTo('/path2');

    let component = TestUtils.renderIntoDocument(Html);
    let textContent = component.getDOMNode().textContent;

    assert.equal(textContent, 'Path 2', 'renders with text only');
  });

  describe('passing router context to children', () => {

    let props;
    let PropsHtml;

    beforeEach(() => {

      let CustomComponent = React.createClass({

        propsTypes: {
          customId: React.PropTypes.any
        },

        render () {

          props = this.props;
          return <div>Custom Component</div>;
        }
      });

      PropsHtml =
        <div>
          <Route path='/custom-component'>
            <CustomComponent />
          </Route>
          <Route path='/custom-component/:id'>
            <CustomComponent />
          </Route>
          <Route path='/custom-params/:id' paramsAsProps={{id: 'customId'}}>
            <CustomComponent />
          </Route>
        </div>;
    });

    // TODO: figure out how to use this in the
    // context instead of the props
    it('adds router to props in child components', () => {

      navigateTo('/custom-component');
      let component = TestUtils.renderIntoDocument(PropsHtml);

      assert.isObject(props.router, 'router on props');
    });

    it('parses the route params', () => {

      navigateTo('/custom-component/123');
      let component = TestUtils.renderIntoDocument(PropsHtml);

      assert.equal(props.router.params.id, 123, 'get params in route');
    });

    it('passes params as custom named keys in props', () => {

      navigateTo('/custom-params/123');
      let component = TestUtils.renderIntoDocument(PropsHtml);

      assert.equal(props.customId, 123, 'custom param');
    });
  });

  describe('callback functions', () => {

    it('triggers a callback on render', () => {

      let calledHandler = false;

      class CustomComponent extends React.Component {

        handleWillRender (_params_) {

          calledHandler = true;
        }

        render () {

          return (
            <Route
              path='/'
              willRender={this.handleWillRender.bind(this)} />
          );
        }
      }

      navigateTo('/');
      let component = TestUtils.renderIntoDocument(<CustomComponent />);

      assert.ok(calledHandler, 'called handler on render');
    });

    it('passes params to render callback', () => {

      let params = {};

      class CustomComponent extends React.Component {

        handleWillRender (_params_) {

          params = _params_;
        }

        render () {

          return (
            <Route
              path='/route/:id'
              willRender={this.handleWillRender.bind(this)} />
          );
        }
      }

      navigateTo('/route/123');
      let component = TestUtils.renderIntoDocument(<CustomComponent />);

      assert.deepEqual(params, {id: '123'}, 'received params');
    });
  });
});

describe('Link', () => {

  it('creates an anchor node with styles', () => {

    let component = TestUtils.renderIntoDocument(<Link path='/' />);
    let node = component.getDOMNode();

    assert.equal(node.tagName, 'A', 'anchor tag');
    assert.equal(node.style.cursor, 'pointer', 'pointer cursor on hover');
  });

  it('renders children', () => {

    let component = TestUtils.renderIntoDocument(<Link path='/'>Hello</Link>);
    let node = component.getDOMNode();

    assert.equal(node.innerHTML, 'Hello', 'innerHTML');
  });

  it('clicking navigates to the path', () => {

    navigateTo('/');
    let component = TestUtils.renderIntoDocument(<Link path='/path1' />);
    TestUtils.Simulate.click(component.getDOMNode());

    assert.equal(currentPath(), '/path1', 'set path');
  });

  it('sets the active class to the default', () => {

    navigateTo('/');
    let component = TestUtils.renderIntoDocument(<Link path='/path1' />);
    TestUtils.Simulate.click(component.getDOMNode());

    assert.equal(component.props.activeClassName, 'active', 'default class name');
    assert.ok(component.getDOMNode().classList.contains('active'), 'active class set');
  });

  it('sets active class when component renders', () => {

    navigateTo('/path1');
    let component = TestUtils.renderIntoDocument(<Link path='/path1' />);

    assert.ok(component.getDOMNode().classList.contains('active'), 'active class set');
  });

  it('sets the active class to custom class', () => {

    navigateTo('/');
    let component = TestUtils.renderIntoDocument(<Link path='/path1' activeClassName="customActive" />);
    TestUtils.Simulate.click(component.getDOMNode());

    assert.ok(component.getDOMNode().classList.contains('customActive'), 'active class set');
  });

  it('removes the active class name when hash changes', (done) => {

    navigateTo('/');
    let component = TestUtils.renderIntoDocument(<Link path='/path1' activeClassName="customActive" />);
    TestUtils.Simulate.click(component.getDOMNode());
    navigateTo('/');

    setTimeout(() => {

      assert.notOk(component.getDOMNode().classList.contains('customActive'), 'active class set');
      done();
    }, 0);
  });

  it('sets custom active style', () => {

    navigateTo('/');
    let component = TestUtils.renderIntoDocument(<Link path='/path1' activeStyle={{color: 'red'}} />);
    TestUtils.Simulate.click(component.getDOMNode());

    assert.equal(component.getDOMNode().style.color, 'red', 'active style set');
  });

  it('removes active style when hash changes', (done) => {

    navigateTo('/');
    let component = TestUtils.renderIntoDocument(<Link path='/path1' activeStyle={{color: 'red'}} />);
    TestUtils.Simulate.click(component.getDOMNode());
    navigateTo('/');

    setTimeout(() => {
      assert.equal(component.getDOMNode().style.color, '', 'active style set');
      done();
    }, 0);
  });

  it('pass through style prop', () => {

    let component = TestUtils.renderIntoDocument(<Link path='/' style={{color: 'red'}}/>);

    assert.equal(component.getDOMNode().style.color, 'red', 'active style set');
  });
});
