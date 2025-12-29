'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import { DataPagination } from '@/components/data-pagination';
import { DataTable } from '@/components/data-table';
import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { LoadingState } from '@/components/loading-state';
import { useTRPC } from '@/trpc/client';

import { useMeetingsFilters } from '../../hooks/use-meetings-filters';
import { columns } from '../components/columns';

export const MeetingsView = () => {
  const [filters, setFilters] = useMeetingsFilters();
  const router = useRouter();
  const trpc = useTRPC();
  const {
    data: { items, totalPages },
  } = useSuspenseQuery(trpc.meetings.getMany.queryOptions(filters));

  return (
    <div className="flex flex-1 flex-col gap-y-4 px-4 pb-4 md:px-8">
      <DataTable
        columns={columns}
        data={items}
        onRowClick={(row) => router.push(`/meetings/${row.id}`)}
      />
      <DataPagination
        page={filters.page}
        totalPages={totalPages}
        onPageChange={(page) => setFilters({ ...filters, page })}
      />
      {items.length === 0 && filters.search === '' && (
        <EmptyState
          title="Create your first meeting"
          description="Schedule a meeting to connect with others. Each meeting lets you collaborate, share ideas, and interact with participants in real time."
        />
      )}
    </div>
  );
};

/**
 * Meetings View - Loading State
 */
export const MeetingsViewLoading = () => {
  return (
    <LoadingState
      title="Loading Meetings"
      description="This may take a few seconds"
    />
  );
};

/**
 * Meetings View - Error State
 */
export const MeetingsViewError = () => {
  return (
    <ErrorState
      title="Error Loading Meetings"
      description="Please try again later"
    />
  );
};
