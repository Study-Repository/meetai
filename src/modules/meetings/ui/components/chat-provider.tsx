import { LoadingState } from '@/components/loading-state';
import { authClient } from '@/lib/auth-client';

import { ChatUI } from './chat-ui';

interface Props {
  meetingId: string;
  meetingName: string;
}

export const ChatProvider = ({ meetingId, meetingName }: Props) => {
  const { data: session, isPending } = authClient.useSession();

  if (!session || isPending) {
    return (
      <LoadingState
        title="Loading..."
        description="Please wait while we load the chat"
      />
    );
  }

  return (
    <ChatUI
      meetingId={meetingId}
      meetingName={meetingName}
      userId={session.user.id}
      userName={session.user.name}
      userImage={session.user.image ?? ''}
    />
  );
};
