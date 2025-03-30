import { DurableObject } from "cloudflare:workers";

// Define our game state types
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
  // Add any other game-specific state here
  board: any; // Replace with your specific board structure
  lastUpdated: number;
}

export class BoardGameDurableObject extends DurableObject {
  private state: DurableObjectState;
  private gameState: GameState | undefined;

  constructor(state: DurableObjectState, env: Env) {
    super(state, env);
    this.state = state;
    this.gameState = undefined;
  }

  // Initialize or retrieve the current game state
  async getGameState(): Promise<GameState> {
    if (this.gameState) return this.gameState;
    
    // Try to load from storage
    const storedState = await this.state.storage.get<GameState>("gameState");
    
    if (storedState) {
      this.gameState = storedState;
    } else {
      // Initialize a new game state if none exists
      this.gameState = {
        players: [],
        currentTurn: 0,
        currentPhase: GamePhase.SETUP,
        currentPlayerIndex: 0,
        gameStarted: false,
        gameOver: false,
        winner: null,
        board: {}, // Initialize with your board structure
        lastUpdated: Date.now()
      };
      await this.saveGameState();
    }
    
    return this.gameState;
  }

  // Save the current game state to storage
  async saveGameState(): Promise<void> {
    if (!this.gameState) return;
    
    this.gameState.lastUpdated = Date.now();
    await this.state.storage.put<GameState>("gameState", this.gameState);
  }

  // Add a player to the game
  async addPlayer(userId: string, name: string): Promise<Player> {
    const gameState = await this.getGameState();
    
    // Check if the player already exists
    const existingPlayer = gameState.players.find(p => p.userId === userId);
    if (existingPlayer) {
      existingPlayer.isActive = true;
      await this.saveGameState();
      return existingPlayer;
    }
    
    // Check if game is already in progress
    if (gameState.gameStarted && gameState.currentPhase !== GamePhase.SETUP) {
      throw new Error("Cannot join game in progress");
    }
    
    // Create a new player
    const newPlayer = {
      userId,
      name,
      joinedAt: Date.now(),
      isActive: true
    };
    
    gameState.players.push(newPlayer);
    await this.saveGameState();
    
    return newPlayer;
  }

  // Remove a player from the game
  async removePlayer(userId: string): Promise<void> {
    const gameState = await this.getGameState();
    
    // Mark player as inactive rather than removing
    const playerIndex = gameState.players.findIndex(p => p.userId === userId);
    if (playerIndex >= 0) {
      gameState.players[playerIndex].isActive = false;
      await this.saveGameState();
    }
  }

  // Start the game
  async startGame(): Promise<GameState> {
    const gameState = await this.getGameState();
    
    // Ensure we have enough active players
    const activePlayers = gameState.players.filter(p => p.isActive);
    if (activePlayers.length < 2) {
      throw new Error("Need at least 2 active players to start");
    }
    
    // Initialize the game
    gameState.gameStarted = true;
    gameState.currentTurn = 1;
    gameState.currentPhase = GamePhase.PHASE_1;
    gameState.currentPlayerIndex = 0;
    gameState.gameOver = false;
    gameState.winner = null;
    
    // Initialize any other game state here
    
    await this.saveGameState();
    return gameState;
  }

  // Advance to the next phase
  async advancePhase(): Promise<GameState> {
    const gameState = await this.getGameState();
    
    if (!gameState.gameStarted || gameState.gameOver) {
      throw new Error("Game not in progress");
    }
    
    // Determine the next phase
    switch (gameState.currentPhase) {
      case GamePhase.PHASE_1:
        gameState.currentPhase = GamePhase.PHASE_2;
        break;
      case GamePhase.PHASE_2:
        gameState.currentPhase = GamePhase.PHASE_3;
        break;
      case GamePhase.PHASE_3:
        gameState.currentPhase = GamePhase.PHASE_4;
        break;
      case GamePhase.PHASE_4:
        gameState.currentPhase = GamePhase.PHASE_5;
        break;
      case GamePhase.PHASE_5:
        gameState.currentPhase = GamePhase.PHASE_6;
        break;
      case GamePhase.PHASE_6:
        // End of turn, advance to next player
        this.advanceToNextPlayer(gameState);
        gameState.currentPhase = GamePhase.PHASE_1;
        break;
      default:
        throw new Error(`Unexpected game phase: ${gameState.currentPhase}`);
    }
    
    await this.saveGameState();
    return gameState;
  }

