import { createAgent, gemini, TextMessage } from '@inngest/agent-kit';
import { eq } from 'drizzle-orm';
import JSONL from 'jsonl-parse-stringify';

import { db } from '@/db';
import { meetings } from '@/db/schema';
import { getMeetingParticipants } from '@/modules/meetings/server/queries';
import { MeetingStatus, StreamTranscriptItem } from '@/modules/meetings/types';

import { inngest } from './client';

const summarizerAgent = createAgent({
  name: 'Summarizer Agent',
  model: gemini({
    model: 'gemini-2.5-flash',
    apiKey: process.env.GEMINI_API_KEY,
  }),
  system: `
You are an expert summarizer. You write readable, concise, simple content. You are given a transcript of a meeting and you need to summarize it, mainly focus on the user's content.

Use the following markdown structure for every output:

### Overview
Provide a detailed, engaging summary of the session's content. Focus on major features, user workflows, and any key takeaways. Write in a narrative style, using full sentences. Highlight unique or powerful aspects of the product, platform, or discussion.

### Notes
Break down key content into thematic sections with timestamp ranges. Each section should summarize key points, actions, or demos in bullet format.

Example:
#### Section Name
- Main point or demo shown here
- Another key insight or interaction
- Follow-up tool or explanation provided

#### Next Section
- Feature X automatically does Y
- Mention of integration with Z
  `.trim(),
});

export const meetingsProcessing = inngest.createFunction(
  { id: 'meetings-processing' },
  { event: 'meetings/processing' },
  async ({ event, step }) => {
    console.log('>>> Inngest function: meetings/processing', event.data);
    const meetingId = event.data.meetingId;
    const agentId = event.data.agentId;
    const transcriptUrl = event.data.transcriptUrl;

    const response = await step.fetch(transcriptUrl).then((res) => res.text());

    const participants = await step.run('fetch-participants', async () => {
      const meetingData = await getMeetingParticipants(meetingId);

      return {
        userId: meetingData.userId ?? '',
        dataMap: meetingData
          ? {
              [meetingData.userId]: meetingData.userName,
              [agentId]: meetingData.agentName,
            }
          : {},
      };
    });

    const transcript = await step.run('parse-transcript', async () => {
      return JSONL.parse<StreamTranscriptItem>(response).map((item) => ({
        ...item,
        is_user: participants.userId && participants.userId === item.speaker_id,
        speaker_name: participants.dataMap[item.speaker_id] || 'Unknown',
      }));
    });

    const summary = await summarizerAgent.run(
      `Summarize the following transcript of a meeting: ${JSON.stringify(transcript)}`,
    );

    await step.run('update-meeting', async () => {
      await db
        .update(meetings)
        .set({
          summary: (summary.output[0] as TextMessage).content as string,
          status: MeetingStatus.Completed,
        })
        .where(eq(meetings.id, meetingId));
    });

    return 'Meeting processed successfully with AI generated summary';
  },
);
