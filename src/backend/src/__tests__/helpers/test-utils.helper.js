
export function fakeReqRes(body = {}, extra = {}) {
  const req = { body, ...extra };
  const res = {
    statusCode: 200,
    data: undefined,
    status(code) { this.statusCode = code; return this; },
    json(payload) { this.data = payload; return this; },
  };
  const next = jest.fn();
  return { req, res, next };
}

// Smoke test para que Jest no marque el archivo como suite vacía
describe('test-utils.helper smoke', () => {
  test('carga helpers', () => expect(true).toBe(true));
});
