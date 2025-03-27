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
  const [userId, setUserId] = useState('');

  // Get the userId from URL parameters or cookies
  useEffect(() => {
    // Check URL parameters first
    const urlParams = new URLSearchParams(window.location.search);
    let id = urlParams.get('userId');
    
    // If not in URL, check cookies
    if (!id) {
      const cookies = document.cookie.split('; ');
      const userIdCookie = cookies.find(cookie => cookie.startsWith('userId='));
      if (userIdCookie) {
        id = userIdCookie.split('=')[1];
      }
    }
    
    // If still no userId, we have a problem
    if (!id) {
      console.error("No userId found. Game updates won't work.");
    } else {
      setUserId(id);
    }
  }, []);

  // Always take the latest version from the server
  useEffect(() => {
    setBoard(initialBoard || Array(9).fill(null));
  }, [initialBoard]);
  
  // Generate random letter when component mounts
  useEffect(() => {
    const randomLetter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
    setCurrentLetter(randomLetter);
  }, []);

  const debouncedUpdate = useCallback((newBoard: string[]) => {
    if (!userId) {
      console.error("No userId available. Can't update board.");
      return;
    }
    
    console.log("Updating board on server with:", newBoard, "userId:", userId);
    updateBoard(gameId, newBoard).catch(error => {
      console.error("Error updating board:", error);
    });
  }, [gameId, userId]);

  const handleCellClick = (index: number) => {
    console.log(`Cell ${index} clicked with letter ${currentLetter}`);
    const newBoard = [...board];
    newBoard[index] = currentLetter;
    console.log("Updated local board:", newBoard);
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
        /* Your existing styles */
      `}</style>
      <div className="game-info">
        <h1 className="game-title">Game: {gameId} {userId ? `(${userId.substring(0, 6)}...)` : ''}</h1>
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