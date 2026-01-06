import { format } from 'date-fns/format';
import {
  BookOpenTextIcon,
  ClockFadingIcon,
  FileTextIcon,
  FileVideoIcon,
  SparklesIcon,
} from 'lucide-react';
import Link from 'next/link';
import Markdown from 'react-markdown';

import { GeneratedAvatar } from '@/components/generated-avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDuration } from '@/lib/utils';
import { MeetingGetOne } from '@/modules/meetings/types';

// import { ChatProvider } from './chat-provider';
import { Transcript } from './transcript';

interface Props {
  data: MeetingGetOne;
}

export const CompletedState = ({ data }: Props) => {
  return (
    <div className="flex flex-col gap-y-4">
      <Tabs defaultValue="summary">
        <div className="rounded-lg border bg-white px-3">
          <ScrollArea>
            <TabsList className="bg-background h-13 justify-start rounded-none p-0">
              <TabsTrigger
                value="summary"
                className="text-muted-foreground bg-background data-[state=active]:border-b-primary data-[state=active]:text-accent-foreground hover:text-accent-foreground h-full rounded-none border-b-2 border-transparent data-[state=active]:shadow-none"
              >
                <BookOpenTextIcon /> Summary
              </TabsTrigger>
              <TabsTrigger
                value="transcript"
                className="text-muted-foreground bg-background data-[state=active]:border-b-primary data-[state=active]:text-accent-foreground hover:text-accent-foreground h-full rounded-none border-b-2 border-transparent data-[state=active]:shadow-none"
              >
                <FileTextIcon /> Transcript
              </TabsTrigger>
              <TabsTrigger
                value="recording"
                className="text-muted-foreground bg-background data-[state=active]:border-b-primary data-[state=active]:text-accent-foreground hover:text-accent-foreground h-full rounded-none border-b-2 border-transparent data-[state=active]:shadow-none"
              >
                <FileVideoIcon /> Recording
              </TabsTrigger>
              {/* <TabsTrigger
                value="chat"
                className="text-muted-foreground bg-background data-[state=active]:border-b-primary data-[state=active]:text-accent-foreground hover:text-accent-foreground h-full rounded-none border-b-2 border-transparent data-[state=active]:shadow-none"
              >
                <SparklesIcon /> Ask AI
              </TabsTrigger> */}
            </TabsList>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
        <TabsContent value="summary">
          <div className="rounded-lg border bg-white">
            <div className="col-span-5 flex flex-col gap-y-5 px-4 py-5">
              <h2 className="text-2xl font-medium capitalize">{data.name}</h2>
              <div className="flex items-center gap-x-2">
                <Link
                  className="flex items-center gap-x-2 capitalize underline underline-offset-4"
                  href={`/agents/${data.agent.id}`}
                >
                  <GeneratedAvatar
                    seed={data.agent.name}
                    variant="botttsNeutral"
                    className="size-5"
                  />
                  {data.agent.name}
                </Link>{' '}
                <p>{data.startedAt ? format(data.startedAt, 'PPP') : ''}</p>
              </div>
              <div className="flex items-center gap-x-2">
                <SparklesIcon className="size-4" />
                <p>General Summary</p>
              </div>
              <Badge
                variant="outline"
                className="flex items-center gap-x-2 [&>svg]:size-4"
              >
                <ClockFadingIcon className="text-blue-700" />
                {data.duration ? formatDuration(data.duration) : 'No duration'}
              </Badge>
              <div>
                <Markdown
                  components={{
                    h1: (props) => (
                      <h1
                        className="text-foreground mt-6 mb-4 text-2xl font-bold tracking-tight"
                        {...props}
                      />
                    ),
                    h2: (props) => (
                      <h2
                        className="text-foreground mt-5 mb-3 text-xl font-semibold tracking-tight"
                        {...props}
                      />
                    ),
                    h3: (props) => (
                      <h3
                        className="text-foreground mt-4 mb-2 text-lg font-semibold tracking-tight"
                        {...props}
                      />
                    ),
                    h4: (props) => (
                      <h4
                        className="text-foreground mt-4 mb-2 text-base font-semibold tracking-tight"
                        {...props}
                      />
                    ),
                    p: (props) => (
                      <p
                        className="text-muted-foreground mb-4 leading-7"
                        {...props}
                      />
                    ),
                    ul: (props) => (
                      <ul
                        className="text-muted-foreground my-4 ml-6 list-disc"
                        {...props}
                      />
                    ),
                    ol: (props) => (
                      <ol
                        className="text-muted-foreground my-4 ml-6 list-decimal"
                        {...props}
                      />
                    ),
                    li: (props) => <li className="mb-1 pl-1" {...props} />,
                    strong: (props) => (
                      <strong
                        className="text-foreground font-semibold"
                        {...props}
                      />
                    ),
                    a: (props) => (
                      <a
                        className="text-primary hover:text-primary/80 font-medium underline underline-offset-4"
                        target="_blank"
                        rel="noreferrer"
                        {...props}
                      />
                    ),
                    blockquote: (props) => (
                      <blockquote
                        className="border-primary text-muted-foreground mt-6 border-l-2 pl-6 italic"
                        {...props}
                      />
                    ),
                  }}
                >
                  {data.summary}
                </Markdown>
              </div>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="transcript">
          <Transcript meetingId={data.id} />
        </TabsContent>
        <TabsContent value="recording">
          <div className="rounded-lg border bg-white px-4 py-5">
            {data.recordingUrl && (
              <video
                src={data.recordingUrl}
                className="w-full rounded-lg"
                controls
              />
            )}
          </div>
          <span className="text-muted-foreground text-sm">
            Recording files are retained for two weeks before being
            automatically deleted
          </span>
        </TabsContent>
        {/* <TabsContent value="chat">
          <ChatProvider meetingId={data.id} meetingName={data.name} />
        </TabsContent> */}
      </Tabs>
    </div>
  );
};
