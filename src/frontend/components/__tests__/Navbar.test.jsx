jest.mock("../../context/AuthContext", () => ({
  useAuth: () => ({
    user: { email: "doc@x.com", rol: "docente" },
    getUser: () => ({ email: "doc@x.com", rol: "docente" }),
    getUserRole: () => "docente",
    clearToken: jest.fn(),
    logoutClient: jest.fn()
  })
}));

jest.mock("../context/AuthContext", () => require("~tests/mocks/auth-context.mock.js"));

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Navbar from "../Navbar.jsx";

// Mock de servicios usados por Navbar
jest.mock("../../services/auth.js", () => ({
  getUser: jest.fn(),
  getUserRole: jest.fn(),
  logoutClient: jest.fn(),
  login: jest.fn(),
  me: jest.fn()
}));
import { getUser, getUserRole, logoutClient } from "../../services/auth.js";

// Mock de useNavigate (único en ESTE archivo)
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

// Helper minimal: solo envolver con MemoryRouter
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