  // Helper to advance to the next player
  private advanceToNextPlayer(gameState: GameState): void {
    const activePlayers = gameState.players.filter(p => p.isActive);
    
    // Increment the current player index
    gameState.currentPlayerIndex = (gameState.currentPlayerIndex + 1) % activePlayers.length;
    
    // If we've gone through all players, advance to the next turn
    if (gameState.currentPlayerIndex === 0) {
      gameState.currentTurn++;
      // Here you could check win conditions after a full round
      this.checkGameOverConditions(gameState);
    }
  }
  
  // Check if the game is over
  private checkGameOverConditions(gameState: GameState): void {
    // Implement your game-specific win/lose conditions here
    // For example:
    if (gameState.currentTurn >= 5) {
      gameState.gameOver = true;
      gameState.winner = this.determineWinner(gameState);
    }
  }
  
  // Determine the winner
  private determineWinner(gameState: GameState): string | null {
    // Implement your game-specific winner determination logic here
    const randomPlayerIndex = Math.floor(Math.random() * gameState.players.length);
    return gameState.players[randomPlayerIndex].userId;
  }

  // Handle fetch method for HTTP API
  async fetch(request: Request) {
    const url = new URL(request.url);
    
    // Basic health check
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({ 
        status: 'ok',
        time: new Date().toISOString()
      }));
    }
    
    // Game state API
    if (url.pathname === '/state') {
      const gameState = await this.getGameState();
      return new Response(JSON.stringify(gameState));
    }
    
    // Player management
    if (url.pathname === '/join') {
      try {
        const { userId, name } = await request.json();
        const player = await this.addPlayer(userId, name);
        return new Response(JSON.stringify(player));
      } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 400 });
      }
    }
    
    if (url.pathname === '/leave') {
      try {
        const { userId } = await request.json();
        await this.removePlayer(userId);
        return new Response(JSON.stringify({ success: true }));
      } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 400 });
      }
    }
    
    // Game flow control
    if (url.pathname === '/start') {
      try {
        const gameState = await this.startGame();
        return new Response(JSON.stringify(gameState));
      } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 400 });
      }
    }
    
    if (url.pathname === '/next-phase') {
      try {
        const gameState = await this.advancePhase();
        return new Response(JSON.stringify(gameState));
      } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 400 });
      }
    }
    
    // Game action - would depend on your specific game rules
    if (url.pathname === '/action') {
      try {
        const { action, playerId, ...actionData } = await request.json();
        const result = await this.processGameAction(action, playerId, actionData);
        return new Response(JSON.stringify(result));
      } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 400 });
      }
    }
    
    // Fallback for unknown endpoints
    return new Response('Not found', { status: 404 });
  }
  
  // Process a game action
  async processGameAction(action: string, playerId: string, data: any): Promise<any> {
    const gameState = await this.getGameState();
    
    // Verify it's the player's turn
    const activePlayers = gameState.players.filter(p => p.isActive);
    const currentPlayer = activePlayers[gameState.currentPlayerIndex];
    
    if (!currentPlayer || currentPlayer.userId !== playerId) {
      throw new Error("Not your turn");
    }
    
    // Handle different actions based on current phase
    switch (action) {
      case 'move':
        // Example action
        if (gameState.currentPhase !== GamePhase.PHASE_2) {
          throw new Error("Can only move in Phase 2");
        }
        // Process move logic
        // gameState.board = updateBoardWithMove(gameState.board, data.move);
        break;
        
      case 'attack':
        // Example action
        if (gameState.currentPhase !== GamePhase.PHASE_3) {
          throw new Error("Can only attack in Phase 3");
        }
        // Process attack logic
        break;
        
      // Add more actions as needed
      
      default:
        throw new Error(`Unknown action: ${action}`);
    }
    
    await this.saveGameState();
    return gameState;
  }
}