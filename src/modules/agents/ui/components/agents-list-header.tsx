'use client';

import { PlusIcon, XCircleIcon } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { DEFAULT_PAGE } from '@/constants';

import { useAgentsFilters } from '../../hooks/use-agents-filters';

import { AgentsSearchFilter } from './agents-search-filter';
import { NewAgentDialog } from './new-agent-dialog';

export const AgentsListHeader = () => {
  const [filters, setFilters] = useAgentsFilters();
  const [open, setOpen] = useState(false);

  const isAnyFilterModified = !!filters.search;

  return (
    <>
      <NewAgentDialog open={open} onOpenChange={setOpen} />
      <div className="flex flex-col gap-y-4 px-4 py-4 md:px-8">
        <div className="flex items-center justify-between">
          <h5 className="text-xl font-medium">Agents</h5>
          <Button onClick={() => setOpen(true)}>
            <PlusIcon className="size-4" />
            New Agent
          </Button>
        </div>
        <div className="flex items-center gap-x-2 p-1">
          <AgentsSearchFilter />
          {isAnyFilterModified && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilters({ page: DEFAULT_PAGE, search: '' })}
            >
              <XCircleIcon />
              Clear
            </Button>
          )}
        </div>
      </div>
    </>
  );
};
