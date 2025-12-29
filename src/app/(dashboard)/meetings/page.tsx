import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import { loadMeetingsFiltersSearchParams } from '@/modules/meetings/params';
import { MeetingsListHeader } from '@/modules/meetings/ui/components/meetings-list-header';
import {
  MeetingsView,
  MeetingsViewError,
  MeetingsViewLoading,
} from '@/modules/meetings/ui/views/meetings-view';
import { getQueryClient, trpc } from '@/trpc/server';

interface Props {
  searchParams: Promise<{
    page: string;
    search: string;
  }>;
}

export default async function Page({ searchParams }: Props) {
  const filters = await loadMeetingsFiltersSearchParams(searchParams);
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(trpc.meetings.getMany.queryOptions(filters));

  return (
    <>
      <MeetingsListHeader />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<MeetingsViewLoading />}>
          <ErrorBoundary fallback={<MeetingsViewError />}>
            <MeetingsView />
          </ErrorBoundary>
        </Suspense>
      </HydrationBoundary>
    </>
  );
}
