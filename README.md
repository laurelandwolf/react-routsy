# react-routsy
Tiny React component for routing on individual pages

## Install

```
npm install react-router --save
```

## Usage

```html
import React, {Component, render} from 'react';
import {Route, navigateTo} from 'react-routsy';

class CustomComponent extends Component {

	render () {
		
		return (
			<div>
				<Route path='/do-this'>
					<div>This gets rendered only when the path matches</div>
				</Route>
				<Route path='/users/:id'>
					<p>
						This is renedered with id available on {this.props.router.params.id}.

						This is also available on child component props.
					</p>
				</Route>
				<Route path='/'>
					This gets rendered when the hash is #/ or #
				</Route>
			</div>
		);
	}
}

render(<CustomComponent />, document.body);
```

## Run Tests

```
npm install
npm test
```
