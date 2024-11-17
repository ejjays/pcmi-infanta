import React from 'react';
import { useCallStateHooks, ParticipantView } from '@stream-io/video-react-sdk';

const CustomSpotlightLayout = () => {
  const { useCallParticipants } = useCallStateHooks();
  const participants = useCallParticipants();

  const mainParticipant = participants?.[0]; // Assuming the first participant is the spotlight
  const otherParticipants = participants?.slice(1) || [];

  return (
    <div className="spotlight-layout">
      {mainParticipant && (
        <div className="main-participant">
          {/* Main participant video stream */}
          <ParticipantView participant={mainParticipant} />
        </div>
      )}
      <div className="other-participants">
        {otherParticipants.map((participant) => (
          <div key={participant.sessionId} className="participant">
            {/* Other participants video stream */}
            <ParticipantView participant={participant} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomSpotlightLayout;