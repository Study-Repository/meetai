import { inferRouterOutputs } from '@trpc/server';

import { AppRouter } from '@/trpc/routers/_app';

export type AgentsGetOne = NonNullable<
  NonNullable<inferRouterOutputs<AppRouter>['agents']>['getOne']
>;

export type AgentsGetMany = NonNullable<
  NonNullable<inferRouterOutputs<AppRouter>['agents']>['getMany']
>['items'];
