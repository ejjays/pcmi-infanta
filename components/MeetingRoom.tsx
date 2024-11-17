'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CallControls,
  CallingState,
  PaginatedGridLayout,
  SpeakerLayout,
  useCallStateHooks,
  ParticipantView,
} from '@stream-io/video-react-sdk';
import Loader from './Loader';
import EndCallButton from './EndCallButton';

type CallLayoutType = 'grid' | 'speaker-left' | 'speaker-right' | 'spotlight'; // Add 'spotlight'

const MeetingRoom = () => {
  const router = useRouter();
  const [layout] = useState<CallLayoutType>('spotlight'); // Set default to spotlight
  const { useCallCallingState, useParticipants } = useCallStateHooks();

  const callingState = useCallCallingState();

  if (callingState !== CallingState.JOINED) return <Loader />;

  const CallLayout = () => {
    switch (layout) {
      case 'grid':
        return <PaginatedGridLayout />;
      case 'speaker-left':
        return <SpeakerLayout participantsBarPosition="left" />;
      case 'spotlight':
        return <SpotlightLayout />; // Use custom spotlight layout
      default:
        return <SpeakerLayout participantsBarPosition="right" />;
    }
  };

  const SpotlightLayout = () => {
    const participants = useParticipants();
    const participantInSpotlight = participants[0]; // Assuming the first participant is in spotlight

    return (
      <div className="spotlight-layout">
        {participantInSpotlight && (
          <ParticipantView participant={participantInSpotlight} />
        )}
        <div className="participants-bar">
          {participants.slice(1).map(participant => (
            <ParticipantView key={participant.sessionId} participant={participant} />
          ))}
        </div>
      </div>
    );
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
      </div>
    </section>
  );
};

export default MeetingRoom;