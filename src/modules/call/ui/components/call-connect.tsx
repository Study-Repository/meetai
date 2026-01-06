'use client';

import {
  Call,
  CallingState,
  StreamCall,
  StreamVideo,
  StreamVideoClient,
  User,
} from '@stream-io/video-react-sdk';
import { useMutation } from '@tanstack/react-query';
import { Loader2Icon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { useTRPC } from '@/trpc/client';

import { CallUI } from './call-ui';

import '@stream-io/video-react-sdk/dist/css/styles.css';

interface Props {
  meetingId: string;
  meetingName: string;
  userId: string;
  userName: string;
  userImage: string;
}

export const CallConnect = ({
  meetingId,
  meetingName,
  userId,
  userName,
  userImage,
}: Props) => {
  const trpc = useTRPC();

  const { mutateAsync: generateToken } = useMutation(
    trpc.meetings.generateVideoToken.mutationOptions(),
  );

  const videoClient = useMemo(() => {
    return new StreamVideoClient({
      apiKey: process.env.NEXT_PUBLIC_STREAM_API_KEY!,
      user: {
        id: userId,
        name: userName,
        image: userImage,
      },
      tokenProvider: generateToken,
    });
  }, [userId, userName, userImage, generateToken]);

  const call = useMemo(() => {
    const _call = videoClient.call('default', meetingId);
    _call.camera.disable();
    _call.microphone.disable();
    return _call;
  }, [videoClient, meetingId]);

  useEffect(() => {
    return () => {
      videoClient.disconnectUser();
    };
  }, [videoClient]);

  useEffect(() => {
    return () => {
      if (call.state.callingState !== CallingState.LEFT) {
        call.leave();
        call.endCall();
      }
    };
  }, [call]);

  if (!videoClient || !call) {
    return (
      <div className="from-sidebar-accent to-sidebar flex h-screen items-center justify-center bg-radial">
        <Loader2Icon className="size-6 animate-spin text-white" />
      </div>
    );
  }

  return (
    <StreamVideo client={videoClient}>
      <StreamCall call={call}>
        <CallUI meetingName={meetingName} />
      </StreamCall>
    </StreamVideo>
  );
};
