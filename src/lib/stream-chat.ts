import 'server-only';

import { StreamChat } from 'stream-chat';

export const streamChat = new StreamChat(
  process.env.NEXT_PUBLIC_STREAM_API_KEY!,
  process.env.STREAM_API_SECRET!,
  { timeout: 15_000 },
);
