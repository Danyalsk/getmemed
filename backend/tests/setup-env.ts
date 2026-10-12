// env.ts validates on import, so tests provide the required values up front.
process.env.NODE_ENV = "test";
process.env.MONGODB_URI = "mongodb://127.0.0.1:27017/unused";
process.env.JWT_SECRET = "test-secret-that-is-at-least-32-characters";
delete process.env.REDIS_URL;
