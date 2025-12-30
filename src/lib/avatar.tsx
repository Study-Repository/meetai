import { botttsNeutral, initials } from '@dicebear/collection';
import { createAvatar } from '@dicebear/core';

interface Props {
  seed: string;
  variant: 'botttsNeutral' | 'initials';
}

export const generateAvatarUri = ({ seed, variant }: Props) => {
  let avatar;

  switch (variant) {
    case 'botttsNeutral':
      avatar = createAvatar(botttsNeutral, { seed });
      break;
    case 'initials':
      avatar = createAvatar(initials, { seed, fontWeight: 500, fontSize: 42 });
      break;
  }

  return avatar?.toDataUri();
};
