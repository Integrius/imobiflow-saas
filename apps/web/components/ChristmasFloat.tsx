'use client';

import { useState, useEffect } from 'react';

export default function ChristmasFloat() {
  const [isVisible, setIsVisible] = useState(true);
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    // Mostra a mensagem após 2 segundos
    const timer = setTimeout(() => {
      setShowMessage(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <>
      <style jsx>{`
        @keyframes floatAround {
          0% {
            transform: translate(0, 0) rotate(0deg) scale(1);
          }
          10% {
            transform: translate(15vw, 10vh) rotate(5deg) scale(1.05);
          }
          25% {
            transform: translate(40vw, -5vh) rotate(-3deg) scale(0.95);
          }
          40% {
            transform: translate(70vw, 15vh) rotate(8deg) scale(1.08);
          }
          55% {
            transform: translate(85vw, 40vh) rotate(-5deg) scale(0.98);
          }
          70% {
            transform: translate(60vw, 65vh) rotate(4deg) scale(1.02);
          }
          85% {
            transform: translate(25vw, 50vh) rotate(-6deg) scale(1.05);
          }
          100% {
            transform: translate(0, 0) rotate(0deg) scale(1);
          }
        }

        @keyframes messageSlide {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }

        .float-container {
          position: fixed;
          top: 10%;
          left: 5%;
          z-index: 9999;
          pointer-events: none;
          animation: floatAround 45s ease-in-out infinite;
        }

        .santa-image {
          width: 150px;
          height: auto;
          filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.3));
          pointer-events: all;
          cursor: pointer;
          transition: transform 0.3s ease;
        }

        .santa-image:hover {
          transform: scale(1.15);
          animation: pulse 1s ease-in-out infinite;
        }

        .message-bubble {
          position: absolute;
          top: 50%;
          left: 170px;
          transform: translateY(-50%);
          background: linear-gradient(135deg, #c41e3a 0%, #165b33 100%);
          color: white;
          padding: 16px 24px;
          border-radius: 20px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
          font-weight: bold;
          font-size: 16px;
          white-space: nowrap;
          pointer-events: all;
          animation: messageSlide 0.5s ease-out;
        }

        .message-bubble::before {
          content: '';
          position: absolute;
          left: -10px;
          top: 50%;
          transform: translateY(-50%);
          width: 0;
          height: 0;
          border-top: 10px solid transparent;
          border-bottom: 10px solid transparent;
          border-right: 10px solid #c41e3a;
        }

        .close-button {
          position: absolute;
          top: -8px;
          right: -8px;
          background: rgba(255, 255, 255, 0.9);
          color: #c41e3a;
          border: none;
          border-radius: 50%;
          width: 28px;
          height: 28px;
          font-size: 18px;
          font-weight: bold;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: all;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
          transition: all 0.2s ease;
          z-index: 10000;
        }

        .close-button:hover {
          background: white;
          transform: scale(1.15);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        .message-text {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        @media (max-width: 768px) {
          .float-container {
            top: 5%;
            left: 2%;
          }

          .santa-image {
            width: 100px;
          }

          .message-bubble {
            left: 120px;
            font-size: 14px;
            padding: 12px 18px;
            white-space: normal;
            max-width: 200px;
          }

          @keyframes floatAround {
            0% {
              transform: translate(0, 0) rotate(0deg) scale(1);
            }
            25% {
              transform: translate(30vw, 10vh) rotate(-3deg) scale(1.05);
            }
            50% {
              transform: translate(60vw, 30vh) rotate(5deg) scale(0.95);
            }
            75% {
              transform: translate(30vw, 50vh) rotate(-4deg) scale(1.02);
            }
            100% {
              transform: translate(0, 0) rotate(0deg) scale(1);
            }
          }
        }
      `}</style>

      <div className="float-container">
        <button
          onClick={() => setIsVisible(false)}
          className="close-button"
          aria-label="Fechar"
          title="Fechar mensagem de Natal"
        >
          ×
        </button>

        <img
          src="/Santa%20Claus.png"
          alt="Papai Noel"
          className="santa-image"
          onClick={() => setShowMessage(!showMessage)}
        />

        {showMessage && (
          <div className="message-bubble">
            <div className="message-text">
              <span>🎄</span>
              <span>Feliz Natal! Boas Festas! 🎅</span>
              <span>🎁</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
