// Mock del AuthContext: usa el MISMO alias en todos lados
jest.mock("@/context/AuthContext.jsx", () => ({
  useAuth: () => ({
    user: null,
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
  }),
}));

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

// ⬇️ IMPORTA el componente según su export real (ver sección 2)
import Navbar from "../Navbar.jsx"; // si tienes export default
// import { Navbar as NavbarComponent } from "../Navbar.jsx"; // si es export nombrado

// Servicios usados por Navbar, por si los tocas
jest.mock("../../services/auth.js", () => ({
  getUser: jest.fn(),
  getUserRole: jest.fn(),
  logoutClient: jest.fn(),
  login: jest.fn(),
  me: jest.fn(),
}));
import { getUser, getUserRole, logoutClient } from "../../services/auth.js";

// Mock de useNavigate SOLO en este archivo
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

// Helper mínimo
function renderWithRouter(ui, initial = "/") {
  return render(<MemoryRouter initialEntries={[initial]}>{ui}</MemoryRouter>);
}

describe("Navbar", () => {
  beforeEach(() => jest.clearAllMocks());

  test("muestra Login cuando no hay usuario", () => {
    getUser.mockReturnValue(null);
    renderWithRouter(<Navbar />);
    expect(screen.getByText(/login/i)).toBeInTheDocument();
  });

  test("muestra rol y cierra sesión", async () => {
    getUser.mockReturnValue({ email: "a@b.com", rol: "docente" });
    getUserRole.mockReturnValue("docente");

    renderWithRouter(<Navbar />);

    await userEvent.click(
      screen.getByRole("button", { name: /cerrar sesión/i })
    );

    expect(logoutClient).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });
});
