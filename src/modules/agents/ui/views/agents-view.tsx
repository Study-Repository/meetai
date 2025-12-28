'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { LoadingState } from '@/components/loading-state';
import { useTRPC } from '@/trpc/client';

import { useAgentsFilters } from '../../hooks/use-agents-filters';
import { columns } from '../components/columns';
import { DataPagination } from '../components/data-pagination';
import { DataTable } from '../components/data-table';

/**
 * Agents View
 */
export const AgentsView = () => {
  const [filters, setFilters] = useAgentsFilters();
  const router = useRouter();
  const trpc = useTRPC();
  const {
    data: { items, totalPages },
  } = useSuspenseQuery(trpc.agents.getMany.queryOptions(filters));

  return (
    <div className="flex flex-1 flex-col gap-y-4 px-4 pb-4 md:px-8">
      <DataTable
        columns={columns}
        data={items}
        onRowClick={(row) => router.push(`/agents/${row.id}`)}
      />
      <DataPagination
        page={filters.page}
        totalPages={totalPages}
        onPageChange={(page) => setFilters({ ...filters, page })}
      />
      {items.length === 0 && filters.search === '' && (
        <EmptyState
          title="Create your first agent"
          description="Create an agent to join your meetings. Each agent will follow your instructions and can interact with participants during the call."
        />
      )}
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
