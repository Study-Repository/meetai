import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import {
  UpgradeView,
  UpgradeViewError,
  UpgradeViewLoading,
} from '@/modules/upgrade/ui/views/upgrade-view';
import { getQueryClient, trpc } from '@/trpc/server';

export default function Page() {
  const queryClient = getQueryClient();
  queryClient.prefetchQuery(trpc.premium.getCurrentSubscription.queryOptions());
  queryClient.prefetchQuery(trpc.premium.getProducts.queryOptions());

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<UpgradeViewLoading />}>
        <ErrorBoundary fallback={<UpgradeViewError />}>
          <UpgradeView />
        </ErrorBoundary>
      </Suspense>
    </HydrationBoundary>
  );
}
