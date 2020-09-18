import { Publisher, Subjects, TicketUpdatedEvent } from '@ttickets/common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
}
