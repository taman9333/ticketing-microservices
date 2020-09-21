import { ExpirationCompleteEvent, Publisher, Subjects } from '@ttickets/common';

export class ExpirationCompletePublisher extends Publisher<
  ExpirationCompleteEvent
> {
  readonly subject = Subjects.ExpirationComplete;
}
