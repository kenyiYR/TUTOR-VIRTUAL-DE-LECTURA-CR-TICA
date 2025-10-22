
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