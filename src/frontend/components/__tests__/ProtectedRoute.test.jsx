import { screen, within } from "@testing-library/react";
import { renderWithRouter } from "../../tests/test-utils.jsx";
import ProtectedRoute from "../ProtectedRoute.jsx";
import { getUser, getUserRole, me } from "../../services/auth.js";

jest.mock("../../services/auth.js", () => ({
  me: jest.fn(),
  getUser: jest.fn(),
  getUserRole: jest.fn()
}));

function PrivatePage() {
  return <div>Contenido privado</div>;
}
function LoginPage() {
  return <div>Login Page</div>;
}

describe("ProtectedRoute", () => {
  beforeEach(() => jest.clearAllMocks());

  test("sin sesión redirige a /login", async () => {
    getUser.mockReturnValue(null);
    me.mockResolvedValue(null);

    renderWithRouter(
      <ProtectedRoute role="docente">
        <PrivatePage />
      </ProtectedRoute>,
      {
        route: "/privado",
        routes: [
          {
            path: "/privado",
            element: (
              <ProtectedRoute role="docente">
                <PrivatePage />
              </ProtectedRoute>
            )
          },
          { path: "/login", element: <LoginPage /> }
        ]
      }
    );

    expect(await screen.findByText(/login page/i)).toBeInTheDocument();
  });

  test("con rol incorrecto muestra bloqueo", async () => {
  getUser.mockReturnValue({ email: "x@y.com", rol: "estudiante" });
  getUserRole.mockReturnValue("estudiante");
  me.mockResolvedValue({ email: "x@y.com", rol: "estudiante" });

  renderWithRouter(
    <ProtectedRoute role="docente">
      <div>Contenido privado</div>
    </ProtectedRoute>
  );

  // espera a que salga el overlay
  const heading = await screen.findByRole("heading", { name: /acceso bloqueado/i });

  // ubica la tarjeta (padre del h1 o por clase si la tienes)
  const card = heading.closest(".auth-card") || heading.parentElement;

  // valida textos sin pelearte con nodos hijos
  expect(card).toHaveTextContent(/estás autenticado como/i);
  expect(card).toHaveTextContent(/estudiante/i);
  // la frase está dividida entre nodos: usa regex y colapsa espacios
  expect(card).toHaveTextContent(/requiere\s+docente/i);
});

  test("rol correcto deja ver el contenido", async () => {
    getUser.mockReturnValue({ email: "p@q.com", rol: "docente" });
    getUserRole.mockReturnValue("docente");
    me.mockResolvedValue({ email: "p@q.com", rol: "docente" });

    renderWithRouter(
      <ProtectedRoute role="docente">
        <PrivatePage />
      </ProtectedRoute>
    );

    expect(await screen.findByText(/contenido privado/i)).toBeInTheDocument();
  });
});
