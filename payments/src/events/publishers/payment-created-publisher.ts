import { Publisher, Subjects, PaymentCreatedEvent } from '@ttickets/common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
}
