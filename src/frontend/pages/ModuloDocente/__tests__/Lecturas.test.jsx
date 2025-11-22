import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithRouter } from "../../../tests/test-utils.jsx";
import LecturasDocente from "../Lecturas.jsx";

import { listMyReadings, uploadReading } from "../../../services/readings.js";
jest.mock("../../../services/readings.js", () => ({
  listMyReadings: jest.fn(),
  uploadReading: jest.fn(),
}));

// Evita que Jest cargue módulos que usan import.meta.env
jest.mock("../../../services/assignments.js", () => ({
  assignReading: jest.fn(),
}));

describe("LecturasDocente", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
    // Que al inicio no haya lecturas
    listMyReadings.mockResolvedValue([]);
  });

  test("valida intento de subir sin archivo", async () => {
    renderWithRouter(<LecturasDocente />, {
      route: "/docente/lecturas",
      routes: [{ path: "/docente/lecturas", element: <LecturasDocente /> }],
    });

    // Espera a que termine el useEffect inicial
    await screen.findByRole("heading", { name: /subir nueva lectura/i });

    // Click en "Subir" sin haber elegido archivo
    await user.click(screen.getByRole("button", { name: /subir/i }));

    // 1) No debe llamar a la API
    await waitFor(() => expect(uploadReading).not.toHaveBeenCalled());

    // 2) La vista sigue igual (mensaje de lista vacía sigue visible)
    expect(screen.getByText(/no tienes lecturas registradas todavía/i)).toBeInTheDocument();
  });
});
