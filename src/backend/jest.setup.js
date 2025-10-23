// Ambiente para test
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'testsecret';
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

// Evita llantos si algún módulo valida estas envs
process.env.SUPABASE_URL = process.env.SUPABASE_URL || 'https://example.supabase.co';
process.env.SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE || 'service_role_fake';
process.env.SUPABASE_BUCKET_TAREAS = process.env.SUPABASE_BUCKET_TAREAS || 'tareas';

// Mocks globales y consistentes
jest.mock('bcryptjs', () => ({
  compare: jest.fn().mockResolvedValue(true),
  hash: jest.fn().mockResolvedValue('hashed'),
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'FAKE.JWT.TOKEN'),
  verify: jest.fn(() => ({ id: 'u1' })), // por si algún middleware lo usa
}));

// Mock global de Supabase para que no valide envs ni haga IO
jest.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    storage: {
      from: () => ({
        upload: jest.fn().mockResolvedValue({ data: { path: 'mock/path.pdf' }, error: null }),
        getPublicUrl: jest.fn(() => ({ data: { publicUrl: 'https://fake.cdn/mock/path.pdf' } })),
        remove: jest.fn().mockResolvedValue({ data: {}, error: null }),
      }),
    },
    auth: { admin: { createUser: jest.fn() } },
  }),
}));

// Limpia entre tests para que no hereden mocks "pegados"
afterEach(() => {
  jest.clearAllMocks();
});
