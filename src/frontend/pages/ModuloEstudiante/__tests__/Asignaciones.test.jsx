// src/frontend/pages/ModuloEstudiante/__tests__/Asignaciones.test.jsx
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Asignaciones from "../Asignaciones.jsx";
import { renderWithRouter } from "../../../tests/test-utils.jsx";
import * as svc from "../../../services/assignments.js";

// Mock del servicio de asignaciones
jest.mock("../../../services/assignments.js", () => ({
  listMyAssignments: jest.fn(),
  toggleRead: jest.fn(),
  submitWork: jest.fn(),
  answerQuestion: jest.fn()
}));

const mockAssignments = [
  {
    _id: "a1",
    reading: {
      titulo: "Lectura A",
      descripcion: "Descripción de prueba"
    },
    readAt: null,
    questions: {
      status: "pending" // así se muestra "IA: generando preguntas..."
    },
    submission: null,
    feedback: null
  }
];

describe("Asignaciones (módulo estudiante)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    svc.listMyAssignments.mockResolvedValue(mockAssignments);
  });

  test("muestra lecturas con el botón de detalle", async () => {
    renderWithRouter(<Asignaciones />);

    // Título principal de la página
    await screen.findByText(/lecturas asignadas/i);

    // Botón principal de la tarjeta
    const detalle = await screen.findByRole("button", {
      name: /ver detalle de la asignación/i
    });

    expect(detalle).toBeInTheDocument();
  });

  test("muestra el estado de la IA en la tarjeta", async () => {
    renderWithRouter(<Asignaciones />);

    // Para status 'pending' el texto es "IA: generando preguntas..."
    const iaText = await screen.findByText(/ia:\s*generando preguntas/i);

    expect(iaText).toBeInTheDocument();
  });
});
