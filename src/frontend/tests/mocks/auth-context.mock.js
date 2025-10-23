module.exports = {
  useAuth: () => ({
    user: { email: "doc@x.com", rol: "docente" },
    getUser: () => ({ email: "doc@x.com", rol: "docente" }),
    getUserRole: () => "docente",
    clearToken: jest.fn(),
    logoutClient: jest.fn(),
  }),
};
