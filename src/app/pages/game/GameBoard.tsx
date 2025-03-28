"use client";
import { useCallback, useState, useEffect, useRef } from "react";
import debounce from "lodash/debounce";
import { updateBoard } from "./functions";
import { InviteWidget } from "@/app/components/InviteWidget";

// Import confetti conditionally to prevent server-side errors
let confetti: any = null;
if (typeof window !== 'undefined') {
  // Only import on the client side
  import('canvas-confetti').then((module) => {
    confetti = module.default;
  });
}

export const GameBoard = ({
  props,
}: {
  props: { initialBoard: string[]; gameId: string };
}) => {
  const { gameId, initialBoard } = props;

  //game state
  const [board, setBoard] = useState(initialBoard || Array(9).fill(null));

  //current player letter from the dropdown
  const [currentLetter, setCurrentLetter] = useState('A');

  //check for hydration
  const [isClient, setIsClient] = useState(false);

  // Add state for tracking win time
  const [hasWon, setHasWon] = useState(false);
  const [winTimestamp, setWinTimestamp] = useState<number | null>(null);
  const [cooldownSeconds, setCooldownSeconds] = useState<number | null>(null);
  const winCooldownMs = 60 * 1000; // 1 minutes in milliseconds

  const cellTimers = useRef<{[key: number]: NodeJS.Timeout}>({});

  // Set isClient to true when component mounts on client
  useEffect(() => {
    setIsClient(true);
    
    // Clear all timers when component unmounts
    return () => {
      Object.values(cellTimers.current).forEach(timer => clearTimeout(timer));
    };
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

  // Update the check win condition function
  const checkWinCondition = (boardToCheck: string[]) => {
    // First check if all cells are filled
    const allFilled = boardToCheck.every(cell => cell !== null && cell !== '');
    
    if (!allFilled) return false;
    
    // Then check if all cells have the same letter
    const firstLetter = boardToCheck[0];
    return boardToCheck.every(cell => cell === firstLetter);
  };

  // Update the celebrate win function
  const celebrateWin = () => {
    // If we already celebrated this win, don't repeat
    if (hasWon) return;
    
    const currentTime = Date.now();
    setHasWon(true);
    setWinTimestamp(currentTime);
    setCooldownSeconds(60); // Start at 60 seconds
    
    // Clear all timers when player wins
    Object.values(cellTimers.current).forEach(timer => clearTimeout(timer));
    cellTimers.current = {};
    
    // Set up the countdown timer
    const countdownInterval = setInterval(() => {
      setCooldownSeconds(prevSeconds => {
        if (prevSeconds === null || prevSeconds <= 1) {
          clearInterval(countdownInterval);
          setHasWon(false);
          setWinTimestamp(null);
          return null;
        }
        return prevSeconds - 1;
      });
    }, 1000);
    
    // Store the interval for cleanup
    const intervalId = countdownInterval as unknown as number;
    
    // Clean up when component unmounts
    useEffect(() => {
      return () => {
        if (intervalId) clearInterval(intervalId);
      };
    }, [intervalId]);
    
    // Confetti animation
    if (!confetti || typeof window === 'undefined') {
      // Fallback if confetti isn't available
      alert(`Congratulations! You filled the board with all ${currentLetter}!`);
      return;
    }
    
    const duration = 3000;
    const end = currentTime + duration;

    (function frame() {
      confetti({
        particleCount: 7,
        angle: 60,
        spread: 55,
        origin: { x: 0.05, y: 0.65 }
      });
      
      confetti({
        particleCount: 7,
        angle: 120,
        spread: 55,
        origin: { x: 0.95, y: 0.65 }
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  };

  const setCellResetTimer = (index: number) => {
    // Clear any existing timer for this cell
    if (cellTimers.current[index]) {
      clearTimeout(cellTimers.current[index]);
    }
    
    // Set new timer to clear the cell after 5 seconds
    cellTimers.current[index] = setTimeout(() => {
      setBoard(prevBoard => {
        const newBoard = [...prevBoard];
        newBoard[index] = null;
        
        // Update the server after changing the board
        debouncedUpdate(newBoard);
        
        return newBoard;
      });
      
      // Remove the timer reference
      delete cellTimers.current[index];
    }, 5000);
  };

  // Update cell click handler
  const handleCellClick = (index: number) => {
    const newBoard = [...board];
    const oldBoard = [...board];
    newBoard[index] = currentLetter;
    setBoard(newBoard); // Always update local state
    debouncedUpdate(newBoard); // Send the latest version
    
    // Check if we're in the win cooldown period
    const inCooldown = hasWon && winTimestamp && (Date.now() - winTimestamp < winCooldownMs);
    
    // Set timer to reset this cell if we're not in the cooldown period
    if (!inCooldown) {
      setCellResetTimer(index);
    }
    
    // Check for win condition after updating the board
    const justWon = checkWinCondition(newBoard) && !checkWinCondition(oldBoard);
    
    if (justWon) {
      celebrateWin();
    }
  };

  const handleLetterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentLetter(e.target.value);
  };

  // Generate all letters from A to Z
  const letters = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));

  return (
    <div className="page-container">
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
          position: relative;
        }
        
        .cell:hover {
          background-color: #f9f5e8;
          box-shadow: inset 0 0 15px rgba(0,0,0,0.15);
          transform: scale(0.98);
        }
        
        .cell::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.1);
          border-radius: 2px;
          opacity: 0;
          transition: opacity 0.2s ease;
        }
        
        .cell.active::after {
          opacity: 1;
          animation: fade-out 5s linear forwards;
        }
        
        @keyframes fade-out {
          0% { opacity: 1; }
          100% { opacity: 0; }
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

        .game-rules {
          margin-top: 20px;
          font-family: 'Georgia', serif;
          color: #5d4037;
          text-align: center;
          max-width: 90vmin;
          font-size: 0.9rem;
        }

        .win-message {
          position: absolute;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          background-color: rgba(46, 125, 50, 0.9);
          color: white;
          padding: 10px 20px;
          border-radius: 8px;
          font-family: 'Georgia', serif;
          z-index: 100;
          box-shadow: 0 4px 8px rgba(0,0,0,0.2);
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
      
      {isClient && <InviteWidget />}
      
      <div className="game-info">
        <h1 className="game-title">Game: {gameId}</h1>
        <div className="player-letter">
          Choose a Letter: 
          <select 
            className="letter-selector" 
            value={currentLetter} 
            onChange={handleLetterChange}
          >
            {letters?.map(letter => (
              <option key={letter} value={letter}>
                {letter}
              </option>
            ))}
          </select>
        </div>
      </div>

      {cooldownSeconds !== null && (
        <div className="win-message">
          You won! The game will resume in {cooldownSeconds} seconds.
        </div>
      )}
      
      <div className="board-container">
        <div className="wood-frame">
          <div className="board">
            {board?.map((cell, index) => (
              <div 
                key={index} 
                className={`cell ${cell ? 'active' : ''}`}
                onClick={() => handleCellClick(index)}
              >
                {cell || ''}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="game-rules">
        Fill all cells with the same letter to win! But hurry - each cell will reset after 5 seconds.
      </div>
    </div>
  );
};