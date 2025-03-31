import { DurableObject } from "cloudflare:workers";

// Define our game state types
interface Player {
  userId: string;
  name: string;
  joinedAt: number;
  isActive: boolean;
}

// Changed to string literal type to match frontend
type GamePhase = 'setup' | 'phase_1' | 'phase_2' | 'phase_3' | 'phase_4' | 'phase_5' | 'phase_6' | 'game_over';

interface GameState {
  players: Player[];
  currentTurn: number;
  currentPhase: GamePhase;
  currentPlayerIndex: number;
  gameStarted: boolean;
  gameOver: boolean;
  winner: string | null;
  board: any; // Replace with your specific board structure
  lastUpdated: number;
}

export class BoardGameDurableObject extends DurableObject {
  private state: DurableObjectState;
  private gameState: GameState | null = null;

  constructor(state: DurableObjectState, env: any) {
    super(state, env);
    this.state = state;
  }

  // Initialize or retrieve the current game state
  async getGameState(): Promise<GameState> {
    // Only fetch from storage if we don't have it in memory
    if (!this.gameState) {
      const storedState = await this.state.storage.get<GameState>("gameState");
      
      if (storedState) {
        this.gameState = storedState;
      } else {
        // Initialize with default state
        this.gameState = {
          players: [],
          currentTurn: 0,
          currentPhase: 'setup',
          currentPlayerIndex: 0,
          gameStarted: false,
          gameOver: false,
          winner: null,
          board: {},
          lastUpdated: Date.now()
        };
        
        // Save the initial state
        await this.saveGameState();
      }
    }
    
    return this.gameState;
  }

  async saveGameState(): Promise<void> {
    if (!this.gameState) return;
    
    this.gameState.lastUpdated = Date.now();
    await this.state.storage.put("gameState", this.gameState);
  }

  // Action handler method
  async handleAction(action: string, data: any): Promise<GameState> {
    await this.getGameState(); // Ensure gameState is loaded
    
    switch (action) {
      case 'add-player':
        await this.addPlayer(data.userId, data.name);
        break;

      case 'remove-player':
        await this.removePlayer(data.userId);
        break;

      case 'start-game':
        await this.startGame();
        break;

      case 'advance-phase':
        await this.advancePhase();
        break;

      case 'perform-action':
        await this.processGameAction(data.action, data.playerId, data.actionData);
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }
    
    // Always return the current state
    return this.gameState!;
  }

  async addPlayer(userId: string, name: string): Promise<Player> {
    await this.getGameState(); // Ensure gameState is loaded
    
    const existingPlayer = this.gameState!.players.find(p => p.userId === userId);
    if (existingPlayer) {
      existingPlayer.isActive = true;
      await this.saveGameState();
      return existingPlayer;
    }

    if (this.gameState!.gameStarted && this.gameState!.currentPhase !== 'setup') {
      throw new Error("Cannot join game in progress");
    }

    const newPlayer = { userId, name, joinedAt: Date.now(), isActive: true };
    this.gameState!.players.push(newPlayer);
    await this.saveGameState();
    return newPlayer;
  }

  async removePlayer(userId: string): Promise<void> {
    await this.getGameState(); // Ensure gameState is loaded
    
    const playerIndex = this.gameState!.players.findIndex(p => p.userId === userId);
    if (playerIndex >= 0) {
      this.gameState!.players[playerIndex].isActive = false;
      await this.saveGameState();
    }
  }

  async startGame(): Promise<GameState> {
    await this.getGameState(); // Ensure gameState is loaded
    
    const activePlayers = this.gameState!.players.filter(p => p.isActive);
    if (activePlayers.length < 2) {
      throw new Error("Need at least 2 active players to start");
    }

    this.gameState!.gameStarted = true;
    this.gameState!.currentTurn = 1;
    this.gameState!.currentPhase = 'phase_1';
    this.gameState!.currentPlayerIndex = 0;
    this.gameState!.gameOver = false;
    this.gameState!.winner = null;

    await this.saveGameState();
    return this.gameState!;
  }

