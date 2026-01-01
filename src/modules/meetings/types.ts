import { inferRouterOutputs } from '@trpc/server';

import { AppRouter } from '@/trpc/routers/_app';

export type MeetingGetOne = NonNullable<
  NonNullable<inferRouterOutputs<AppRouter>['meetings']>['getOne']
>;

export type MeetingGetMany = NonNullable<
  NonNullable<inferRouterOutputs<AppRouter>['meetings']>['getMany']
>['items'];

export enum MeetingStatus {
  Upcoming = 'upcoming',
  Active = 'active',
  Completed = 'completed',
  Processing = 'processing',
  Cancelled = 'cancelled',
}

export type StreamTranscriptItem = {
  speaker_id: string;
  type: string;
  text: string;
  start_ts: number;
  stop_ts: number;
};
