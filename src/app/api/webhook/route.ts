import {
  CallRecordingReadyEvent,
  CallSessionEndedEvent,
  CallSessionParticipantLeftEvent,
  CallSessionStartedEvent,
  CallTranscriptionReadyEvent,
} from '@stream-io/node-sdk';
import { and, eq, not } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/db';
import { agents, meetings } from '@/db/schema';
import { inngest } from '@/inngest/client';
import { streamVideo } from '@/lib/stream-video';
import { MeetingStatus } from '@/modules/meetings/types';

function verifySignatureWithSDK(body: string, signature: string): boolean {
  return streamVideo.verifyWebhook(body, signature);
}

export async function POST(req: NextRequest) {
  console.log('>>> Webhook received');
  const signature = req.headers.get('x-signature');
  const apiKey = req.headers.get('x-api-key');
  if (!signature || !apiKey) {
    console.error('>>> Webhook: Missing signature or API key');
    return NextResponse.json(
      { error: 'Missing signature or API key' },
      { status: 400 },
    );
  }

  const body = await req.text();
  if (!verifySignatureWithSDK(body, signature)) {
    console.error('>>> Webhook: Invalid signature');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(body);
    console.log(
      '>>> Received Webhook with payload:',
      (payload as { type: string }).type,
    );
  } catch {
    console.error('>>> Webhook: Invalid JSON');
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  switch ((payload as { type: string }).type) {
    case 'call.session_started': {
      console.log('>>> Call session started');
      const event = payload as CallSessionStartedEvent;
      const meetingId = event.call.custom?.meetingId;
      if (!meetingId) {
        return NextResponse.json(
          { error: 'Meeting ID not found' },
          { status: 400 },
        );
      }

      // get the meeting by id and status upcoming
      const [existingMeeting] = await db
        .select()
        .from(meetings)
        .where(
          and(
            eq(meetings.id, meetingId),
            eq(meetings.status, MeetingStatus.Upcoming),
          ),
        );

      if (!existingMeeting) {
        return NextResponse.json(
          { error: 'Meeting not found' },
          { status: 404 },
        );
      }

      // update the meeting to active
      await db
        .update(meetings)
        .set({
          status: MeetingStatus.Active,
          startedAt: new Date(),
        })
        .where(eq(meetings.id, existingMeeting.id));

      // get agent by id
      const [existingAgent] = await db
        .select()
        .from(agents)
        .where(eq(agents.id, existingMeeting.agentId));

      if (!existingAgent) {
        return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
      }

      console.log('>>> Triggering Vision Agent Service', existingMeeting.id);

      try {
        // 调用 Python 服务
        const response = await fetch(
          `${process.env.VISION_AGENT_SERVICE_URL!}/join-call`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              call_id: existingMeeting.id,
              call_type: 'default',
              agent_id: existingAgent.id,
              agent_name: existingAgent.name,
              // 如果你想用数据库里的指令覆盖 Python 里的默认指令：
              instructions: existingAgent.instructions || 'Read @golf_coach.md',
            }),
          },
        );

        if (!response.ok) {
          console.error(
            'Failed to trigger vision agent:',
            await response.text(),
          );
        } else {
          console.log('>>> Vision Agent triggered successfully');
        }
      } catch (error) {
        console.error('Error calling vision agent service:', error);
      }

      // console.log('>>> Connecting to OpenAI Realtime API', existingMeeting.id);
      // const call = streamVideo.video.call('default', existingMeeting.id);
      // const realtimeClient = await streamVideo.video.connectOpenAi({
      //   call,
      //   openAiApiKey: process.env.OPENAI_API_KEY!,
      //   agentUserId: existingAgent.id,
      // });

      // realtimeClient.updateSession({
      //   instructions: existingAgent.instructions,
      // });
      // console.log('>>> Connected to OpenAI Realtime API', existingMeeting.id);

      break;
    }
    case 'call.session_participant_left': {
      console.log('>>> Call session participant left');
      const event = payload as CallSessionParticipantLeftEvent;
      const meetingId = event.call_cid.split(':')[1]; // call_cid is formatted as type:${meetingId}
      if (!meetingId) {
        return NextResponse.json(
          { error: 'Meeting ID not found' },
          { status: 400 },
        );
      }

      console.log('>>> Call participant left', meetingId);
      const call = streamVideo.video.call('default', meetingId);
      await call.end();
      console.log('>>> Call ended', meetingId);

      break;
    }
    case 'call.session_ended': {
      console.log('>>> Call session ended');
      const event = payload as CallSessionEndedEvent;
      const meetingId = event.call.custom?.meetingId;
      if (!meetingId) {
        return NextResponse.json(
          { error: 'Meeting ID not found' },
          { status: 400 },
        );
      }

      const [updatedMeeting] = await db
        .update(meetings)
        .set({
          status: MeetingStatus.Processing,
          endedAt: new Date(),
        })
        .where(
          and(
            eq(meetings.id, meetingId),
            eq(meetings.status, MeetingStatus.Active),
          ),
        )
        .returning();

      if (!updatedMeeting) {
        return NextResponse.json(
          { error: 'Meeting not found' },
          { status: 404 },
        );
      }

      console.log('>>> Meeting updated to processing', updatedMeeting.id);

      break;
    }
    case 'call.transcription_ready': {
      console.log('>>> Call transcription ready');
      const event = payload as CallTranscriptionReadyEvent;
      const meetingId = event.call_cid.split(':')[1]; // call_cid is formatted as type:$
      if (!meetingId) {
        return NextResponse.json(
          { error: 'Meeting ID not found' },
          { status: 400 },
        );
      }

      const [updatedMeeting] = await db
        .update(meetings)
        .set({
          transcriptUrl: event.call_transcription.url,
        })
        .where(eq(meetings.id, meetingId))
        .returning();

      if (!updatedMeeting) {
        return NextResponse.json(
          { error: 'Meeting not found' },
          { status: 404 },
        );
      }

      // trigger inngest function to process the meeting
      await inngest.send({
        // The event name
        name: 'meetings/processing',
        // The event's data
        data: {
          meetingId: updatedMeeting.id,
          agentId: updatedMeeting.agentId,
          transcriptUrl: updatedMeeting.transcriptUrl,
        },
      });

      console.log('>>> Meeting updated with transcription', updatedMeeting.id);

      break;
    }
    case 'call.recording_ready': {
      console.log('>>> Call recording ready');
      const event = payload as CallRecordingReadyEvent;
      const meetingId = event.call_cid.split(':')[1]; // call_cid is formatted as type:$
      if (!meetingId) {
        return NextResponse.json(
          { error: 'Meeting ID not found' },
          { status: 400 },
        );
      }

      const [updatedMeeting] = await db
        .update(meetings)
        .set({
          recordingUrl: event.call_recording.url,
        })
        .where(eq(meetings.id, meetingId))
        .returning();

      if (!updatedMeeting) {
        return NextResponse.json(
          { error: 'Meeting not found' },
          { status: 404 },
        );
      }

      console.log('>>> Meeting updated with recording', updatedMeeting.id);

      break;
    }
    default:
  }

  return NextResponse.json({ status: 'ok' });
}
