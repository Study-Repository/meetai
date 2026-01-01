import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */

  /**
   * Allow specific origins to access the development server.
   * This is useful when using tools like ngrok.
   */
  allowedDevOrigins: ['corey-preestival-synthia.ngrok-free.dev'],

  /**
   * NOTE: reactStrictMode
   *
   * can cause hydration errors in Next.js 16.
   * @see https://nextjs.org/docs/app/building-your-application/configuring/react-strict-mode#disabling-strict-mode
   *
   * can cause issues with better-auth social sign in, throws "Invalid code" error.
   * @see https://github.com/better-auth/better-auth/issues/1013
   */
  reactStrictMode: false,
};

export default nextConfig;
