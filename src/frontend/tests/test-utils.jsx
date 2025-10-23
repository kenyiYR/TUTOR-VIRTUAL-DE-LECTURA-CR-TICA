import { MemoryRouter, Routes, Route } from "react-router-dom";
import { render } from "@testing-library/react";

export function renderWithRouter(ui, { route = "/", routes = [{ path: "/", element: ui }] } = {}) {
  window.history.pushState({}, "", route);
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        {routes.map(r => <Route key={r.path} path={r.path} element={r.element} />)}
      </Routes>
    </MemoryRouter>
  );
}
