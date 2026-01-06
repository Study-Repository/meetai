'use client';

import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { ErrorState } from '@/components/error-state';
import { LoadingState } from '@/components/loading-state';
import { useConfirm } from '@/hooks/use-confirm';
import { useTRPC } from '@/trpc/client';

import { MeetingStatus } from '../../types';
import { ActiveState } from '../components/active-state';
import { CancelledState } from '../components/cancelled-state';
import { CompletedState } from '../components/completed-state';
import { MeetingIdViewHeader } from '../components/meeting-id-view-header';
import { ProcessingState } from '../components/processing-state';
import { UpcomingState } from '../components/upcoming-state';
import { UpdateMeetingDialog } from '../components/update-meeting-dialog';

interface Props {
  meetingId: string;
}

export const MeetingIdView = ({ meetingId }: Props) => {
  const router = useRouter();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { data } = useSuspenseQuery({
    ...trpc.meetings.getOne.queryOptions({ id: meetingId }),
    refetchOnWindowFocus: true,
    // refetchInterval: (query) => {
    //   // 如果会议处于进行中 (Active) 或处理中 (Processing) 状态，
    //   // 每 3 秒轮询一次，以便自动更新 UI (例如显示 Summary)
    //   return query.state.data?.status === MeetingStatus.Active ||
    //     query.state.data?.status === MeetingStatus.Processing
    //     ? 3000
    //     : false;
    // },
  });

  const [openUpdateMeetingDialog, setOpenUpdateMeetingDialog] = useState(false);
  const [RemoveConfirmationDialog, onRemoveConfirm] = useConfirm({
    title: 'Are you sure?',
    description: `The following action will remove this meeting.`,
  });

  const removeMutation = useMutation(
    trpc.meetings.remove.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(
          trpc.meetings.getMany.queryOptions(),
        );
        router.replace('/meetings');
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );

  const handleRemove = async () => {
    const confirmed = await onRemoveConfirm();
    if (confirmed) {
      removeMutation.mutate({ id: meetingId });
    }
  };

  const stateComponent = useMemo(() => {
    switch (data.status) {
      case MeetingStatus.Upcoming:
        return (
          <UpcomingState
            meetingId={meetingId}
            isCancelling={false}
            onCancelMeeting={() => {}}
          />
        );
      case MeetingStatus.Active:
        return <ActiveState meetingId={meetingId} />;
      case MeetingStatus.Processing:
        return <ProcessingState />;
      case MeetingStatus.Completed:
        return <CompletedState data={data} />;
      case MeetingStatus.Cancelled:
        return <CancelledState />;
    }
    return null;
  }, [data, meetingId]);

  return (
    <>
      <UpdateMeetingDialog
        initialValues={data}
        open={openUpdateMeetingDialog}
        onOpenChange={setOpenUpdateMeetingDialog}
      />
      <RemoveConfirmationDialog />
      <div className="flex flex-1 flex-col gap-y-4 px-4 pb-4 md:px-8">
        <MeetingIdViewHeader
          meetingId={meetingId}
          meetingName={data.name}
          onEdit={() => setOpenUpdateMeetingDialog(true)}
          onRemove={handleRemove}
        />
        {stateComponent}
      </div>
    </>
  );
};

/**
 * Meeting ID View - Loading State
 */
export const MeetingIdViewLoading = () => {
  return (
    <LoadingState
      title="Loading Meeting"
      description="This may take a few seconds"
    />
  );
};

/**
 * Meeting ID View - Error State
 */
export const MeetingIdViewError = () => {
  return (
    <ErrorState
      title="Error Loading Meeting"
      description="Please try again later"
    />
  );
};
