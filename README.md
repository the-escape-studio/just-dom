<div align="center">
  <a href="https://just-dom.vercel.app">
    <img src="https://just-dom.vercel.app/logo.svg" alt="logo" width="100" />
  </a>

  # Just DOM

  A lightweight JavaScript library to simplify DOM manipulation.

  [![npm version](https://img.shields.io/npm/v/just-dom.svg)](https://www.npmjs.com/package/just-dom)
  [![downloads](https://img.shields.io/npm/dt/just-dom.svg)](https://www.npmjs.com/package/just-dom)
  [![license](https://img.shields.io/npm/l/just-dom.svg)](https://github.com/yourusername/just-dom/blob/main/LICENSE)

  [Website](https://just-dom.vercel.app) | Created by The Escape Studio ([@codingspook](https://github.com/codingspook) & [@ergo04](https://github.com/ergo04))
</div>

## Features

- Simplified DOM element creation
- Handling attributes, styles, and events in a single interface
- Support for all standard HTML tags
- Utility functions for CSS class manipulation, routing, and fetch API
- No external dependencies
- Small size (< 20KB)
- Full TypeScript support

## Installation

```bash
npm install just-dom
```

## Usage

### Import

Easy DOM supports different import methods for maximum flexibility:

```javascript
// Import the main DOM object (recommended)
import DOM from 'just-dom';

// Import individual utility functions
import { classNames, fetcher, getElement } from 'just-dom';

// Mixed import
import DOM, { classNames, fetcher } from 'just-dom';
```

### Creating DOM elements

```javascript
import DOM from 'just-dom';

// Using tag helpers
const header = DOM.h1({ className: 'title' }, ['Welcome to Easy DOM']);

const btn = DOM.button(
  { 
    className: 'btn primary',
    onclick: () => alert('Clicked!')
  },
  ['Click here']
);

// Nesting elements
const container = DOM.div({ className: 'container' }, [header, btn]);
```

### Utility functions

```javascript
import { classNames, fetcher, getElement, createElFromHTMLString } from 'just-dom';

// Creating conditional classes
const btnClass = classNames({
  'btn': true,
  'btn-primary': true,
  'disabled': false
}); // Result: "btn btn-primary"

// Making HTTP requests
const data = await fetcher('https://api.example.com/data', {
  method: 'POST',
  body: JSON.stringify({ key: 'value' })
});

// Selecting existing DOM elements
const element = getElement('#my-id');

// Creating a reference to an element
const ref = createRef();
DOM.div({ ref }, 'Hello');

// Using the reference to manipulate the element
ref.current.style.color = 'red';

// Creating elements from HTML string
const fragment = createElFromHTMLString('<div>Hello</div><p>World</p>');
document.body.appendChild(fragment);
```

### Routing (requires vanilla-router)

```javascript
import { Outlet } from 'just-dom';

const routerOutlet = Outlet('app');
document.body.appendChild(routerOutlet);
```

## TypeScript Support

Easy DOM includes complete TypeScript type declarations. No additional packages are required.

```typescript
import DOM, { DOMAttributes } from 'just-dom';

// Properties have hints and type checking
const button = DOM.button({ 
  className: 'btn',
  disabled: false,
  onclick: (e: MouseEvent) => console.log('Clicked!', e)
}, ['Click me']);

// Defining custom properties
interface MyButtonProps extends DOMAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
}

function createButton(props: MyButtonProps, children: string[]) {
  return DOM.button({
    ...props,
    className: `btn btn-${props.variant || 'primary'}`
  }, children);
}
```

## Compatibility

- All modern browsers (Chrome, Firefox, Safari, Edge)
- IE11 with appropriate polyfills

## Development

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test
```

## License

MIT
