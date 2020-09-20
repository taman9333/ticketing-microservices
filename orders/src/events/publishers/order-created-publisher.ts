import { Publisher, OrderCreatedEvent, Subjects } from '@ttickets/common';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
}
