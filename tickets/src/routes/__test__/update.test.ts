import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { Ticket } from '../../models/ticket';
import { natsWrapper } from '../../nats-wrapper';

it('returns a 404 if the provided id does not exist', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/tickets/${id}`)
    .set('Cookie', global.getCookie())
    .send({
      title: 'test put',
      price: 20
    })
    .expect(404);
});

it('returns a 401 if the user is not authenticated', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/tickets/${id}`)
    .send({
      title: 'test put',
      price: 20
    })
    .expect(401);
});

it('returns a 401 if the user does not own the ticket', async () => {
  const res = await request(app)
    .post(`/api/tickets`)
    .set('Cookie', global.getCookie())
    .send({
      title: 'test',
      price: 20
    });

  await request(app)
    .put(`/api/tickets/${res.body.id}`)
    .send({
      title: 'test put',
      price: 10
    })
    .expect(401);
});

it('returns a 400 if the user provides an invalid title or price', async () => {
  const cookie = global.getCookie();
  const res = await request(app)
    .post(`/api/tickets`)
    .set('Cookie', cookie)
    .send({
      title: 'test',
      price: 20
    });

  await request(app)
    .put(`/api/tickets/${res.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: '',
      price: 10
    })
    .expect(400);

  await request(app)
    .put(`/api/tickets/${res.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'hola',
      price: -10
    })
    .expect(400);
});

it('updates the ticket provided valid inputs', async () => {
  const cookie = global.getCookie();
  const res = await request(app)
    .post(`/api/tickets`)
    .set('Cookie', cookie)
    .send({
      title: 'test',
      price: 20
    });

  const updateRes = await request(app)
    .put(`/api/tickets/${res.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'new name',
      price: 10
    })
    .expect(200);

  const ticket = (await Ticket.findById(res.body.id)) as any;
  expect(updateRes.body.title).toEqual(ticket.title);
  expect(updateRes.body.price).toEqual(ticket.price);
});

it('publishes an event', async () => {
  const cookie = global.getCookie();
  const res = await request(app)
    .post(`/api/tickets`)
    .set('Cookie', cookie)
    .send({
      title: 'test',
      price: 20
    });

  const updateRes = await request(app)
    .put(`/api/tickets/${res.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'new name',
      price: 10
    })
    .expect(200);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