  async advancePhase(): Promise<GameState> {
    await this.getGameState(); // Ensure gameState is loaded
    
    if (!this.gameState!.gameStarted || this.gameState!.gameOver) {
      throw new Error("Game not in progress");
    }

    switch (this.gameState!.currentPhase) {
      case 'phase_1':
        this.gameState!.currentPhase = 'phase_2';
        break;
      case 'phase_2':
        this.gameState!.currentPhase = 'phase_3';
        break;
      case 'phase_3':
        this.gameState!.currentPhase = 'phase_4';
        break;
      case 'phase_4':
        this.gameState!.currentPhase = 'phase_5';
        break;
      case 'phase_5':
        this.gameState!.currentPhase = 'phase_6';
        break;
      case 'phase_6':
        this.advanceToNextPlayer();
        this.gameState!.currentPhase = 'phase_1';
        break;
      default:
        throw new Error(`Unexpected game phase: ${this.gameState!.currentPhase}`);
    }

    await this.saveGameState();
    return this.gameState!;
  }

  private advanceToNextPlayer(): void {
    const activePlayers = this.gameState!.players.filter(p => p.isActive);
    this.gameState!.currentPlayerIndex = (this.gameState!.currentPlayerIndex + 1) % activePlayers.length;

    if (this.gameState!.currentPlayerIndex === 0) {
      this.gameState!.currentTurn++;
      this.checkGameOverConditions();
    }
  }

  private checkGameOverConditions(): void {
    if (this.gameState!.currentTurn >= 5) {
      this.gameState!.gameOver = true;
      this.gameState!.winner = this.determineWinner();
    }
  }

  private determineWinner(): string | null {
    const activePlayers = this.gameState!.players.filter(p => p.isActive);
    if (activePlayers.length === 0) return null;
    
    const randomPlayerIndex = Math.floor(Math.random() * activePlayers.length);
    return activePlayers[randomPlayerIndex].userId;
  }

  private async processGameAction(action: string, playerId: string, data: any): Promise<GameState> {
    await this.getGameState(); // Ensure gameState is loaded
    
    const activePlayers = this.gameState!.players.filter(p => p.isActive);
    const currentPlayer = activePlayers[this.gameState!.currentPlayerIndex];

    if (!currentPlayer || currentPlayer.userId !== playerId) {
      throw new Error("Not your turn");
    }

    switch (action) {
      case 'move':
        if (this.gameState!.currentPhase !== 'phase_2') {
          throw new Error("Can only move in Phase 2");
        }
        // Implement move action here
        break;

      case 'attack':
        if (this.gameState!.currentPhase !== 'phase_3') {
          throw new Error("Can only attack in Phase 3");
        }
        // Implement attack action here
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    await this.saveGameState();
    return this.gameState!;
  }

  async fetch(request: Request) {
    const url = new URL(request.url);
    const path = url.pathname.split('/').filter(Boolean);
    
    // Handle state request (GET)
    if (request.method === 'GET' && path[path.length - 1] === 'state') {
      try {
        const gameState = await this.getGameState();
        return new Response(JSON.stringify(gameState), {
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    // Handle join request
    if (request.method === 'POST' && path[path.length - 1] === 'join') {
      try {
        const { userId, name } = await request.json();
        if (!userId || !name) {
          throw new Error("Missing userId or name");
        }
        
        const player = await this.addPlayer(userId, name);
        return new Response(JSON.stringify(player), {
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    // Handle start game request
    if (request.method === 'POST' && path[path.length - 1] === 'start') {
      try {
        const { userId } = await request.json();
        if (!userId) {
          throw new Error("Missing userId");
        }
        
        await this.getGameState();
        // Optionally verify that this player is allowed to start the game
        
        const gameState = await this.startGame();
        return new Response(JSON.stringify(gameState), {
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    // Handle next-phase request
    if (request.method === 'POST' && path[path.length - 1] === 'next-phase') {
      try {
        const { userId } = await request.json();
        if (!userId) {
          throw new Error("Missing userId");
        }
        
        await this.getGameState();
        // Verify it's this player's turn
        const activePlayers = this.gameState!.players.filter(p => p.isActive);
        const currentPlayer = activePlayers[this.gameState!.currentPlayerIndex];
        
        if (!currentPlayer || currentPlayer.userId !== userId) {
          throw new Error("Not your turn");
        }
        
        const gameState = await this.advancePhase();
        return new Response(JSON.stringify(gameState), {
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    // Default response for unknown endpoints
    return new Response("Not found", { status: 404 });
  }
}