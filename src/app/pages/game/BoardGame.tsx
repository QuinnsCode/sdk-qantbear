"use client";
import { TerritoryGraph } from "./TerritoryGraph";
import { useState, useEffect } from "react";

export const BoardGame = ({
  initialGameState,
  gameId,
}: {
  initialGameState: any;
  gameId: string;
}) => {
  const [gameState, setGameState] = useState(initialGameState);
  const [inputUserId, setInputUserId] = useState("");
  const [hasJoined, setHasJoined] = useState(false);

  useEffect(() => {
    console.log("Game State:", gameState);
    console.log("Has Joined:", hasJoined);
  }, [gameState, hasJoined]);
  
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUserId = localStorage.getItem("userId");
  
      const fetchGameState = async () => {
        try {
          const response = await fetch(`/api/boardGame/${gameId}/state`);
          if (response.ok) {
            const gameStateData = await response.json();
            setGameState(gameStateData);
  
            if (storedUserId && gameStateData.players.includes(storedUserId)) {
              setInputUserId(storedUserId);
              setHasJoined(true);
            }
          }
        } catch (error) {
          console.error("Error fetching game state:", error);
        }
      };
  
      fetchGameState();
    }
  }, [gameId]);

  
  const handleJoinGame = async () => {
    try {
      // Check if the user is already in the game
      if (gameState?.players?.includes(inputUserId)) {
        alert("Name already in the game. Use another one"); 
        return;
      }
      const response = await fetch(`/api/boardGame/${gameId}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ proposedUserId: inputUserId }),
      });
  
      if (response.ok) {
        const data = await response.json();
        setHasJoined(true);
        localStorage.setItem("userId", inputUserId); // Save user ID locally
  
        // Fetch the updated game state
        const gameStateResponse = await fetch(`/api/boardGame/${gameId}/state`);
        if (gameStateResponse.ok) {
          const gameStateData = await gameStateResponse.json();
          setGameState(gameStateData);
        }
      } else {
        console.error("Failed to join game");
      }
    } catch (error) {
      console.error("Error joining game:", error);
    }
  };

  return (
    <div>
      <h1>Game: {gameId}</h1>
      <pre>
        {gameState ? JSON.stringify(gameState, null, 2) : 'Loading...'}
      </pre>
      {!hasJoined && (
        <div>
          <input
            type="text"
            placeholder="Enter your user ID"
            value={inputUserId}
            onChange={(e) => setInputUserId(e.target.value)}
          />
          <button onClick={handleJoinGame}>Join Game</button>
        </div>
      )}

      {/* Display TerritoryGraph if the player has joined */}
      {hasJoined && gameState?.nodes && gameState?.edges && (
        <TerritoryGraph nodes={gameState.nodes} edges={gameState.edges} />
      )}
    </div>
  );
};
