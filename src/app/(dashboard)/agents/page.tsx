import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import { loadAgentsFiltersSearchParams } from '@/modules/agents/params';
import { AgentsListHeader } from '@/modules/agents/ui/components/agents-list-header';
import {
  AgentsView,
  AgentsViewError,
  AgentsViewLoading,
} from '@/modules/agents/ui/views/agents-view';
import { getQueryClient, trpc } from '@/trpc/server';

interface Props {
  searchParams: Promise<{
    page: string;
    search: string;
  }>;
}

export default async function Page({ searchParams }: Props) {
  const filters = await loadAgentsFiltersSearchParams(searchParams);

  // NOTE: prefetch agents data
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(trpc.agents.getMany.queryOptions(filters));

  return (
    <>
      <AgentsListHeader />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<AgentsViewLoading />}>
          <ErrorBoundary fallback={<AgentsViewError />}>
            <AgentsView />
          </ErrorBoundary>
        </Suspense>
      </HydrationBoundary>
    </>
  );
}
