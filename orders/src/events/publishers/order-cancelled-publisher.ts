import { Publisher, OrderCancelledEvent, Subjects } from '@ttickets/common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
}
