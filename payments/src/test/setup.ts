import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { app } from '../app';
import request from 'supertest';

// first download of MongoDB binaries may take a time.
jasmine.DEFAULT_TIMEOUT_INTERVAL = 600000;

declare global {
  namespace NodeJS {
    interface Global {
      getCookie(id?: string): string[];
    }
  }
}

jest.mock('../nats-wrapper');
jest.mock('../stripe');

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
  jest.clearAllMocks();
  const collections = await mongoose.connection.collections;

  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

global.getCookie = (id?: string) => {
  const payload = {
    id: id || new mongoose.Types.ObjectId().toHexString(),
    email: 'test@test.com'
  };

  const token = jwt.sign(payload, process.env.JWT_KEY!);

  const session = { jwt: token };

  const sessionJson = JSON.stringify(session);

  const base64 = Buffer.from(sessionJson).toString('base64');

  return [`express:sess=${base64}`];
};
