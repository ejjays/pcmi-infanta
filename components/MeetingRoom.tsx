'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CallControls,
  CallingState,
  PaginatedGridLayout,
  SpeakerLayout,
  useCallStateHooks,
  useCall,
} from '@stream-io/video-react-sdk';
import Loader from './Loader';
import EndCallButton from './EndCallButton'; 

type CallLayoutType = 'grid' | 'speaker-left' | 'speaker-right';

const MeetingRoom = () => {
  const router = useRouter();
  const [layout] = useState<CallLayoutType>('grid');
  const { useCallCallingState } = useCallStateHooks();
  const call = useCall();

  if (!call) { 
    throw new Error('useCall must be used within a StreamCall component');
  }  

  const callingState = useCallCallingState();

  if (callingState !== CallingState.JOINED) return <Loader />;

  const CallLayout = () => {
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
    </div>
      <div className="fixed bottom-5 flex w-full flex-wrap items-center justify-center gap-5 scale-90">
        <CallControls onLeave={() => router.push(`/`)} />
        <EndCallButton />
      </div>
    </section>
  );
};

export default MeetingRoom;