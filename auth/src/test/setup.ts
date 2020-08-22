import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { app } from '../app';
import request from 'supertest';

// first download of MongoDB binaries may take a time.
jasmine.DEFAULT_TIMEOUT_INTERVAL = 600000;

declare global {
  namespace NodeJS {
    interface Global {
      getCookie(): Promise<string[]>;
    }
  }
}

let mongo: any;
beforeAll(async () => {
  process.env.JWT_KEY = 'test';

  mongo = new MongoMemoryServer();
  const mongoUri = await mongo.getUri();

  await mongoose.connect(
    mongoUri,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true
    },
    (err) => {
      if (err) console.error(err);
    }
  );
});

beforeEach(async () => {
  const collections = await mongoose.connection.db.collections();

  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

global.getCookie = async () => {
  const credentials = { email: 'test@test.com', password: 'password' };

  const response = await request(app)
    .post('/api/users/signup')
    .send(credentials)
    .expect(201);

  const cookie = response.get('Set-Cookie');

  return cookie;
};
