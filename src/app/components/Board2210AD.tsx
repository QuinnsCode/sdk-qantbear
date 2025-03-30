"use client";

import { useState, useEffect } from "react";

interface Player {
  userId: string;
  name: string;
  joinedAt: number;
  isActive: boolean;
}

enum GamePhase {
  SETUP = 'setup',
  PHASE_1 = 'phase_1',
  PHASE_2 = 'phase_2',
  PHASE_3 = 'phase_3',
  PHASE_4 = 'phase_4',
  PHASE_5 = 'phase_5',
  PHASE_6 = 'phase_6',
  GAME_OVER = 'game_over'
}

interface GameState {
  players: Player[];
  currentTurn: number;
  currentPhase: GamePhase;
  currentPlayerIndex: number;
  gameStarted: boolean;
  gameOver: boolean;
  winner: string | null;
  board: any;
  lastUpdated: number;
}

interface Board2210ADProps {
  initialGameState: GameState | null;
  gameId: string;
}

export const Board2210AD = ({
  props,
}: {
  props: { 
    initialGameState: GameState; 
    gameId: string 
  };
}) => {
  const { gameId, initialGameState } = props;
  
  // State for the game
  const [gameState, setGameState] = useState<GameState | null>(initialGameState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState('');
  const [userId, setUserId] = useState<string | null>(null);

  // Load user ID from localStorage if available
  useEffect(() => {
    const storedUserId = localStorage.getItem(`game_${gameId}_userId`);
    const storedName = localStorage.getItem(`game_${gameId}_playerName`);
    
    if (storedUserId) {
      setUserId(storedUserId);
    }
    
    if (storedName) {
      setPlayerName(storedName);
    }
  }, [gameId]);

  // Poll for game state updates
  useEffect(() => {
    if (!gameId) return;
    
    const fetchGameState = async () => {
      try {
        const response = await fetch(`/api/board-game/${gameId}/state`);
        if (!response.ok) {
          throw new Error('Failed to fetch game state');
        }
        
        const newState = await response.json();
        setGameState(newState);
        setError(null);
      } catch (err) {
        console.error('Error fetching game state:', err);
        setError('Failed to update game state. Please refresh the page.');
      }
    };
    
    // Poll every 2 seconds
    // const intervalId = setInterval(fetchGameState, 2000);
    
    // return () => clearInterval(intervalId);
  }, [gameId]);

 // Only update if the initialGameState is significantly different
 useEffect(() => {
  // Compare key aspects of the game state to prevent unnecessary updates
  const stateChanged = gameState && (
    initialGameState.currentTurn !== gameState.currentTurn ||
    initialGameState.currentPhase !== gameState.currentPhase ||
    initialGameState.players.length !== gameState.players.length
  );
  
  if (stateChanged) {
    setGameState(initialGameState);
  }
}, [initialGameState, gameState?.currentTurn, gameState?.currentPhase, gameState?.players.length]);
  
  // Handle joining the game
  const handleJoinGame = async () => {
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Generate a user ID if we don't have one
      const newUserId = userId || `user-${Date.now()}`;
      
      const response = await fetch(`/api/board-game/${gameId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: newUserId, name: playerName })
      });
      
      if (!response.ok) {
        throw new Error('Failed to join game');
      }
      
      const playerData = await response.json();
      
      // Save user ID to localStorage
      localStorage.setItem(`game_${gameId}_userId`, playerData.userId);
      localStorage.setItem(`game_${gameId}_playerName`, playerName);
      
      setUserId(playerData.userId);
      
      // Refresh game state
      const stateResponse = await fetch(`/api/board-game/${gameId}/state`);
      if (stateResponse.ok) {
        const newState = await stateResponse.json();
        setGameState(newState);
      }
    } catch (err) {
      console.error('Error joining game:', err);
      setError('Failed to join game. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle starting the game
  const handleStartGame = async () => {
    if (!userId) {
      setError('Please join the game first');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
        const response = await fetch(`/api/board-game/${gameId}/start`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId })
        });
      
      if (!response.ok) {
        throw new Error('Failed to start game');
      }
      
      const newState = await response.json();
      setGameState(newState);
    } catch (err) {
      console.error('Error starting game:', err);
      setError('Failed to start game. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle advancing to the next phase
  const handleNextPhase = async () => {
    if (!userId) {
      setError('Please join the game first');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
        const response = await fetch(`/api/board-game/${gameId}/next-phase`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId })
          });
      
      if (!response.ok) {
        throw new Error('Failed to advance phase');
      }
      
      const newState = await response.json();
      setGameState(newState);
    } catch (err) {
      console.error('Error advancing phase:', err);
      setError('Failed to advance phase. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get the display name for the current phase
  const getPhaseDisplayName = (phase: GamePhase): string => {
    switch (phase) {
      case GamePhase.SETUP: return 'Setup';
      case GamePhase.PHASE_1: return 'Phase 1';
      case GamePhase.PHASE_2: return 'Phase 2';
      case GamePhase.PHASE_3: return 'Phase 3';
      case GamePhase.PHASE_4: return 'Phase 4';
      case GamePhase.PHASE_5: return 'Phase 5';
      case GamePhase.PHASE_6: return 'Phase 6';
      case GamePhase.GAME_OVER: return 'Game Over';
      default: return 'Unknown';
    }
  };

  // Check if it's the current user's turn
  const isUserTurn = () => {
    if (!gameState || !userId) return false;
    
    const activePlayers = gameState.players.filter(p => p.isActive);
    const currentPlayer = activePlayers[gameState.currentPlayerIndex];
    
    return currentPlayer && currentPlayer.userId === userId;
  };

  // Get current player name
  const getCurrentPlayerName = () => {
    if (!gameState) return 'Unknown';
    
    const activePlayers = gameState.players.filter(p => p.isActive);
    const currentPlayer = activePlayers[gameState.currentPlayerIndex];
    
    return currentPlayer ? currentPlayer.name : 'Unknown';
  };


  // Render login form if user hasn't joined yet
  if (!userId) {
    return (
      <div>
        <h1>Join Game</h1>
        
        {error && <p><strong>Error:</strong> {error}</p>}
        
        <div>
          <label htmlFor="playerName">Your Name: </label>
          <input
            type="text"
            id="playerName"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            disabled={loading}
          />
        </div>
        
        <button
          onClick={handleJoinGame}
          disabled={loading}
        >
          {loading ? 'Joining...' : 'Join Game'}
        </button>
      </div>
    );
  }

  // Loading state
  if (!gameState) {
    return (
      <div>
        <h1>Loading...</h1>
        <p>Please wait while we load the game state.</p>
      </div>
    );
  }

  return (
    <div>
      <h1>Game #{gameId}</h1>
      
      {error && <p><strong>Error:</strong> {error}</p>}
      
      {/* Game status */}
      <h2>Game Status</h2>
      <p>
        <strong>Status:</strong> {
          !gameState.gameStarted ? 'Waiting to Start' :
          gameState.gameOver ? 'Game Over' : 'In Progress'
        }
      </p>
      <p><strong>Your Name:</strong> {playerName}</p>
      <p><strong>Turn:</strong> {gameState.currentTurn}</p>
      <p><strong>Phase:</strong> {getPhaseDisplayName(gameState.currentPhase as GamePhase)}</p>
      <p>
        <strong>Current Player:</strong> {getCurrentPlayerName()}
        {isUserTurn() && ' (YOUR TURN)'}
      </p>
      <p><strong>Last Updated:</strong> {new Date(gameState.lastUpdated).toLocaleTimeString()}</p>
      
      {/* Game controls */}
      <h2>Game Controls</h2>
      <div>
        {!gameState.gameStarted && (
          <button 
            onClick={handleStartGame}
            disabled={loading || gameState.players.length < 2}
          >
            {loading ? 'Starting...' : 'Start Game'}
          </button>
        )}
        
        {gameState.gameStarted && !gameState.gameOver && isUserTurn() && (
          <button 
            onClick={handleNextPhase}
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Next Phase'}
          </button>
        )}
      </div>
      
      {/* Players list */}
      <h2>Players</h2>
      <div>
        {gameState.players.map(player => (
          <div key={player.userId}>
            <h3>
              {player.name}
              {player.userId === userId && ' (You)'}
              {!player.isActive && ' (Disconnected)'}
            </h3>
            <p>Joined: {new Date(player.joinedAt).toLocaleString()}</p>
          </div>
        ))}
      </div>
      
      {/* Game board visualization */}
      <h2>Game Board</h2>
      <div>
        <p>Your game board visualization will go here</p>
      </div>
      
      {/* Debug information */}
      <h2>Debug: Game State</h2>
      <pre>
        {JSON.stringify(gameState, null, 2)}
      </pre>
    </div>
  );
};