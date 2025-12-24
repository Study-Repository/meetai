import { botttsNeutral, initials } from '@dicebear/collection';
import { createAvatar } from '@dicebear/core';

import { cn } from '@/lib/utils';

import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

interface GeneratedAvatarProps {
  seed: string;
  className?: string;
  variant?: 'botttsNeutral' | 'initials';
}

export const GeneratedAvatar = ({
  seed,
  className,
  variant,
}: GeneratedAvatarProps) => {
  let avatar;
  switch (variant) {
    case 'botttsNeutral':
      avatar = createAvatar(botttsNeutral, {
        seed,
      });
      break;
    case 'initials':
      avatar = createAvatar(initials, {
        seed,
      });

      break;
  }

  return (
    <Avatar className={cn(className)}>
      <AvatarImage src={avatar?.toDataUri()} alt="Avatar" />
      <AvatarFallback>{seed.charAt(0).toUpperCase()}</AvatarFallback>
    </Avatar>
  );
};
