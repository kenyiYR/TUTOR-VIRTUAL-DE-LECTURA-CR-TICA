import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithRouter } from "~tests/test-utils.jsx";
import Login from "../Login.jsx";

jest.mock("../../../services/auth.js", () => ({
  login: jest.fn(),
  me: jest.fn(),
  getUser: jest.fn(),
  getUserRole: jest.fn(),
  logoutClient: jest.fn()
}));
import { login, me, getUser, getUserRole } from "../../../services/auth.js";

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

const getInput = (labelRe) =>
  screen.queryByLabelText(labelRe) ?? screen.getByPlaceholderText(labelRe);

const fillForm = async (email = "a@b.com", pass = "123456") => {
  const emailInput = getInput(/email|correo/i);
  const passInput  = getInput(/contraseña|password/i);
  await userEvent.clear(emailInput);
  await userEvent.type(emailInput, email);
  await userEvent.clear(passInput);
  await userEvent.type(passInput, pass);
};

describe("Login", () => {
  beforeEach(() => jest.clearAllMocks());

  test("login exitoso navega a otra ruta", async () => {
    login.mockResolvedValue({ ok: true, token: "tkn" });
    me.mockResolvedValue({ email: "a@b.com", rol: "docente" });
    getUser.mockReturnValue({ email: "a@b.com", rol: "docente" });
    getUserRole.mockReturnValue("docente");

    renderWithRouter(<Login />, {
      route: "/login",
      routes: [
        { path: "/login", element: <Login /> },
        { path: "/perfil", element: <div>Perfil</div> }
      ]
    });

    await fillForm();
    const submitBtn = screen.getByRole("button", { name: /entrar|iniciar sesión|login/i });
    await userEvent.click(submitBtn);

    await waitFor(() => expect(login).toHaveBeenCalledTimes(1));
    expect(mockNavigate).toHaveBeenCalled();
  });

  test("login con error muestra mensaje", async () => {

    login.mockRejectedValue({
      response: { data: { message: "Credenciales inválidas" } },
      message: "Credenciales inválidas"
    });

    renderWithRouter(<Login />, {
      route: "/login",
      routes: [{ path: "/login", element: <Login /> }]
    });

    await fillForm("a@b.com", "wrongpass");
    const submitBtn = screen.getByRole("button", { name: /entrar|iniciar sesión|login/i });
    await userEvent.click(submitBtn);

    await waitFor(() => expect(login).toHaveBeenCalledTimes(1));

 
    expect(await screen.findByText(/inválid|incorrect|error|credencial/i)).toBeInTheDocument();

    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
