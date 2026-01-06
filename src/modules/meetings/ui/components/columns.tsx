'use client';

import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import {
  CircleCheckIcon,
  CircleXIcon,
  ClockArrowUpIcon,
  ClockFadingIcon,
  CornerDownRightIcon,
  LoaderIcon,
} from 'lucide-react';

import { GeneratedAvatar } from '@/components/generated-avatar';
import { Badge } from '@/components/ui/badge';
import { cn, formatDuration } from '@/lib/utils';

import { MeetingGetMany, MeetingStatus } from '../../types';

const statusMap = {
  [MeetingStatus.Upcoming]: {
    icon: ClockArrowUpIcon,
    color: 'bg-yellow-500/20 text-yellow-800 border-yellow-800/5',
  },
  [MeetingStatus.Active]: {
    icon: LoaderIcon,
    color: 'bg-blue-500/20 text-blue-800 border-blue-800/5',
  },
  [MeetingStatus.Completed]: {
    icon: CircleCheckIcon,
    color: 'bg-emerald-500/20 text-emerald-800 border-emerald-800/5',
  },
  [MeetingStatus.Processing]: {
    icon: LoaderIcon,
    color: 'bg-rose-500/20 text-rose-800 border-rose-800/5',
  },
  [MeetingStatus.Cancelled]: {
    icon: CircleXIcon,
    color: 'bg-gray-300/20 text-gray-800 border-gray-800/5',
  },
};

export const columns: ColumnDef<MeetingGetMany[number]>[] = [
  {
    accessorKey: 'name',
    header: 'Meeting Name',
    cell: ({ row }) => (
      <div className="flex flex-col gap-y-1">
        <span className="font-semibold capitalize">{row.original.name}</span>
        <div className="flex items-center gap-x-2">
          <div className="flex items-center gap-x-1">
            <CornerDownRightIcon className="text-muted-foreground size-3" />
            <span className="text-muted-foreground max-w-[200px] truncate text-sm capitalize">
              {row.original.agent.name}
            </span>
          </div>
          <GeneratedAvatar
            seed={row.original.agent.name}
            variant="botttsNeutral"
            className="size-4"
          />
          <span className="text-muted-foreground text-sm">
            {row.original.startedAt
              ? format(row.original.startedAt, 'MMM d')
              : ''}
          </span>
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.original.status as MeetingStatus;
      const { icon: Icon, color } = statusMap[status];
      return (
        <Badge
          variant="outline"
          className={cn(
            'text-muted-foreground capitalize [&>svg]:size-4',
            color,
          )}
        >
          <Icon
            className={cn(
              status === MeetingStatus.Processing && 'animate-spin',
            )}
          />
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'duration',
    header: 'Duration',
    cell: ({ row }) => {
      const duration = row.original.duration;
      return (
        <Badge
          variant="outline"
          className="flex items-center gap-x-2 capitalize [&>svg]:size-4"
        >
          <ClockFadingIcon className="text-blue-700" />
          {duration ? formatDuration(duration) : 'No duration'}
        </Badge>
      );
    },
  },
];
