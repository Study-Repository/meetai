import {
  CallControls,
  // PaginatedGridLayout,
  ParticipantView,
  SpeakerLayout,
  useParticipantViewContext,
} from '@stream-io/video-react-sdk';
import Image from 'next/image';
import Link from 'next/link';

import { Visual3DPlaceholder } from '@/components/visual-3d-placeholder';

// 自定义参与者视图
const CustomParticipantView = () => {
  const { participant } = useParticipantViewContext();

  // 判断是否是 Agent
  const isAgent =
    participant.roles.includes('agent') || participant.roles.includes('user');

  return isAgent ? (
    <Visual3DPlaceholder />
  ) : (
    <ParticipantView participant={participant} />
  );
};

interface Props {
  meetingName: string;
  onLeave: () => void;
}

interface Props {
  meetingName: string;
  onLeave: () => void;
}

export const CallActive = ({ meetingName, onLeave }: Props) => {
  return (
    <div className="flex h-full flex-col justify-between p-4 text-white">
      <div className="flex items-center gap-4 rounded-full bg-[#101213] p-4">
        <Link href="/meetings">
          <Image src="/logo.svg" alt="Logo" width={22} height={22} />
        </Link>
        <h4 className="text-base">{meetingName}</h4>
      </div>
      {/* 覆盖默认渲染 */}
      <SpeakerLayout VideoPlaceholder={CustomParticipantView} />
      <div className="rounded-full bg-[#101213] px-4">
        <CallControls onLeave={onLeave} />
      </div>
    </div>
  );
};
