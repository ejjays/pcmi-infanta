"use client"; // This line marks the component as a Client Component

import { SignIn } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

export default function SignInPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate a loading phase (if needed)
    const timer = setTimeout(() => {
      setLoading(false);
    }, 100); // Adjust this timeout as needed

    // After 3 seconds, hide the swipe indicator
    const swipeTimer = setTimeout(() => {
      const swipeIndicator = document.getElementById('swipeIndicator');
      if (swipeIndicator) {
        swipeIndicator.classList.add('hidden');
      }
    }, 2900);

    return () => {
      clearTimeout(timer);
      clearTimeout(swipeTimer); // Cleanup both timers
    };
  }, []);

  return (
    <main className="flex h-screen w-full items-center justify-center relative">
      <SignIn />
      {/* Swipe Indicator */}
      {loading && (
        <div className="swipe-indicator" id="swipeIndicator">
          <span className="arrow">⟩⟩</span>
        </div>
      )}

      <style jsx>{`
        .swipe-indicator {
          position: absolute; /* Position it absolutely within the viewport */
          left: 20px; /* Space from the left edge */
          top: 20px; /* Position it at the top */
          animation: swipe 1.5s infinite;
        }

        @keyframes swipe {
          0% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(20px);
          }
          100% {
            transform: translateX(0);
          }
        }

        .arrow {
          color: rgba(128, 128, 128, 0.7); /* Gray transparent color for the arrow */
          font-size: 48px; /* Adjust size as needed */
          font-weight: bold; /* Make it bold */
        }

        /* Class to hide the swipe indicator */
        .hidden {
          opacity: 0; /* Fade out effect */
          transition: opacity 1s; /* Smooth transition for hiding */
        }
      `}</style>
    </main>
  );
}