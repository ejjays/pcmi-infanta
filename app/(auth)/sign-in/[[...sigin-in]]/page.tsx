import { SignIn } from '@clerk/nextjs';
import { useEffect } from 'react';

export default function SignInPage() {
  useEffect(() => {
    const timer = setTimeout(() => {
      const swipeIndicator = document.getElementById('swipeIndicator');
      if (swipeIndicator) {
        swipeIndicator.classList.add('hidden');
      }
    }, 2900);

    return () => clearTimeout(timer); // Cleanup on unmount
  }, []);

  return (
    <main className="flex h-screen w-full items-center justify-center relative">
      <SignIn />
      {/* Swipe Indicator */}
      <div className="swipe-indicator" id="swipeIndicator">
        <span className="arrow">⟩⟩</span>
      </div>

      <style jsx>{`
        .swipe-indicator {
          position: absolute; /* Position it absolutely within the viewport */
          left: 20px; /* Space from the left edge */
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
