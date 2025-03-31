"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import debounce from "lodash/debounce";

interface Player {
  userId: string;
  name: string;
  joinedAt: number;
  isActive: boolean;
}

type GamePhase = 'setup' | 'phase_1' | 'phase_2' | 'phase_3' | 'phase_4' | 'phase_5' | 'phase_6' | 'game_over';

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

export const BoardGame = ({
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
  const [isClient, setIsClient] = useState(false);
  
  // Create ref for tracking polling interval
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Set isClient when component mounts on client
  useEffect(() => {
    setIsClient(true);
    
    // Clean up polling on unmount
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, []);

  // Load user ID from localStorage if available
  useEffect(() => {
    if (!isClient) return;
    
    const storedUserId = localStorage.getItem(`game_${gameId}_userId`);
    const storedName = localStorage.getItem(`game_${gameId}_playerName`);
    
    if (storedUserId) {
      setUserId(storedUserId);
    }
    
    if (storedName) {
      setPlayerName(storedName);
    }
  }, [gameId, isClient]);

  // Debounced fetch game state to prevent excessive API calls
  const debouncedFetchGameState = useCallback(
    debounce(async () => {
      if (!gameId) return;
      
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
    }, 300),
    [gameId]
  );

  // Poll for game state updates
  useEffect(() => {
    if (!gameId || !isClient) return;
    
    // Initial fetch
    debouncedFetchGameState();
    
    // Poll every 5 seconds
    pollingRef.current = setInterval(debouncedFetchGameState, 5000);
    
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [gameId, debouncedFetchGameState, isClient]);

  // Only update if the initialGameState is significantly different
  useEffect(() => {
    if (!gameState) {
      setGameState(initialGameState);
      return;
    }
    
    // Compare key aspects of the game state to prevent unnecessary updates
    const stateChanged = (
      initialGameState.currentTurn !== gameState.currentTurn ||
      initialGameState.currentPhase !== gameState.currentPhase ||
      initialGameState.players.length !== gameState.players.length ||
      initialGameState.lastUpdated > gameState.lastUpdated
    );
    
    if (stateChanged) {
      setGameState(initialGameState);
    }
  }, [initialGameState, gameState]);
  
  // Handle joining the game - with debounce to prevent double submission
  const handleJoinGame = useCallback(
    debounce(async () => {
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
        debouncedFetchGameState();
      } catch (err) {
        console.error('Error joining game:', err);
        setError('Failed to join game. Please try again.');
      } finally {
        setLoading(false);
      }
    }, 300),
    [playerName, userId, gameId, debouncedFetchGameState]
  );

  // Handle starting the game - with debounce
  const handleStartGame = useCallback(
    debounce(async () => {
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
    }, 300),
    [userId, gameId]
  );

  // Handle advancing to the next phase - with debounce
  const handleNextPhase = useCallback(
    debounce(async () => {
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
    }, 300),
    [userId, gameId]
  );

  // Helper function to get the display name for the current phase
  const getPhaseDisplayName = (phase: GamePhase): string => {
    const phaseNames: Record<GamePhase, string> = {
      'setup': 'Setup',
      'phase_1': 'Phase 1',
      'phase_2': 'Phase 2',
      'phase_3': 'Phase 3',
      'phase_4': 'Phase 4',
      'phase_5': 'Phase 5',
      'phase_6': 'Phase 6',
      'game_over': 'Game Over'
    };
    return phaseNames[phase] || 'Unknown';
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

  // If not yet hydrated on client, show minimal loading UI
  if (!isClient) {
    return <div>Loading game...</div>;
  }

  // Render login form if user hasn't joined yet
  if (!userId) {
    return (
      <div className="join-container">
        <h1>Join Game</h1>
        
        {error && <p className="error-message"><strong>Error:</strong> {error}</p>}
        
        <div className="form-group">
          <label htmlFor="playerName">Your Name: </label>
          <input
            type="text"
            id="playerName"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            disabled={loading}
            className="player-input"
          />
        </div>
        
        <button
          onClick={() => handleJoinGame()}
          disabled={loading}
          className="action-button"
        >
          {loading ? 'Joining...' : 'Join Game'}
        </button>
        
        <style jsx>{`
          .join-container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            font-family: sans-serif;
          }
          
          .error-message {
            color: #d32f2f;
            padding: 10px;
            background-color: #ffebee;
            border-radius: 4px;
            margin-bottom: 15px;
          }
          
          .form-group {
            margin-bottom: 20px;
          }
          
          .player-input {
            display: block;
            width: 100%;
            padding: 10px;
            font-size: 16px;
            border: 1px solid #ccc;
            border-radius: 4px;
            margin-top: 5px;
          }
          
          .action-button {
            background-color: #2196f3;
            color: white;
            border: none;
            padding: 12px 20px;
            font-size: 16px;
            border-radius: 4px;
            cursor: pointer;
          }
          
          .action-button:hover {
            background-color: #1976d2;
          }
          
          .action-button:disabled {
            background-color: #bbdefb;
            cursor: not-allowed;
          }
        `}</style>
      </div>
    );
  }

  // Loading state
  if (!gameState) {
    return (
      <div className="loading-container">
        <h1>Loading...</h1>
        <p>Please wait while we load the game state.</p>
        
        <style jsx>{`
          .loading-container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            text-align: center;
            font-family: sans-serif;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="game-container">
      <h1>Game #{gameId}</h1>
      
      {error && <p className="error-message"><strong>Error:</strong> {error}</p>}
      
      {/* Game status */}
      <div className="status-panel">
        <h2>Game Status</h2>
        <div className="status-grid">
          <div className="status-item">
            <span className="status-label">Status:</span>
            <span className="status-value">
              {!gameState.gameStarted ? 'Waiting to Start' :
              gameState.gameOver ? 'Game Over' : 'In Progress'}
            </span>
          </div>
          
          <div className="status-item">
            <span className="status-label">Your Name:</span>
            <span className="status-value">{playerName}</span>
          </div>
          
          <div className="status-item">
            <span className="status-label">Turn:</span>
            <span className="status-value">{gameState.currentTurn}</span>
          </div>
          
          <div className="status-item">
            <span className="status-label">Phase:</span>
            <span className="status-value">{getPhaseDisplayName(gameState.currentPhase as GamePhase)}</span>
          </div>
          
          <div className="status-item">
            <span className="status-label">Current Player:</span>
            <span className="status-value">
              {getCurrentPlayerName()}
              {isUserTurn() && <span className="your-turn"> (YOUR TURN)</span>}
            </span>
          </div>
          
          <div className="status-item">
            <span className="status-label">Last Updated:</span>
            <span className="status-value">{new Date(gameState.lastUpdated).toLocaleTimeString()}</span>
          </div>
        </div>
      </div>
      
      {/* Game controls */}
      <div className="controls-panel">
        <h2>Game Controls</h2>
        <div className="controls-buttons">
          {!gameState.gameStarted && (
            <button 
              onClick={() => handleStartGame()}
              disabled={loading || gameState.players.length < 2}
              className="action-button"
            >
              {loading ? 'Starting...' : 'Start Game'}
            </button>
          )}
          
          {gameState.gameStarted && !gameState.gameOver && isUserTurn() && (
            <button 
              onClick={() => handleNextPhase()}
              disabled={loading}
              className="action-button"
            >
              {loading ? 'Processing...' : 'Next Phase'}
            </button>
          )}
        </div>
      </div>
      
      {/* Players list */}
      <div className="players-panel">
        <h2>Players</h2>
        <div className="players-list">
          {gameState.players.map(player => (
            <div key={player.userId} className="player-card">
              <h3 className="player-name">
                {player.name}
                {player.userId === userId && <span className="player-you"> (You)</span>}
                {!player.isActive && <span className="player-disconnected"> (Disconnected)</span>}
              </h3>
              <p className="player-joined">Joined: {new Date(player.joinedAt).toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Game board visualization */}
      <div className="board-panel">
        <h2>Game Board</h2>
        <div className="game-board-placeholder">
          <p>Your game board visualization will go here</p>
        </div>
      </div>
      
      <style jsx>{`
        .game-container {
          max-width: 900px;
          margin: 0 auto;
          padding: 20px;
          font-family: sans-serif;
        }
        
        .error-message {
          color: #d32f2f;
          padding: 10px;
          background-color: #ffebee;
          border-radius: 4px;
          margin-bottom: 15px;
        }
        
        .status-panel, .controls-panel, .players-panel, .board-panel {
          background-color: #f5f5f5;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 24px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .status-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 16px;
        }
        
        .status-item {
          display: flex;
          flex-direction: column;
        }
        
        .status-label {
          font-weight: bold;
          margin-bottom: 4px;
          color: #666;
        }
        
        .status-value {
          font-size: 1.1rem;
        }
        
        .your-turn {
          font-weight: bold;
          color: #2e7d32;
        }
        
        .controls-buttons {
          display: flex;
          gap: 16px;
        }
        
        .action-button {
          background-color: #2196f3;
          color: white;
          border: none;
          padding: 12px 20px;
          font-size: 16px;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .action-button:hover {
          background-color: #1976d2;
        }
        
        .action-button:disabled {
          background-color: #bbdefb;
          cursor: not-allowed;
        }
        
        .players-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 16px;
        }
        
        .player-card {
          background-color: white;
          border-radius: 8px;
          padding: 16px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .player-name {
          margin-top: 0;
          margin-bottom: 8px;
        }
        
        .player-you {
          color: #2e7d32;
          font-weight: normal;
        }
        
        .player-disconnected {
          color: #d32f2f;
          font-weight: normal;
        }
        
        .player-joined {
          color: #666;
          font-size: 0.9rem;
          margin: 0;
        }
        
        .game-board-placeholder {
          background-color: white;
          border-radius: 8px;
          padding: 32px;
          text-align: center;
          min-height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px dashed #ccc;
        }
      `}</style>
    </div>
  );
};