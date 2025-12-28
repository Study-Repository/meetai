import { inferRouterOutputs } from '@trpc/server';

import { AppRouter } from '@/trpc/routers/_app';

export type AgentGetOne = NonNullable<
  NonNullable<inferRouterOutputs<AppRouter>['agents']>['getOne']
>;
