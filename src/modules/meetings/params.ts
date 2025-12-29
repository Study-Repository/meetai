import {
  createLoader,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from 'nuqs/server';

import { DEFAULT_PAGE } from '@/constants';

import { MeetingStatus } from './types';

export const meetingsFiltersSearchParams = {
  page: parseAsInteger
    .withDefault(DEFAULT_PAGE)
    .withOptions({ clearOnDefault: true }),
  search: parseAsString.withDefault('').withOptions({ clearOnDefault: true }),
  agentId: parseAsString.withDefault('').withOptions({ clearOnDefault: true }),
  status: parseAsStringEnum(Object.values(MeetingStatus)),
};

export const loadMeetingsFiltersSearchParams = createLoader(
  meetingsFiltersSearchParams,
);
