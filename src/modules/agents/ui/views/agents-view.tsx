'use client';

import { useSuspenseQuery } from '@tanstack/react-query';

import { ErrorState } from '@/components/error-state';
import { LoadingState } from '@/components/loading-state';
import { useTRPC } from '@/trpc/client';

/**
 * Agents View
 */
export const AgentsView = () => {
  const trpc = useTRPC();
  const { data: agents } = useSuspenseQuery(trpc.agents.getMany.queryOptions());

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Agents</h1>
      <div className="flex flex-col gap-4">
        {agents.map((agent) => (
          <div key={agent.id}>
            <h2 className="text-xl font-bold">{agent.name}</h2>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Agents View - Loading State
 */
export const AgentsViewLoading = () => {
  return (
    <LoadingState
      title="Loading Agents"
      description="This may take a few seconds"
    />
  );
};

/**
 * Agents View - Error State
 */
export const AgentsViewError = () => {
  return (
    <ErrorState
      title="Error Loading Agents"
      description="Please try again later"
    />
  );
};
