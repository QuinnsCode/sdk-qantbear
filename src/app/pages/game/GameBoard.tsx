"use client";
import { useCallback, useState, useEffect } from "react";
import debounce from "lodash/debounce";
import { updateBoard } from "./functions";
import { InviteWidget } from "@/app/components/InviteWidget";

export const GameBoard = ({
  props,
}: {
  props: { initialBoard: string[]; gameId: string };
}) => {
  const { gameId, initialBoard } = props;
  const [board, setBoard] = useState(initialBoard || Array(9).fill(null));
  const [currentLetter, setCurrentLetter] = useState('A');

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
      
      <InviteWidget />
      

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
      
      <div className="board-container">
        <div className="wood-frame">
          <div className="board">
            {board?.map((cell, index) => (
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