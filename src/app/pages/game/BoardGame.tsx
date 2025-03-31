"use client";

import { useState, useEffect } from "react";

export const BoardGame = ({
  props,
}: {
  props: { 
    initialGameState: any; 
    gameId: string 
  };
}) => {
  const { gameId, initialGameState } = props;
  
  const [gameState, setGameState] = useState(initialGameState);
  const [isClient, setIsClient] = useState(false);

  // Always update with latest server state
  useEffect(() => {
    setGameState(initialGameState);
  }, [initialGameState]);

  // Set client-side flag
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Minimal loading state
  if (!isClient) {
    return <div>Loading game...</div>;
  }

  return (
    <div>
      <h1>Game: {gameId}</h1>
      <pre>{JSON.stringify(gameState, null, 2)}</pre>
    </div>
  );
};