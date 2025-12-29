import { z } from 'zod';

import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  MIN_PAGE_SIZE,
} from '@/constants';

import { MeetingStatus } from './types';

export const meetingsIdSchema = z.object({
  id: z.string().min(1, { message: 'ID is required' }),
});

export const meetingsInsertSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  agentId: z.string().min(1, { message: 'Agent ID is required' }),
});

export const meetingsUpdateSchema = meetingsInsertSchema.extend(
  meetingsIdSchema.shape,
);

export const meetingsPaginationSchema = z.object({
  agentId: z.string().nullish(),
  page: z.number().default(DEFAULT_PAGE),
  pageSize: z
    .number()
    .min(MIN_PAGE_SIZE)
    .max(MAX_PAGE_SIZE)
    .default(DEFAULT_PAGE_SIZE),
  search: z.string().nullish(),
  status: z.enum(Object.values(MeetingStatus)).nullish(),
});
