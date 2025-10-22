jest.mock("bcryptjs", () => ({
  compare: jest.fn().mockResolvedValue(true),
  hash: jest.fn().mockResolvedValue("hashed"),
}));

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(() => "FAKE.JWT.TOKEN"),
}));

process.env.JWT_SECRET = "testsecret";
process.env.JWT_EXPIRES_IN = "1d";
