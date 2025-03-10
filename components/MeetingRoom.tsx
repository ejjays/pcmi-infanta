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
  const { useParticipants, useLocalParticipant, useScreenShareState } = useCallStateHooks();
  const participants = useParticipants();
  const localParticipant = useLocalParticipant();
  const { status: screenShareStatus, screenShare } = useScreenShareState();

  // If someone is screen sharing, show only the shared screen
  if (screenShareStatus === 'enabled' && screenShare) {
  const screenShareParticipant = participants.find(p => p.screenShareStream);
  
  if (screenShareParticipant) {
    return (
      <div className="h-[calc(100vh-120px)] w-full flex items-center justify-center p-2">
        <div className="w-full h-full">
          <div className="relative h-full w-full">
            <ParticipantView 
              participant={screenShareParticipant}
              className="h-full w-full rounded-lg overflow-hidden bg-dark-1"
              trackType="video"
            />
            <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-sm">
              Screen Share Active
            </div>
          </div>
        </div>
      </div>
    );
  }
}
  
  if (participants.length === 1) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-120px)] w-full max-w-[400px] mx-auto p-2">
        <div className="w-full aspect-[4/3] max-h-[400px]"> {/* Adjusted size container */}
          <div className="relative h-full w-full">
            <ParticipantView 
              participant={participants[0]}
              className="h-full w-full rounded-lg overflow-hidden bg-dark-1"
            />
            {participants[0] === localParticipant && (
              <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-sm">
                You
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // For 2 Participants
  if (participants.length === 2) {
  return (
    <div className="h-[calc(100vh-120px)] w-full flex flex-col justify-center gap-2 p-2 pb-16"> {/* Added pb-16 for button spacing */}
      {participants.map((participant, index) => (
        <div 
          key={participant.sessionId}
          className="w-full flex-1 min-h-[45%]" // Ensures each participant takes equal space
        >
          <div className="relative h-full w-full">
            <ParticipantView
              participant={participant}
              className="h-full w-full rounded-lg overflow-hidden bg-dark-1"
            />
            {participant === localParticipant && (
              <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-sm">
                You
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

if (participants.length === 3) {
  return (
    <div className="h-[calc(100vh-120px)] w-full flex flex-col gap-2 pb-20 p-2">
      {/* Top row with 2 participants */}
      <div className="flex flex-row gap-2 flex-1">
        <div className="w-1/2">
          <div className="relative size-full">
            <ParticipantView
              participant={participants[0]}
              className="size-full rounded-lg overflow-hidden bg-dark-1"
            />
            {participants[0] === localParticipant && (
              <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-sm">
                You
              </div>
            )}
          </div>
        </div>
        <div className="w-1/2">
          <div className="relative size-full">
            <ParticipantView
              participant={participants[1]}
              className="size-full rounded-lg overflow-hidden bg-dark-1"
            />
            {participants[1] === localParticipant && (
              <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-sm">
                You
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom row with 1 participant centered */}
      <div className="flex justify-center flex-1">
        <div className="w-1/2">
          <div className="relative size-full">
            <ParticipantView
              participant={participants[2]}
              className="size-full rounded-lg overflow-hidden bg-dark-1"
            />
            {participants[2] === localParticipant && (
              <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-sm">
                You
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

  // For four participants layout
if (participants.length === 4) {
  return (
    <div className="h-[calc(100vh-120px)] w-full flex flex-col gap-2 pb-20 p-2">
      {/* Top row with 2 participants */}
      <div className="flex flex-row gap-2 flex-1">
        <div className="w-1/2">
          <div className="relative size-full">
            <ParticipantView
              participant={participants[0]}
              className="size-full rounded-lg overflow-hidden bg-dark-1"
            />
            {participants[0] === localParticipant && (
              <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-sm">
                You
              </div>
            )}
          </div>
        </div>
        <div className="w-1/2">
          <div className="relative size-full">
            <ParticipantView
              participant={participants[1]}
              className="size-full rounded-lg overflow-hidden bg-dark-1"
            />
            {participants[1] === localParticipant && (
              <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-sm">
                You
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom row with 2 participants */}
      <div className="flex flex-row gap-2 flex-1">
        <div className="w-1/2">
          <div className="relative size-full">
            <ParticipantView
              participant={participants[2]}
              className="size-full rounded-lg overflow-hidden bg-dark-1"
            />
            {participants[2] === localParticipant && (
              <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-sm">
                You
              </div>
            )}
          </div>
        </div>
        <div className="w-1/2">
          <div className="relative size-full">
            <ParticipantView
              participant={participants[3]}
              className="size-full rounded-lg overflow-hidden bg-dark-1"
            />
            {participants[3] === localParticipant && (
              <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-sm">
                You
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// For 5+ Participants
if (participants.length >= 5) {
  return (
    <div className="h-screen w-full flex flex-col gap-2 overflow-y-auto pb-24"> 
      <div className="grid grid-cols-2 gap-2">
        {participants.map((participant, index) => {
          const isLastAndOdd = index === participants.length - 1 && participants.length % 2 !== 0;
          
          return (
            <div 
              key={participant.sessionId}
              className={`
                h-[calc(50vh-60px)]
                ${isLastAndOdd ? 'col-span-2 mx-auto w-1/2' : 'w-full'}
              `}
            >
              <div className="relative size-full">
                <ParticipantView
                  participant={participant}
                  className="size-full rounded-lg overflow-hidden bg-dark-1"
                />
                {participant === localParticipant && (
                  <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-sm">
                    You
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
 } return null;
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
    <section className="relative h-screen w-full overflow-hidden text-white">
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
      <div className="fixed bottom-1 md:bottom-2 flex w-full flex-wrap items-center justify-center">
  <div className="flex items-center gap-1 md:gap-2 rounded-full bg-[#19232d]/80 backdrop-blur-sm px-1 py-1 md:px-3 md:py-2">
    <CallControls 
      onLeave={() => router.push(`/`)} 
    />
    
    <div className="hidden lg:flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger className="cursor-pointer rounded-full bg-[#19232d] p-2.5 hover:bg-[#4c535b]">
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
        <div className="cursor-pointer rounded-full bg-[#19232d] p-2.5 hover:bg-[#4c535b]">
          <Users size={20} className="text-white" />
        </div>
      </button>
    </div>

    {!isPersonalRoom && <EndCallButton />}
  </div>
 </div> 
  </section>
 );
};

export default MeetingRoom;