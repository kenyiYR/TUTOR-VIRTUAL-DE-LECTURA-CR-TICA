// Mock minimal pero completo para los subcomponentes que usa tu Navbar.
const React = require("react");

function mk(name) {
  const Comp = React.forwardRef(({ as: As = "div", children, ...props }, ref) => {
    // Si piden "as={Link}", respetamos ese componente para que no explote el Link
    if (As && As !== "div" && typeof As === "function") {
      return React.createElement(As, { ref, ...props }, children);
    }
    return React.createElement("div", { ref, "data-mock": name, ...props }, children);
  });
  Comp.displayName = name;
  return Comp;
}

const Navbar = mk("Navbar");
Navbar.Brand = mk("Navbar.Brand");
Navbar.Toggle = mk("Navbar.Toggle");
Navbar.Collapse = mk("Navbar.Collapse");

const Nav = mk("Nav");
Nav.Link = mk("Nav.Link");

const Container = mk("Container");
const Button = mk("Button");

module.exports = { __esModule: true, Navbar, Nav, Container, Button };
