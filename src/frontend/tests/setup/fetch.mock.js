const okJson = (data) => ({
  ok: true,
  status: 200,
  json: async () => data
});
const fail = (status = 500, message = "Error") => ({
  ok: false,
  status,
  json: async () => ({ message })
});

let fetchSpy;

export function mockFetchOk(data = {}) {
  fetchSpy?.mockRestore();
  fetchSpy = jest.spyOn(global, "fetch").mockResolvedValue(okJson(data));
  return fetchSpy;
}

export function mockFetchFail(status = 500, message = "Error") {
  fetchSpy?.mockRestore();
  fetchSpy = jest.spyOn(global, "fetch").mockResolvedValue(fail(status, message));
  return fetchSpy;
}

export function restoreFetch() {
  fetchSpy?.mockRestore();
}
