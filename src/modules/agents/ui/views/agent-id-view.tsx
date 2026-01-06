'use client';

import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query';
import { VideoIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { ErrorState } from '@/components/error-state';
import { GeneratedAvatar } from '@/components/generated-avatar';
import { LoadingState } from '@/components/loading-state';
import { Badge } from '@/components/ui/badge';
import { useConfirm } from '@/hooks/use-confirm';
import { useTRPC } from '@/trpc/client';

import { AgentIdViewHeader } from '../components/agent-id-view-header';
import { UpdateAgentDialog } from '../components/update-agent-dialog';

interface Props {
  agentId: string;
}

/**
 * Agent ID View
 */
export const AgentIdView = ({ agentId }: Props) => {
  const router = useRouter();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { data } = useSuspenseQuery(
    trpc.agents.getOne.queryOptions({ id: agentId }),
  );
  const [openUpdateAgentDialog, setOpenUpdateAgentDialog] = useState(false);
  const [RemoveConfirmationDialog, onRemoveConfirm] = useConfirm({
    title: 'Are you sure?',
    description: `The following action will remove ${data.meetingCount} associated ${data.meetingCount === 1 ? 'meeting' : 'meetings'}.`,
  });

  const removeMutation = useMutation(
    trpc.agents.remove.mutationOptions({
      onSuccess: async () => {
        await Promise.all([
          queryClient.invalidateQueries(trpc.agents.getMany.queryOptions()),
          queryClient.invalidateQueries(
            trpc.premium.getFreeUsage.queryOptions(),
          ),
        ]);
        router.replace('/agents');
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );

  const handleRemove = async () => {
    const confirmed = await onRemoveConfirm();
    if (confirmed) {
      removeMutation.mutate({ id: agentId });
    }
  };

  return (
    <>
      <UpdateAgentDialog
        initialValues={data}
        open={openUpdateAgentDialog}
        onOpenChange={setOpenUpdateAgentDialog}
      />
      <RemoveConfirmationDialog />
      <div className="flex flex-1 flex-col gap-y-4 px-4 pb-4 md:px-8">
        <AgentIdViewHeader
          agentId={agentId}
          agentName={data.name}
          onEdit={() => setOpenUpdateAgentDialog(true)}
          onRemove={handleRemove}
        />
        <div className="rounded-lg border bg-white">
          <div className="col-span-5 flex flex-col gap-y-5 px-4 py-5">
            <div className="flex items-center gap-x-3">
              <GeneratedAvatar
                seed={data.name}
                variant="botttsNeutral"
                className="size-10"
              />
              <h2 className="text-2xl font-medium">{data.name}</h2>
            </div>
            <Badge
              variant="outline"
              className="flex items-center gap-x-2 [&>svg]:size-4"
            >
              <VideoIcon className="text-blue-700" />
              {data.meetingCount}{' '}
              {data.meetingCount === 1 ? 'meeting' : 'meetings'}
            </Badge>
            <div className="flex flex-col gap-y-4">
              <p className="text-lg font-medium">Instructions</p>
              <p className="text-neutral-800">{data.instructions}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

/**
 * Agent ID View - Loading State
 */
export const AgentIdViewLoading = () => {
  return (
    <LoadingState
      title="Loading Agent"
      description="This may take a few seconds"
    />
  );
};

/**
 * Agent ID View - Error State
 */
export const AgentIdViewError = () => {
  return (
    <ErrorState
      title="Error Loading Agent"
      description="Please try again later"
    />
  );
};
