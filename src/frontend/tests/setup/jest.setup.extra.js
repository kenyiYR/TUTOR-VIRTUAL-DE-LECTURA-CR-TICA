import "@testing-library/jest-dom";
import { restoreFetch } from "./fetch.mock";


afterEach(() => {
  restoreFetch();
});

jest.mock('react-bootstrap', () => {
  const React = require('react');
  const make = (name) => React.forwardRef((props, ref) =>
    React.createElement('div', { 'data-mock': name, ref, ...props }, props.children)
  );
  return {
    __esModule: true,
    Navbar: make('Navbar'),
    Nav: make('Nav'),
    Container: make('Container'),
    Button: make('Button'),
    NavDropdown: make('NavDropdown'),
  };
});