'use client';

import { useMutation } from '@tanstack/react-query';
import { useMemo } from 'react';
import { ChannelFilters, ChannelOptions, ChannelSort } from 'stream-chat';
import {
  Channel,
  ChannelHeader,
  ChannelList,
  Chat,
  MessageInput,
  MessageList,
  Thread,
  useCreateChatClient,
  Window,
} from 'stream-chat-react';

import { LoadingState } from '@/components/loading-state';
import { useTRPC } from '@/trpc/client';

import 'stream-chat-react/dist/css/v2/index.css';

interface Props {
  meetingId: string;
  meetingName: string;
  userId: string;
  userName: string;
  userImage?: string;
}

export const ChatUI = ({
  meetingId,
  meetingName,
  userId,
  userName,
  userImage,
}: Props) => {
  const trpc = useTRPC();
  const { mutateAsync: generateChatToken } = useMutation(
    trpc.meetings.generateChatToken.mutationOptions(),
  );

  const client = useCreateChatClient({
    apiKey: process.env.NEXT_PUBLIC_STREAM_API_KEY!,
    tokenOrProvider: generateChatToken,
    userData: { id: userId, name: userName, image: userImage },
  });

  const channel = useMemo(() => {
    if (!client) return null;
    return client.channel('messaging', meetingId, {
      members: [userId],
    });
  }, [client, meetingId, userId]);

  if (!client || !channel) {
    return (
      <LoadingState
        title="Loading..."
        description="This may take a few seconds"
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border bg-white">
      <Chat client={client}>
        <ChannelList />
        <Channel channel={channel}>
          <Window>
            {/* <ChannelHeader /> */}
            <div className="max-h-[calc(100vh-23rem)] flex-1 overflow-y-auto border-b">
              <MessageList />
            </div>
            <MessageInput />
          </Window>
          <Thread />
        </Channel>
      </Chat>
    </div>
  );
};
