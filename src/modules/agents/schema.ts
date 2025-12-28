import { z } from 'zod';

import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  MIN_PAGE_SIZE,
} from '@/constants';

export const agentsIdSchema = z.object({
  id: z.string().min(1, { message: 'ID is required' }),
});

export const agentsInsertSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  instructions: z.string().min(1, { message: 'Instructions are required' }),
});

export const agentsUpdateSchema = agentsInsertSchema.extend(
  agentsIdSchema.shape,
);

export const agentsPaginationSchema = z.object({
  page: z.number().default(DEFAULT_PAGE),
  pageSize: z
    .number()
    .min(MIN_PAGE_SIZE)
    .max(MAX_PAGE_SIZE)
    .default(DEFAULT_PAGE_SIZE),
  search: z.string().nullish(),
});
