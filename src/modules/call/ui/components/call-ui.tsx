import { StreamTheme, useCall } from '@stream-io/video-react-sdk';
import { useState } from 'react';

import { CallActive } from './call-active';
import { CallEnded } from './call-ended';
import { CallLobby } from './call-lobby';

interface Props {
  meetingName: string;
}

export const CallUI = ({ meetingName }: Props) => {
  const call = useCall();
  const [show, setShow] = useState<'lobby' | 'call' | 'ended'>('lobby');

  const handleJoin = () => {
    if (!call) return;

    call
      .join()
      .then(() => {
        setShow('call');
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const handleLeave = () => {
    if (!call) return;

    call
      .endCall()
      .then(() => {
        setShow('ended');
      })
      .catch((error) => {
        console.error(error);
      });
  };

  return (
    <StreamTheme className="h-full">
      {show === 'lobby' && <CallLobby onJoin={handleJoin} />}
      {show === 'call' && (
        <CallActive meetingName={meetingName} onLeave={handleLeave} />
      )}
      {show === 'ended' && <CallEnded />}
    </StreamTheme>
  );
};
