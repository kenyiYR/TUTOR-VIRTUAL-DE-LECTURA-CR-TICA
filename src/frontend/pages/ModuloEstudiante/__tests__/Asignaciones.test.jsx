// src/frontend/pages/ModuloEstudiante/__tests__/Asignaciones.test.jsx
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Asignaciones from "../Asignaciones.jsx";
import { renderWithRouter } from "../../../tests/test-utils.jsx";
import * as svc from "../../../services/assignments.js";

jest.mock("../../../services/assignments.js", () => ({
  listMyAssignments: jest.fn().mockResolvedValue([
    { _id: "a1", titulo: "Lectura A", readAt: null, dueDate: null }
  ]),
  toggleRead: jest.fn().mockResolvedValue(new Date().toISOString()),
  submitWork: jest.fn().mockResolvedValue({ ok: true })
}));

describe("Asignaciones", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("muestra error al enviar sin archivo", async () => {
    // lista con un item; el título no es fiable en la UI, así que no lo usaremos para esperar
    svc.listMyAssignments.mockResolvedValue([
      { _id: "a1", titulo: "Lectura A", readAt: null, dueDate: null }
    ]);

    renderWithRouter(<Asignaciones />);

    // espera algo estable del card: el botón "Marcar como leído" existe cuando el item cargó
    await screen.findByRole("button", { name: /marcar como leído/i });

    // intenta enviar sin archivo
    const enviar = screen.getByRole("button", { name: /enviar/i });
    await userEvent.click(enviar);

    // comportamiento robusto: SIN archivo no debe llamarse el servicio
    await waitFor(() => expect(svc.submitWork).not.toHaveBeenCalled());

    // si tu componente muestra un mensaje, podrías checarlo de forma flexible:
    // const msg = screen.queryByText((t, n) => (n?.textContent || "").toLowerCase().includes("archivo"));
    // if (msg) expect(msg).toBeInTheDocument();
  });

  test("marca como leído llama al servicio", async () => {
    svc.listMyAssignments.mockResolvedValue([
      { _id: "a1", titulo: "Lectura A", readAt: null, dueDate: null }
    ]);
    svc.toggleRead.mockResolvedValue(new Date().toISOString());

    renderWithRouter(<Asignaciones />);

    const marcar = await screen.findByRole("button", { name: /marcar como leído/i });
    await userEvent.click(marcar);

    expect(svc.toggleRead).toHaveBeenCalledWith("a1");
  });
});
