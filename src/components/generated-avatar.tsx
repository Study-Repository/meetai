import { generateAvatarUri } from '@/lib/avatar';
import { cn } from '@/lib/utils';

import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

interface GeneratedAvatarProps {
  seed: string;
  variant: 'botttsNeutral' | 'initials';
  className?: string;
}

export const GeneratedAvatar = ({
  seed,
  className,
  variant,
}: GeneratedAvatarProps) => {
  const avatarUri = generateAvatarUri({ seed, variant });

  return (
    <Avatar className={cn(className)}>
      <AvatarImage src={avatarUri} alt="Avatar" />
      <AvatarFallback>{seed.charAt(0).toUpperCase()}</AvatarFallback>
    </Avatar>
  );
};
