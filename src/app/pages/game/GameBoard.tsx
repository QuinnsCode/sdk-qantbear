"use client";
import { useCallback, useState, useEffect } from "react";
import debounce from "lodash/debounce";
import { updateBoard } from "./functions";

export const GameBoard = ({
  props,
}: {
  props: { initialBoard: string[]; gameId: string };
}) => {
  const { gameId, initialBoard } = props;
  const [board, setBoard] = useState(initialBoard || Array(9).fill(null));
  const [currentLetter, setCurrentLetter] = useState('A');
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteStatus, setInviteStatus] = useState('');

  // Always take the latest version from the server
  useEffect(() => {
    setBoard(initialBoard || Array(9).fill(null));
  }, [initialBoard]);
  
  // Generate random letter when component mounts
  useEffect(() => {
    const randomLetter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
    setCurrentLetter(randomLetter);
  }, []);

  const debouncedUpdate = useCallback(
    debounce(async (newBoard: string[]) => {
      try {
        await updateBoard(gameId, newBoard);
      } catch (error) {
        console.error("Error updating board:", error);
      }
    }, 100),
    [gameId],
  );

  const handleCellClick = (index: number) => {
    const newBoard = [...board];
    newBoard[index] = currentLetter;
    setBoard(newBoard); // Always update local state
    debouncedUpdate(newBoard); // Send the latest version
  };

  const handleLetterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentLetter(e.target.value);
  };

  // Generate all letters from A to Z
  const letters = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));
  
  // Handle invite button click
  const toggleInvite = () => {
    setShowInvite(!showInvite);
    setInviteStatus('');
  };
  
  // Handle email input change
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInviteEmail(e.target.value);
  };
  
  // Handle sending invitation
  const sendInvite = async () => {
    if (!inviteEmail || !inviteEmail.includes('@')) {
      setInviteStatus('Please enter a valid email address');
      return;
    }
    
    try {
      const currentUrl = window.location.href;
      
      // Create email content
      const subject = "Invitation to join my game";
      const body = `You are invited to join my game at:\n${currentUrl}\n\n-Ryan's RW SDK Durable Objects Realtime testing`;
      
      // Create mailto link and open it
      const mailtoLink = `mailto:${inviteEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.open(mailtoLink);
      
      setInviteStatus('Email client opened successfully!');
      setTimeout(() => {
        setShowInvite(false);
        setInviteEmail('');
        setInviteStatus('');
      }, 2000);
    } catch (error) {
      console.error("Error opening email client:", error);
      setInviteStatus('Failed to open email client. Please try again.');
    }
  };

  return (
    <div className="page-container">
      {showInvite && (
        <>
          <div className="modal-overlay" onClick={toggleInvite}></div>
          <div className="invite-modal">
            <h2 className="invite-title">Invite a Friend to Play</h2>
            <div className="invite-form">
              <input
                type="email"
                className="invite-input"
                placeholder="Enter friend's email"
                value={inviteEmail}
                onChange={handleEmailChange}
              />
              <div className="invite-actions">
                <button className="cancel-button" onClick={toggleInvite}>
                  Cancel
                </button>
                <button className="send-button" onClick={sendInvite}>
                  Send Invite
                </button>
              </div>
              {inviteStatus && (
                <div className={`status-message ${inviteStatus.includes('successfully') ? 'success' : 'error'}`}>
                  {inviteStatus}
                </div>
              )}
              <div className="note">
                (This will open your default email application)
              </div>
            </div>
          </div>
        </>
      )}
      
      <div className="invite-container">
        <button className="invite-button" onClick={toggleInvite}>
          Invite a Friend
        </button>
      </div>
      
      <style jsx>{`
        .page-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 10px;
          background-color: #f8f8f8;
          min-height: 100vh;
          max-height: 100vh;
          overflow: hidden;
        }
        
        .game-info {
          display: flex;
          justify-content: space-between;
          width: 90vmin;
          max-width: 600px;
          margin-bottom: 10px;
          font-family: 'Georgia', serif;
          color: #5d4037;
        }
        
        .game-title {
          font-family: 'Georgia', serif;
          color: #5d4037;
          margin-bottom: 10px;
          text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
          font-size: 1.5rem;
        }
        
        .board-container {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
          max-width: 100%;
          margin: 0;
        }
        
        .wood-frame {
          width: 90vmin;
          height: 90vmin;
          max-width: 600px;
          max-height: 600px;
          padding: 12px;
          background-image: linear-gradient(30deg, #8b5a2b 0%, #a67c52 25%, #b38b60 50%, #a67c52 75%, #8b5a2b 100%);
          box-shadow: 
            0 8px 16px rgba(0,0,0,0.3),
            inset 0 0 10px rgba(0,0,0,0.4),
            inset 0 0 40px rgba(255,255,255,0.1);
          border: 2px solid #6d4c41;
          border-radius: 8px;
          position: relative;
        }
        
        .wood-frame::before {
          content: '';
          position: absolute;
          top: 6px;
          left: 6px;
          right: 6px;
          bottom: 6px;
          border: 4px solid rgba(105, 58, 26, 0.5);
          border-radius: 4px;
          pointer-events: none;
          box-shadow: inset 0 0 15px rgba(0,0,0,0.2);
        }
        
        .board {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          grid-template-rows: repeat(3, 1fr);
          gap: 6px;
          width: 100%;
          height: 100%;
          padding: 6px;
          background-color: #e8d0aa;
          border-radius: 4px;
        }
        
        .cell {
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: #f5f0e1;
          border: 2px solid #d7b78f;
          font-size: 4rem;
          font-weight: bold;
          color: #5d4037;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: inset 0 0 10px rgba(0,0,0,0.1);
        }
        
        .cell:hover {
          background-color: #f9f5e8;
          box-shadow: inset 0 0 15px rgba(0,0,0,0.15);
          transform: scale(0.98);
        }
        
        .loading {
          opacity: 0.7;
        }
        
        .letter-selector {
          padding: 8px 12px;
          font-size: 1rem;
          font-family: 'Georgia', serif;
          background-color: #f5f0e1;
          border: 2px solid #d7b78f;
          color: #5d4037;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .letter-selector:hover {
          background-color: #f9f5e8;
          box-shadow: 0 3px 6px rgba(0,0,0,0.15);
        }
        
        .player-letter {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .invite-container {
          position: absolute;
          top: 10px;
          right: 10px;
          z-index: 10;
        }
        
        .invite-button {
          padding: 8px 16px;
          font-size: 1rem;
          font-family: 'Georgia', serif;
          background-color: #8b5a2b;
          color: #f5f0e1;
          border: 2px solid #6d4c41;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .invite-button:hover {
          background-color: #a67c52;
          box-shadow: 0 3px 6px rgba(0,0,0,0.3);
        }
        
        .invite-modal {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background-color: #f5f0e1;
          border: 4px solid #8b5a2b;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 8px 16px rgba(0,0,0,0.3);
          z-index: 100;
          width: 90%;
          max-width: 400px;
        }
        
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0,0,0,0.5);
          z-index: 90;
        }
        
        .invite-form {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
        
        .invite-title {
          font-family: 'Georgia', serif;
          color: #5d4037;
          margin-top: 0;
          margin-bottom: 15px;
          font-size: 1.3rem;
        }
        
        .invite-input {
          padding: 10px;
          font-size: 1rem;
          border: 2px solid #d7b78f;
          border-radius: 4px;
          font-family: sans-serif;
        }
        
        .invite-actions {
          display: flex;
          justify-content: space-between;
          margin-top: 10px;
        }
        
        .send-button {
          padding: 8px 16px;
          font-size: 1rem;
          font-family: 'Georgia', serif;
          background-color: #8b5a2b;
          color: #f5f0e1;
          border: 2px solid #6d4c41;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .send-button:hover {
          background-color: #a67c52;
        }
        
        .cancel-button {
          padding: 8px 16px;
          font-size: 1rem;
          font-family: 'Georgia', serif;
          background-color: #f5f0e1;
          color: #5d4037;
          border: 2px solid #d7b78f;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .cancel-button:hover {
          background-color: #f9f5e8;
        }
        
        .status-message {
          margin-top: 10px;
          font-family: 'Georgia', serif;
          font-size: 0.9rem;
          text-align: center;
        }
        
        .success {
          color: #2e7d32;
        }
        
        .error {
          color: #c62828;
        }
        
        .note {
          font-size: 0.8rem;
          color: #777;
          text-align: center;
          margin-top: 5px;
          font-style: italic;
        }
        
        @media (max-width: 768px) {
          .game-title {
            font-size: 1.2rem;
          }
          
          .wood-frame {
            width: 95vmin;
            height: 95vmin;
          }
          
          .cell {
            font-size: 2.5rem;
          }
        }
        
        @media (max-width: 480px) {
          .cell {
            font-size: 2rem;
          }
          
          .letter-selector {
            padding: 6px 8px;
            font-size: 0.9rem;
          }
        }
      `}</style>
      <div className="game-info">
        <h1 className="game-title">Game: {gameId}</h1>
        <div className="player-letter">
          Choose a Letter: 
          <select 
            className="letter-selector" 
            value={currentLetter} 
            onChange={handleLetterChange}
          >
            {letters.map(letter => (
              <option key={letter} value={letter}>
                {letter}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="board-container">
        <div className="wood-frame">
          <div className="board">
            {board.map((cell, index) => (
              <div 
                key={index} 
                className="cell"
                onClick={() => handleCellClick(index)}
              >
                {cell || ''}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};