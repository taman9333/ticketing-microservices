import mongoose from 'mongoose';
import { OrderCancelledListener } from '../order-cancelled-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Ticket } from '../../../models/ticket';
import { OrderCancelledEvent } from '@ttickets/common';
import { Message } from 'node-nats-streaming';

const setup = async () => {
  const listener = new OrderCancelledListener(natsWrapper.client);

  const ticket = Ticket.build({
    title: 'concert',
    price: 20,
    userId: 'abcd123'
  });

  await ticket.save();

  // to mimic the logic of creating order
  ticket.set({
    orderId: mongoose.Types.ObjectId().toHexString()
  });
  await ticket.save();

  const data: OrderCancelledEvent['data'] = {
    id: ticket.orderId as string,
    version: ticket.version,
    ticket: {
      id: ticket.id
    }
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  };

  return { listener, data, msg };
};

it('removes orderId of the ticket', async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(data.ticket.id);

  expect(updatedTicket!.orderId).not.toBeDefined;
  expect(updatedTicket!.version).toEqual(data.version + 1);
});

it('acks the message', async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});

it('publishes the ticket updated event', async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled();

  const ticketCancelledData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  );

  expect(ticketCancelledData.orderId).not.toBeDefined();
  expect(ticketCancelledData.version).toEqual(data.version + 1);
});
