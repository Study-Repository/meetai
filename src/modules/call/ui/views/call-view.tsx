'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { ErrorState } from '@/components/error-state';
import { MeetingStatus } from '@/modules/meetings/types';
import { useTRPC } from '@/trpc/client';

import { CallProvider } from '../components/call-provider';

interface Props {
  meetingId: string;
}

export const CallView = ({ meetingId }: Props) => {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.meetings.getOne.queryOptions({ id: meetingId }),
  );

  const stateComponent = useMemo(() => {
    switch (data.status) {
      case MeetingStatus.Completed:
        return (
          <div className="flex h-screen items-center justify-center">
            <ErrorState
              title="Meeting has ended"
              description="You can no longer join this meeting."
            />
          </div>
        );
      default:
        return null;
    }
  }, [data.status]);

  if (stateComponent !== null) {
    return stateComponent;
  }

  return <CallProvider meetingId={meetingId} meetingName={data.name} />;
};
