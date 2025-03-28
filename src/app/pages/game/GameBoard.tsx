"use client";

import { useCallback, useState, useEffect } from "react";
import debounce from "lodash/debounce";
import { updateBoard } from "./functions";
import { InviteWidget } from "../../components/InviteWidget";
import { gameStyles } from './styles';

export const GameBoard = ({
  props,
}: {
  props: { initialBoard: string[]; gameId: string };
}) => {
  const { gameId, initialBoard } = props;
  const [board, setBoard] = useState(initialBoard || Array(9).fill(null));
  const [currentLetter, setCurrentLetter] = useState('A');
  const [hoveredCell, setHoveredCell] = useState<number | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Check if we're in the browser
  useEffect(() => {
    setIsClient(true);
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

  // Check if all squares are filled with the same letter
  const checkWinCondition = (boardToCheck: string[]) => {
    // First check if all cells are filled
    const allFilled = boardToCheck.every(cell => cell !== null && cell !== '');
    
    if (!allFilled) return false;
    
    // Then check if all cells have the same letter
    const firstLetter = boardToCheck[0];
    return boardToCheck.every(cell => cell === firstLetter);
  };

  // Celebrate win with an alert instead of confetti
  const celebrateWin = () => {
    if (typeof window !== 'undefined') {
      alert('Congratulations! You filled the board with all ' + currentLetter + '!');
    }
  };

  const handleCellClick = (index: number) => {
    const newBoard = [...board];
    newBoard[index] = currentLetter;
    setBoard(newBoard); // Always update local state
    debouncedUpdate(newBoard); // Send the latest version
    
    // Check for win condition after updating the board
    if (checkWinCondition(newBoard)) {
      celebrateWin();
    }
  };

  const handleLetterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentLetter(e.target.value);
  };

  // Generate all letters from A to Z
  const letters = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));

  // Use a try-catch for rendering to help identify issues
  try {
    return (
      <div style={gameStyles?.pageContainer || {}}>
        {isClient && <InviteWidget />}
        
        <div style={gameStyles?.gameInfo || {}}>
          <h1 style={gameStyles?.gameTitle || {}}>Game: {gameId}</h1>
          <div style={gameStyles?.playerLetter || {}}>
            Choose a Letter: 
            <select 
              style={gameStyles?.letterSelector || {}} 
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
        
        <div style={gameStyles?.boardContainer || {}}>
          <div style={gameStyles?.woodFrame || {}}>
            <div style={gameStyles?.board || {}}>
              {board?.map((cell, index) => (
                <div 
                  key={index} 
                  style={{
                    ...(gameStyles?.cell || {}),
                    ...(hoveredCell === index ? gameStyles?.cellHover || {} : {})
                  }}
                  onClick={() => handleCellClick(index)}
                  onMouseEnter={() => isClient && setHoveredCell(index)}
                  onMouseLeave={() => isClient && setHoveredCell(null)}
                >
                  {cell || ''}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Render error:", error);
    return <div>Something went wrong rendering the game board. Please try refreshing.</div>;
  }
};