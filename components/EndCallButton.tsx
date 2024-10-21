'use client';
import { useCall, useCallStateHooks } from '@stream-io/video-react-sdk';
import { useRouter } from 'next/navigation';

const EndCallButton = () => {
  const call = useCall();
  const router = useRouter();

  if (!call) {
    throw new Error('useStreamCall must be used within a StreamCall component.');
  }

  // https://getstream.io/video/docs/react/guides/call-and-participant-state/#participant-state-3
  const { useLocalParticipant } = useCallStateHooks();
  const localParticipant = useLocalParticipant();
  const isMeetingOwner = localParticipant && call.state.createdBy && localParticipant.userId === call.state.createdBy.id;

  if (!isMeetingOwner) {
    return null;
  }

  return null; // Remove this return statement if you want to display nothing for meeting owners
};

export default EndCallButton;