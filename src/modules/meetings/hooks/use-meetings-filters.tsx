import {
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
  useQueryStates,
} from 'nuqs';

import { DEFAULT_PAGE } from '@/constants';

import { MeetingStatus } from '../types';

/**
 * Hook to get the current page and search query from the URL query parameters
 *
 * for two way binding between the url query parameters and the state
 *
 * @returns The current page and search query
 */
export const useMeetingsFilters = () => {
  return useQueryStates({
    page: parseAsInteger
      .withDefault(DEFAULT_PAGE)
      .withOptions({ clearOnDefault: true }),
    search: parseAsString.withDefault('').withOptions({ clearOnDefault: true }),
    agentId: parseAsString
      .withDefault('')
      .withOptions({ clearOnDefault: true }),
    status: parseAsStringEnum(Object.values(MeetingStatus)),
  });
};
