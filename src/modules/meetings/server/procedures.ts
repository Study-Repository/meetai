import { TRPCError } from '@trpc/server';
import { and, desc, eq, getTableColumns, ilike, sql } from 'drizzle-orm';
import { z } from 'zod';

import { db } from '@/db';
import { agents, meetings } from '@/db/schema';
import { createTRPCRouter, protectedProcedure } from '@/trpc/init';

import {
  meetingsIdSchema,
  meetingsInsertSchema,
  meetingsPaginationSchema,
  meetingsUpdateSchema,
} from '../schema';

export const meetingsRouter = createTRPCRouter({
  getOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const [existingMeeting] = await db
        .select({
          ...getTableColumns(meetings),
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
});

export type MeetingsRouter = typeof meetingsRouter;
