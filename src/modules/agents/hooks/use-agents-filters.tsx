import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs';

import { DEFAULT_PAGE } from '@/constants';

/**
 * Hook to get the current page and search query from the URL query parameters
 *
 * for two way binding between the url query parameters and the state
 *
 * @returns The current page and search query
 */
export const useAgentsFilters = () => {
  return useQueryStates({
    page: parseAsInteger
      .withDefault(DEFAULT_PAGE)
      .withOptions({ clearOnDefault: true }),
    search: parseAsString.withDefault('').withOptions({ clearOnDefault: true }),
  });
};
