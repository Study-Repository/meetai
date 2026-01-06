import 'server-only';

import { eq } from 'drizzle-orm';

import { db } from '@/db';
import { agents, meetings, user } from '@/db/schema';

export async function getMeetingParticipants(meetingId: string) {
  const [participants] = await db
    .select({
      userId: meetings.userId,
      userName: user.name,
      agentId: agents.id,
      agentName: agents.name,
    })
    .from(meetings)
    .innerJoin(user, eq(meetings.userId, user.id))
    .innerJoin(agents, eq(meetings.agentId, agents.id))
    .where(eq(meetings.id, meetingId));

  return participants;
}
