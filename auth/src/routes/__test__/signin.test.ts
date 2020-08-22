import request from 'supertest';
import { app } from '../../app';
import { User } from '../../models/user';

it('fails if email does not exist', async () => {
  return request(app)
    .post('/api/users/signin')
    .send({
      email: 'test@test.com',
      password: 'password'
    })
    .expect(400);
});

it('fails if incorrect password is supplied', async () => {
  const user = await User.create({
    email: 'test@test.com',
    password: 'password'
  });
  return request(app)
    .post('/api/users/signin')
    .send({
      email: 'test@test.com',
      password: 'incorrect'
    })
    .expect(400);
});

it('responds with a cookie when given valid credentials', async () => {
  const credentials = { email: 'test@test.com', password: 'password' };
  const user = await User.create(credentials);
  const response = await request(app)
    .post('/api/users/signin')
    .send(credentials)
    .expect(200);

  expect(response.get('Set-Cookie')).toBeDefined();
});
