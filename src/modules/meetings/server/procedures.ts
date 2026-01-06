import { TRPCError } from '@trpc/server';
import { and, desc, eq, getTableColumns, ilike, sql } from 'drizzle-orm';
import JSONL from 'jsonl-parse-stringify';
import { z } from 'zod';

import { db } from '@/db';
import { agents, meetings, user } from '@/db/schema';
import { generateAvatarUri } from '@/lib/avatar';
import { streamChat } from '@/lib/stream-chat';
import { streamVideo } from '@/lib/stream-video';
import { createTRPCRouter, protectedProcedure } from '@/trpc/init';

import {
  meetingsIdSchema,
  meetingsInsertSchema,
  meetingsPaginationSchema,
  meetingsUpdateSchema,
} from '../schema';
import { StreamTranscriptItem } from '../types';

import { getMeetingParticipants } from './queries';

export const meetingsRouter = createTRPCRouter({
  generateVideoToken: protectedProcedure.mutation(async ({ ctx }) => {
    await streamVideo.upsertUsers([
      {
        id: ctx.auth.user.id,
        role: 'admin',
        name: ctx.auth.user.name,
        image:
          ctx.auth.user.image ??
          generateAvatarUri({ seed: ctx.auth.user.name, variant: 'initials' }),
      },
    ]);

    const expirationTime = Math.floor(Date.now() / 1000) + 60 * 60; // 1 hour
    const issuedAt = Math.floor(Date.now() / 1000) - 60;
    const token = streamVideo.generateUserToken({
      user_id: ctx.auth.user.id,
      exp: expirationTime,
      validity_in_seconds: issuedAt,
    });

    return token;
  }),
  generateChatToken: protectedProcedure.mutation(async ({ ctx }) => {
    const token = streamChat.createToken(ctx.auth.user.id);
    await streamChat.upsertUsers([
      {
        id: ctx.auth.user.id,
        role: 'admin',
        name: ctx.auth.user.name,
      },
    ]);
    return token;
  }),
  getOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const [existingMeeting] = await db
        .select({
          ...getTableColumns(meetings),
          agent: agents,
          duration: sql<number>`EXTRACT(EPOCH FROM (ended_at - started_at))`.as(
            'duration',
          ),
        })
        .from(meetings)
        .innerJoin(agents, eq(meetings.agentId, agents.id))
        .where(
          and(eq(meetings.id, input.id), eq(meetings.userId, ctx.auth.user.id)),
        );

      if (!existingMeeting) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Meeting not found',
        });
      }

      return existingMeeting;
    }),
  getMany: protectedProcedure
    .input(meetingsPaginationSchema.optional())
    .query(async ({ ctx, input = meetingsPaginationSchema.parse({}) }) => {
      const { page, pageSize, search, status, agentId } = input;

      const whereConditions = and(
        eq(meetings.userId, ctx.auth.user.id),
        search ? ilike(meetings.name, `%${search}%`) : undefined,
        status ? eq(meetings.status, status) : undefined,
        agentId ? eq(meetings.agentId, agentId) : undefined,
      );
      const [data, [totalCountResult]] = await Promise.all([
        db
          .select({
            ...getTableColumns(meetings),
            agent: agents, // select({ agent: agents }); 负责格式化输出。它决定了 Join 的 Agent 数据长什么样（放在哪里）。
            duration:
              sql<number>`EXTRACT(EPOCH FROM (ended_at - started_at))`.as(
                'duration',
              ),
          })
          .from(meetings)
          .innerJoin(agents, eq(meetings.agentId, agents.id))
          .where(whereConditions)
          .orderBy(desc(meetings.createdAt), desc(meetings.id))
          .limit(pageSize)
          .offset((page - 1) * pageSize),
        db
          .select({ count: sql<number>`count(*)` }) // sql<number>`count(*)` -> count()
          .from(meetings)
          .innerJoin(agents, eq(meetings.agentId, agents.id))
          .where(whereConditions),
      ]);
      return {
        items: data,
        totalCount: Number(totalCountResult?.count ?? 0),
        page,
        pageSize,
        totalPages: Math.ceil(Number(totalCountResult?.count ?? 0) / pageSize),
      };
    }),
  create: protectedProcedure
    .input(meetingsInsertSchema)
    .mutation(async ({ input, ctx }) => {
      const [createdMeeting] = await db
        .insert(meetings)
        .values({
          ...input,
          userId: ctx.auth.user.id,
        })
        .returning();

      // Create Stream Call, Upsert Stream Users
      const call = await streamVideo.video.call('default', createdMeeting.id);
      await call.create({
        members_limit: 2,
        data: {
          created_by_id: ctx.auth.user.id,
          custom: {
            meetingId: createdMeeting.id,
            meetingName: createdMeeting.name,
          },
          settings_override: {
            transcription: {
              language: 'en',
              mode: 'auto-on',
              closed_caption_mode: 'auto-on',
              translation: {
                enabled: true,
                languages: ['en', 'zh'],
              },
            },
            recording: {
              mode: 'auto-on',
              quality: '1080p',
            },
          },
        },
      });

      const [existingAgent] = await db
        .select()
        .from(agents)
        .where(eq(agents.id, createdMeeting.agentId));
      if (!existingAgent) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Agent not found',
        });
      }

      await streamVideo.upsertUsers([
        {
          id: existingAgent.id,
          role: 'user',
          name: existingAgent.name,
          image: generateAvatarUri({
            seed: existingAgent.name,
            variant: 'botttsNeutral',
          }),
        },
      ]);

      return createdMeeting;
    }),
  update: protectedProcedure
    .input(meetingsUpdateSchema)
    .mutation(async ({ input, ctx }) => {
      const [updatedMeeting] = await db
        .update(meetings)
        .set(input)
        .where(
          and(eq(meetings.id, input.id), eq(meetings.userId, ctx.auth.user.id)),
        )
        .returning();

      if (!updatedMeeting) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Meeting not found',
        });
      }

      return updatedMeeting;
    }),
  remove: protectedProcedure
    .input(meetingsIdSchema)
    .mutation(async ({ ctx, input }) => {
      const [removedMeeting] = await db
        .delete(meetings)
        .where(
          and(eq(meetings.id, input.id), eq(meetings.userId, ctx.auth.user.id)),
        )
        .returning();

      if (!removedMeeting) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Meeting not found',
        });
      }

      return removedMeeting;
    }),
  getTranscript: protectedProcedure
    .input(meetingsIdSchema)
    .query(async ({ input }) => {
      const [meeting] = await db
        .select()
        .from(meetings)
        .where(eq(meetings.id, input.id));

      if (!meeting.transcriptUrl) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Transcript URL not found',
        });
      }

      const [participants, transcript] = await Promise.all([
        getMeetingParticipants(input.id).then((data) => ({
          userId: data.userId ?? '',
          dataMap: data
            ? {
                [data.userId]: data.userName,
                [meeting.agentId]: data.agentName,
              }
            : {},
        })),

        fetch(meeting.transcriptUrl).then((res) => res.text()),
      ]);

      if (!participants) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Participants not found',
        });
      }

      return JSONL.parse<StreamTranscriptItem>(transcript).map((item) => ({
        ...item,
        is_user: participants.userId === item.speaker_id,
        speaker_name: participants.dataMap[item.speaker_id] || 'Unknown',
      }));
    }),
});

export type MeetingsRouter = typeof meetingsRouter;
