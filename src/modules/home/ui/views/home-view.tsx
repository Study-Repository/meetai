'use client';

import Image from 'next/image';

import { authClient } from '@/lib/auth-client';

export const HomeView = () => {
  const { data: session, isPending } = authClient.useSession();

  return !session || isPending ? (
    <div className="text-center text-2xl font-bold">Loading...</div>
  ) : (
    <div className="flex w-full flex-col items-baseline justify-between">
      <div className="flex flex-col items-baseline gap-y-4">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        <p>{session.user.name}</p>
      </div>
    </div>
  );
};
