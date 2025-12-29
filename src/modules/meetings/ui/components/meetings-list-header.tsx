'use client';

import { PlusIcon, XCircleIcon } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { DEFAULT_PAGE } from '@/constants';

import { useMeetingsFilters } from '../../hooks/use-meetings-filters';

import { AgentIdFilter } from './agent-id-filter';
import { MeetingsSearchFilter } from './meetings-search-filter';
import { NewMeetingDialog } from './new-meeting-dialog';
import { StatusFilter } from './status-filter';

export const MeetingsListHeader = () => {
  const [filters, setFilters] = useMeetingsFilters();
  const [open, setOpen] = useState(false);

  const isAnyFilterModified =
    !!filters.search || !!filters.agentId || !!filters.status;

  return (
    <>
      <NewMeetingDialog open={open} onOpenChange={setOpen} />
      <div className="flex flex-col gap-y-4 px-4 py-4 md:px-8">
        <div className="flex items-center justify-between">
          <h5 className="text-xl font-medium">Meetings</h5>
          <Button onClick={() => setOpen(true)}>
            <PlusIcon className="size-4" />
            New Meeting
          </Button>
        </div>
        <ScrollArea>
          <div className="flex items-center gap-x-2 p-1">
            <MeetingsSearchFilter />
            <StatusFilter />
            <AgentIdFilter />
            {isAnyFilterModified && (
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setFilters({
                    page: DEFAULT_PAGE,
                    search: '',
                    agentId: '',
                    status: null,
                  })
                }
              >
                <XCircleIcon />
                Clear
              </Button>
            )}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </>
  );
};
