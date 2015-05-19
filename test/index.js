import {assert} from 'chai';
import React from 'react/addons';

import {
  Route,
  navigateTo,
  currentPath,
  currentPathMatches
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
});
