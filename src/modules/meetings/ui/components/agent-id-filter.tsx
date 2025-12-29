import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { GeneratedAvatar } from '@/components/generated-avatar';
import { useTRPC } from '@/trpc/client';

import { useMeetingsFilters } from '../../hooks/use-meetings-filters';

import { CommandSelect } from './command-select';

export const AgentIdFilter = () => {
  const [filters, setFilters] = useMeetingsFilters();
  const [agentsSearch, setAgentsSearch] = useState('');
  const trpc = useTRPC();
  const { data: agents } = useQuery(
    trpc.agents.getAll.queryOptions({ search: agentsSearch }),
  );
  return (
    <CommandSelect
      placeholder="Agent"
      className="h-9"
      options={(agents?.items ?? []).map((agent) => ({
        id: agent.id,
        value: agent.id,
        children: (
          <div className="flex items-center gap-x-2">
            <GeneratedAvatar
              seed={agent.name}
              variant="botttsNeutral"
              className="size-4"
            />
            <span>{agent.name}</span>
          </div>
        ),
      }))}
      value={filters.agentId ?? ''}
      onSelect={(agentId) => setFilters({ ...filters, agentId })}
      onSearch={setAgentsSearch}
    />
  );
};
