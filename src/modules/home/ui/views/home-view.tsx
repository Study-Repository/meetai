'use client';

import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';

import { authClient } from '@/lib/auth-client';
import { useTRPC } from '@/trpc/client';

export const HomeView = () => {
  const { data: session } = authClient.useSession();

  const trpc = useTRPC();
  const greeting = useQuery({
    ...trpc.hello.queryOptions({
      text: session?.user.name ?? 'world',
    }),
    enabled: !!session,
  });

  return !greeting.data ? (
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
        <p>{greeting.data.greeting}</p>
      </div>
    </div>
  );
};
