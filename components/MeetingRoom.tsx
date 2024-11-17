'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CallControls,
  CallingState,
  PaginatedGridLayout,
  SpeakerLayout,
  useCallStateHooks,
} from '@stream-io/video-react-sdk';
// Removed unused imports for `Users` and `CallParticipantsList`
import Loader from './Loader';
import EndCallButton from './EndCallButton';
import CustomSpotlightLayout from './CustomSpotlightLayout'; // Import custom spotlight layout

type CallLayoutType = 'grid' | 'speaker-left' | 'speaker-right' | 'spotlight'; // Add 'spotlight'

const MeetingRoom = () => {
  const router = useRouter();
  const [layout] = useState<CallLayoutType>('grid');
  const { useCallCallingState } = useCallStateHooks();

  const callingState = useCallCallingState();

  if (callingState !== CallingState.JOINED) return <Loader />;

  const CallLayout = () => {
    switch (layout) {
      case 'grid':
        return <PaginatedGridLayout />;
      case 'speaker-right':
        return <SpeakerLayout participantsBarPosition="left" />;
      case 'spotlight':
        return <CustomSpotlightLayout />; // Use custom spotlight layout
      default:
        return <SpeakerLayout participantsBarPosition="right" />;
    }
  };

  return (
    <section className="relative h-screen w-full overflow-hidden pt-4 text-white">
      <div className="relative flex size-full items-center justify-center">
        <div className="flex size-full max-w-[1000px] items-center">
          <CallLayout />
        </div>
      </div>
      {/* video layout and call controls */}
      <div className="fixed bottom-5 flex w-full flex-wrap items-center justify-center gap-5 scale-90">
        <CallControls onLeave={() => router.push(`/`)} />
        {/* Hide CallStatsButton */}
        {/* <CallStatsButton /> */}
        {/* Hide Participants Button */}
        {/* <button onClick={() => setShowParticipants((prev) => !prev)}>
          <div className="cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b]">
            <Users size={20} className="text-white" />
          </div>
        </button> */}
        <EndCallButton />