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
  ParticipantView, 
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
  const { useParticipants, useDominantSpeaker } = useCallStateHooks();
  const participants = useParticipants();
  const dominantSpeaker = useDominantSpeaker();

  // For 2 Participants - Split Screen
  if (participants.length === 2) {
    return (
      <div className="flex flex-col h-full w-full">
        {participants.map((participant) => (
          <div key={participant.sessionId} className="h-1/2 w-full">
            <ParticipantView 
              participant={participant}
              className="h-full w-full rounded-lg overflow-hidden"
            />
          </div>
        ))}
      </div>
    );
  }

  // For 3-4 Participants - 2x2 Grid
  if (participants.length <= 4) {
    return (
      <div className="grid-2x2-mobile">
        {participants.map((participant) => (
          <div key={participant.sessionId}>
            <ParticipantView 
              participant={participant}
              className="h-full w-full rounded-lg overflow-hidden"
            />
          </div>
        ))}
      </div>
    );
  }

  // For 5+ Participants - Scrollable Grid with Dominant Speaker
  if (participants.length >= 5) {
    return (
      <div className="scrollable-grid-mobile">
        {dominantSpeaker && (
          <div className="active-speaker">
            <ParticipantView 
              participant={dominantSpeaker}
              className="h-full w-full rounded-lg overflow-hidden"
            />
          </div>
        )}
        {participants.map((participant) => (
          participant !== dominantSpeaker && (
            <div key={participant.sessionId}>
              <ParticipantView 
                participant={participant}
                className="h-full w-full rounded-lg overflow-hidden"
              />
            </div>
          )
        ))}
      </div>
    );
  }

  return null;
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