import { polarClient } from '@polar-sh/better-auth';
import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  // https://www.better-auth.com/docs/reference/options#baseurl
  baseURL: process.env.BETTER_AUTH_URL,
  plugins: [polarClient()],
});
