const React = require("react");

const make = (name) =>
  React.forwardRef((props, ref) =>
    React.createElement(
      "div",
      { "data-mock": `rb-${name}`, ref, ...props },
      props.children
    )
  );

// Si en tu código usas subcomponentes, los cuelgo aquí:
const Nav = make("Nav");
Nav.Item = make("Nav.Item");
Nav.Link = make("Nav.Link");

const NavDropdown = make("NavDropdown");
NavDropdown.Item = make("NavDropdown.Item");

module.exports = {
  __esModule: true,
  Navbar: make("Navbar"),
  Nav,
  Container: make("Container"),
  Button: make("Button"),
  NavDropdown
};
