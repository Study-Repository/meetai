import { useQueries } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Dispatch, SetStateAction, useState } from 'react';

import { GeneratedAvatar } from '@/components/generated-avatar';
import {
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandResponsiveDialog,
} from '@/components/ui/command';
import { useTRPC } from '@/trpc/client';

interface Props {
  open: boolean;
  onOpenChange: Dispatch<SetStateAction<boolean>>;
}

export const DashboardCommand = ({ open, onOpenChange }: Props) => {
  const [search, setSearch] = useState('');
  const router = useRouter();
  const trpc = useTRPC();
  const [meetings, agents] = useQueries({
    queries: [
      trpc.meetings.getMany.queryOptions({
        search,
        pageSize: 100,
      }),
      trpc.agents.getMany.queryOptions({
        search,
        pageSize: 10,
      }),
    ],
  });

  return (
    <CommandResponsiveDialog
      shouldFilter={false}
      open={open}
      onOpenChange={onOpenChange}
    >
      <CommandInput
        placeholder="Find a meeting or agent..."
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        <CommandGroup heading="Meetings">
          <CommandEmpty>
            <span className="text-muted-foreground text-sm">
              No meetings found
            </span>
          </CommandEmpty>
          {meetings.data?.items.map((meeting) => (
            <CommandItem
              key={meeting.id}
              onSelect={() => {
                router.push(`/meetings/${meeting.id}`);
                onOpenChange(false);
              }}
            >
              {meeting.name}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Agents">
          <CommandEmpty>
            <span className="text-muted-foreground text-sm">
              No agents found
            </span>
          </CommandEmpty>
          {agents.data?.items.map((agent) => (
            <CommandItem
              key={agent.id}
              onSelect={() => {
                router.push(`/agents/${agent.id}`);
                onOpenChange(false);
              }}
            >
              <GeneratedAvatar
                seed={agent.name}
                variant="botttsNeutral"
                className="size-5"
              />
              {agent.name}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandResponsiveDialog>
  );
};
