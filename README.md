# react-routsy
Tiny React component for routing on individual pages

## Install

```
npm install react-router --save
```

## Usage

```js
import React, {Component, render} from 'react';
import {Route, navigateTo, Link} from 'react-routsy';

class CustomComponent extends Component {

  go () {

    navigateTo('/do-this');
  }
 
  handlerRender () {
    
  }

  render () {

    return (
      <div>
        <Route path='/do-this'>
          <div>This gets rendered only when the path matches</div>
        </Route>
        <Route path='/users/:id'>
          <p onClick={this.go.bind(this)}>
            This is renedered with id available on {this.props.router.params.id}.

            This is also available on child component props.
          </p>
        </Route>
        <Route path='/' willRender={this.handleRender.bind(this)}>
          This gets rendered when the hash is #/ or #
          <Link path='/do-this' activeClassName='this-is-active'>
          	Go Here
          </Link>
        </Route>
      </div>
    );
  }
}

render(<CustomComponent />, document.body);
```

## Route Props

### path

type: *String*

The path that should trigger the rendering of the Route component. All routes are hash-based, so `/` as a path is equal to `#/` in the hash.

### paramsAsProps

type: *Object*

Takes and object and maps keys and objects in the route params to specified keys, and then passes them in the children component's props. This is useful in decoupling components from the router.

```js

let paramsMap = {
  id: 'somePropName'
};

<Route path="/users/:id" paramsAsProps={paramsMap}>
  <CustomComponent />
</Route>
```

`this.props.somePropName` is now available when defining `<CustomComponent />`.

### willRender

type: *Function*

Takes a callback that gets triggered when path matches route. This is useful if you need to redirect, etc.

## Link Props

### path

type: *String*

Path to navigate to.

### activeClassName

type: *String*

Class name to set when the link's path matches the current route path.

### activeStyle

type: *Object*

Inline style object to set on link when the link's path matches the current route path.

## Run Tests

```
npm install
npm test
```
