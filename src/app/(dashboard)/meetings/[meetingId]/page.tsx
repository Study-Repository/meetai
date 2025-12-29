import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import {
  MeetingIdViewError,
  MeetingIdViewLoading,
} from '@/modules/meetings/ui/views/meeting-id-view';
import { MeetingIdView } from '@/modules/meetings/ui/views/meeting-id-view';
import { getQueryClient, trpc } from '@/trpc/server';

interface Props {
  params: Promise<{ meetingId: string }>;
}
export default async function Page({ params }: Props) {
  const { meetingId } = await params;

  // NOTE: prefetch meetings data
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(
    trpc.meetings.getOne.queryOptions({ id: meetingId }),
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<MeetingIdViewLoading />}>
        <ErrorBoundary fallback={<MeetingIdViewError />}>
          <MeetingIdView meetingId={meetingId} />
        </ErrorBoundary>
      </Suspense>
    </HydrationBoundary>
  );
}
