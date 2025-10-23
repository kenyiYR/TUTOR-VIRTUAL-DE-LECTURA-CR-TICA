import { render, screen } from "@testing-library/react";
import RoleBlockOverlay from "../RoleBlockOverlay.jsx";

test("muestra el rol requerido y el actual", () => {
  render(<RoleBlockOverlay required="docente" actual="estudiante" />);

  expect(screen.getByText(/acceso bloqueado/i)).toBeInTheDocument();
  expect(screen.getByText(/estás autenticado como/i)).toBeInTheDocument();
  expect(screen.getByText(/estudiante/i)).toBeInTheDocument();

  const matches = screen.getAllByText((_, node) =>
    node?.textContent?.toLowerCase().includes("requiere docente")
  );
  expect(matches.length).toBeGreaterThan(0);
});

