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

const MeetingRoom = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isPersonalRoom = !!searchParams.get('personal');
  const [layout, setLayout] = useState<CallLayoutType>('grid');
  const [showParticipants, setShowParticipants] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false); // Added screen sharing state
  const { useCallCallingState } = useCallStateHooks();
  const call = useCall();

  if (!call) {
    throw new Error('useCall must be used within a StreamCall component');
  }

  const callingState = useCallCallingState();

  if (callingState !== CallingState.JOINED) return <Loader />;

  // Add this effect to detect screen sharing
  useEffect(() => {
    const handleScreenShare = () => {
      setIsScreenSharing(call?.state.screenShareEnabled || false);
      // Switch to speaker layout on desktop only
      if (window.innerWidth >= 1024) { // lg breakpoint
        setLayout('speaker-left');
      }
    };

    call?.on('screenShareEnabled', handleScreenShare);
    call?.on('screenShareDisabled', () => setIsScreenSharing(false));
    
    return () => {
      call?.off('screenShareEnabled', handleScreenShare);
      call?.off('screenShareDisabled', () => setIsScreenSharing(false));
    };
  }, [call]);

  const CallLayout = () => {
  // On mobile, always use grid layout for better screen sharing display
  if (window.innerWidth < 1024) {
    return <PaginatedGridLayout />;
  }

  // On desktop, use the selected layout
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
        
        {/* Desktop-only controls */}
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