'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { authClient } from '@/lib/auth-client';

export const HomeView = () => {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();

  const handleSignOut = () => {
    authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.replace('/sign-in');
        },
      },
    });
  };

  return !session ? (
    <div className="text-center text-2xl font-bold">Loading...</div>
  ) : (
    <div className="flex w-full flex-row items-baseline justify-between">
      <div className="flex flex-row items-baseline gap-x-4">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        <p>
          Hello, <span className="font-bold">{session.user.name}</span>
        </p>
      </div>
      <Button onClick={handleSignOut} disabled={isPending}>
        Sign out
      </Button>
    </div>
  );
};
