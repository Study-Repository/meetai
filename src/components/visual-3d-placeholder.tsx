// import { useParticipantViewContext } from '@stream-io/video-react-sdk';
// import React, { useEffect, useRef } from 'react';

// // Import the class for type usage; this also registers the custom element
// import { GdmLiveAudioVisuals3D } from '@/components/visual-3d/visual-3d';

// export const Visual3DPlaceholder = () => {
//   const { participant } = useParticipantViewContext();
//   const containerRef = useRef<HTMLDivElement>(null);
//   const audioContextRef = useRef<AudioContext | null>(null);

//   useEffect(() => {
//     const audioStream = participant.audioStream;
//     if (!audioStream) return;

//     // 1. 初始化 AudioContext
//     if (!audioContextRef.current) {
//       audioContextRef.current = new (
//         window.AudioContext ||
//         (window as unknown as { webkitAudioContext: AudioContext })
//           .webkitAudioContext
//       )();
//     }
//     const ctx = audioContextRef.current;

//     // 2. 创建音频源
//     // 注意：Stream SDK 的流可能已经在播放，再次连接到 destination 会导致回声
//     // Visual3D 内部只做分析(Analyser)，不会连接到 destination，所以是安全的
//     const sourceNode = ctx.createMediaStreamSource(audioStream);

//     // 3. 获取 Web Component 实例并赋值
//     // 等待 DOM 渲染
//     const visualElement = containerRef.current?.querySelector(
//       'gdm-live-audio-visuals-3d',
//     ) as GdmLiveAudioVisuals3D | null;

//     if (visualElement) {
//       // Visual3D 需要 inputNode 和 outputNode。
//       // 对于单个 Agent，我们将它的声音同时作为 input 和 output
//       visualElement.inputNode = sourceNode;
//       visualElement.outputNode = sourceNode;
//     }

//     return () => {
//       // 清理逻辑
//       if (ctx.state !== 'closed') {
//         // 通常建议保留 context，但在组件卸载时断开连接是好习惯
//       }
//     };
//   }, [participant.audioStream]);

//   return (
//     <div
//       className="relative h-full w-full overflow-hidden bg-[#100c14]"
//       ref={containerRef}
//     >
//       {/*
//         使用自定义元素
//         注意：Web Component 内部样式设置了 fixed/absolute 宽高 100%，
//         {/*
//           父容器需要 relative 和确定的宽高
//         */}
//       {/* @ts-expect-error: gdm-live-audio-visuals-3d is a custom element */}
//       <gdm-live-audio-visuals-3d className="h-full w-full" />

//       {/* 叠加名字 */}
//       <div className="absolute right-0 bottom-4 left-0 z-10 text-center">
//         <p className="text-lg font-semibold text-white/80">
//           {participant.name || 'AI Assistant'}
//         </p>
//       </div>
//     </div>
//   );
// };

import { useParticipantViewContext } from '@stream-io/video-react-sdk';
import React, { useEffect, useRef, useState } from 'react';

// 引入新的 React 组件
import { Visual3DCanvas } from '@/components/visual-3d/visual-3d-canvas';

export const Visual3DPlaceholder = () => {
  const { participant } = useParticipantViewContext();
  const audioContextRef = useRef<AudioContext | null>(null);

  // 使用 State 来存储 sourceNode，以便传给子组件
  const [audioSource, setAudioSource] = useState<AudioNode | null>(null);

  useEffect(() => {
    const audioStream = participant.audioStream;
    if (!audioStream) return;

    // 1. 初始化 AudioContext
    if (!audioContextRef.current) {
      audioContextRef.current = new (
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: AudioContext })
          .webkitAudioContext
      )();
    }
    const ctx = audioContextRef.current;

    // 2. 创建音频源
    // Visual3D 内部只做分析(Analyser)，不会连接到 destination，所以是安全的
    const sourceNode = ctx.createMediaStreamSource(audioStream);
    setAudioSource(sourceNode);

    return () => {
      // 这里的 sourceNode 在组件卸载时不需要特别的 disconnect，
      // 因为 AudioContext 会在页面生命周期内持续存在（或由父级管理）。
      // 如果需要更严格的清理，可以在这里断开连接。
    };
  }, [participant.audioStream]);

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#100c14]">
      {/* 使用纯 React 组件替代 Web Component */}
      <Visual3DCanvas
        className="h-full w-full"
        inputNode={audioSource}
        outputNode={audioSource}
      />

      {/* 叠加名字 */}
      <div className="absolute right-0 bottom-4 left-0 z-10 text-center">
        <p className="text-lg font-semibold text-white/80">
          {participant.name || 'AI Assistant'}
        </p>
      </div>
    </div>
  );
};
