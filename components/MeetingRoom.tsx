'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  CallControls,
  CallParticipantsList,
  CallStatsButton,
  CallingState,
  PaginatedGridLayout,
  SpeakerLayout,
  useCallStateHooks,
  useCall,
  Video,
} from '@stream-io/video-react-sdk';
import { Users, LayoutList } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import Loader from './Loader';
import EndCallButton from './EndCallButton';
import { cn } from '@/lib/utils';

type CallLayoutType = 'grid' | 'speaker-left' | 'speaker-right';

const MobileCallLayout = () => {
  const call = useCall();
  const participants = Array.from(call?.state.participants.values() || []);
  const participantCount = participants.length;

  const getParticipantStyle = (index: number) => {
    if (participantCount === 2) {
      return `h-[50vh] w-full`;
    } else if (participantCount === 3) {
      if (index === 0) {
        return `h-[60vh] w-full`;
      }
      return `h-[40vh] w-1/2`;
    } else {
      return `h-[33vh] w-1/2 min-w-[160px]`;
    }
  };

  return (
    <div className="flex flex-wrap overflow-y-auto h-[calc(100vh-100px)]">
      {participants.map((participant, index) => (
        <div
          key={participant.sessionId}
          className={`${getParticipantStyle(index)} p-1`}
        >
          <div className="relative size-full rounded-lg overflow-hidden bg-dark-2">
            <Video
              participant={participant}
              className="size-full object-cover"
              autoPlay
              muted={participant.audio?.muted}
              trackType="videoTrack"
            />
            <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-sm">
              {participant.name || 'Participant'}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const MeetingRoom = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isPersonalRoom = !!searchParams.get('personal');
  const [layout, setLayout] = useState<CallLayoutType>('grid');
  const [showParticipants, setShowParticipants] = useState(false);
  const { useCallCallingState, useScreenShareState } = useCallStateHooks();
  const call = useCall();
  const { status: screenShareStatus } = useScreenShareState();
  const callingState = useCallCallingState();

  if (!call) {
    throw new Error('useCall must be used within a StreamCall component');
  }

  useEffect(() => {
    if (!call) return;

    if (screenShareStatus === 'enabled' && window.innerWidth >= 1024) {
      setLayout('speaker-left');
    } else if (screenShareStatus === 'disabled' && window.innerWidth >= 1024) {
      setLayout('grid');
    }
  }, [call, screenShareStatus]);

  if (callingState !== CallingState.JOINED) return <Loader />;

  const CallLayout = () => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;

    if (isMobile) {
      return <MobileCallLayout />;
    }

    switch (layout) {
      case 'grid':
        return <PaginatedGridLayout />;
      case 'speaker-right':
        return <SpeakerLayout participantsBarPosition="left" />;
      default:
        return <SpeakerLayout participantsBarPosition="right" />;
    }
  };

  return (
    <section className="relative h-screen w-full overflow-hidden pt-4 text-white">
      <div className="relative flex size-full items-center justify-center">
        <div className="flex size-full max-w-[1000px] items-center overflow-hidden">
          <CallLayout />
        </div>
        <div
          className={cn('h-[calc(100vh-86px)] hidden ml-2 lg:block', {
            'show-block': showParticipants,
          })}
        >
          {showParticipants && (
            <CallParticipantsList onClose={() => setShowParticipants(false)} />
          )}
        </div>
      </div>
      <div className="fixed bottom-5 flex w-full flex-wrap items-center justify-center gap-5 scale-90">
        <CallControls onLeave={() => router.push(`/`)} />
        
        <div className="hidden lg:flex items-center gap-5">
          <DropdownMenu>
            <DropdownMenuTrigger className="cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b]">
              <LayoutList size={20} className="text-white" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="border-dark-1 bg-dark-1 text-white">
              {['Grid', 'Speaker-Left', 'Speaker-Right'].map((item, index) => (
                <div key={index}>
                  <DropdownMenuItem
                    onClick={() =>
                      setLayout(item.toLowerCase() as CallLayoutType)
                    }
                  >
                    {item}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="border-dark-1" />
                </div>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <CallStatsButton />
          
          <button onClick={() => setShowParticipants((prev) => !prev)}>
            <div className="cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b]">
              <Users size={20} className="text-white" />
            </div>
          </button>
        </div>

        {!isPersonalRoom && <EndCallButton />}
      </div>
    </section>
  );
};

export default MeetingRoom;