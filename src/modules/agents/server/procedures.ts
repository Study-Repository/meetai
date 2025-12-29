import { TRPCError } from '@trpc/server';
import { and, desc, eq, getTableColumns, ilike, sql } from 'drizzle-orm';
import { z } from 'zod';

import { db } from '@/db';
import { agents } from '@/db/schema';
import { createTRPCRouter, protectedProcedure } from '@/trpc/init';

import {
  agentsIdSchema,
  agentsInsertSchema,
  agentsPaginationSchema,
  agentsSearchSchema,
  agentsUpdateSchema,
} from '../schema';

const getAgentsWhereCondition = (userId: string, search?: string | null) => {
  return and(
    eq(agents.userId, userId),
    search ? ilike(agents.name, `%${search}%`) : undefined,
  );
};

export const agentsRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(agentsSearchSchema.optional())
    .query(async ({ ctx, input = agentsSearchSchema.parse({}) }) => {
      const { search } = input;

      const data = await db
        .select({
          ...getTableColumns(agents),
        })
        .from(agents)
        .where(getAgentsWhereCondition(ctx.auth.user.id, search))
        .orderBy(desc(agents.createdAt), desc(agents.id))
        .limit(100); // TODO: 加上硬限制，防止下拉框炸掉

      return {
        items: data,
      };
    }),
  getOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const [existingAgent] = await db
        .select({
          ...getTableColumns(agents),
          meetingCount: sql<number>`5`, // TODO: change to actual count
        })
        .from(agents)
        .where(
          and(eq(agents.id, input.id), eq(agents.userId, ctx.auth.user.id)),
        );

      if (!existingAgent) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Agent not found' });
      }

      return existingAgent;
    }),
  getMany: protectedProcedure
    .input(agentsPaginationSchema.optional())
    .query(async ({ ctx, input = agentsPaginationSchema.parse({}) }) => {
      const { page, pageSize, search } = input;

      const whereConditions = getAgentsWhereCondition(ctx.auth.user.id, search);

      const [data, [totalCountResult]] = await Promise.all([
        db
          .select({
            ...getTableColumns(agents),
            meetingCount: sql<number>`5`, // TODO: change to actual count
          })
          .from(agents)
          .where(whereConditions)
          .orderBy(desc(agents.createdAt), desc(agents.id))
          .limit(pageSize)
          .offset((page - 1) * pageSize),
        db
          .select({ count: sql<number>`count(*)` })
          .from(agents)
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
    .input(agentsInsertSchema)
    .mutation(async ({ input, ctx }) => {
      const [createdAgent] = await db
        .insert(agents)
        .values({
          ...input,
          userId: ctx.auth.user.id,
        })
        .returning();

      return createdAgent;
    }),
  update: protectedProcedure
    .input(agentsUpdateSchema)
    .mutation(async ({ input, ctx }) => {
      const [updatedAgent] = await db
        .update(agents)
        .set(input)
        .where(
          and(eq(agents.id, input.id), eq(agents.userId, ctx.auth.user.id)),
        )
        .returning();

      if (!updatedAgent) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Agent not found' });
      }

      return updatedAgent;
    }),
  remove: protectedProcedure
    .input(agentsIdSchema)
    .mutation(async ({ ctx, input }) => {
      const [deletedAgent] = await db
        .delete(agents)
        .where(
          and(eq(agents.id, input.id), eq(agents.userId, ctx.auth.user.id)),
        )
        .returning();

      if (!deletedAgent) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Agent not found' });
      }

      return deletedAgent;
    }),
});

export type AgentsRouter = typeof agentsRouter;
