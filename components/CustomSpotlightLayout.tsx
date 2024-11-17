import React from 'react';
import { useCallStateHooks, ParticipantVideo } from '@stream-io/video-react-sdk';

const CustomSpotlightLayout = () => {
  const { useParticipants } = useCallStateHooks();
  const participants = useParticipants();

  const mainParticipant = participants[0]; // Assuming the first participant is the spotlight
  const otherParticipants = participants.slice(1);

  return (
    <div className="spotlight-layout">
      {mainParticipant && (
        <div className="main-participant">
          {/* Main participant video stream */}
          <ParticipantVideo participant={mainParticipant} />
        </div>
      )}
      <div className="other-participants">
        {otherParticipants.map(participant => (
          <div key={participant.id} className="participant">
            {/* Other participants video stream */}
            <ParticipantVideo participant={participant} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomSpotlightLayout;