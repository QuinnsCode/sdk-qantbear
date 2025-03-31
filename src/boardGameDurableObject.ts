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
    const storedState = await this.state.storage.get<GameState>("gameState");
    
    if (storedState) {
      return storedState;
    }
  
    const newGameState: GameState = {
      players: [],
      currentTurn: 0,
      currentPhase: GamePhase.SETUP,
      currentPlayerIndex: 0,
      gameStarted: false,
      gameOver: false,
      winner: null,
      board: {},
      lastUpdated: Date.now()
    };
  
    await this.state.storage.put<GameState>("gameState", newGameState);
    return newGameState;
  }

  async saveGameState(): Promise<void> {
    if (!this.gameState) return;
    this.gameState.lastUpdated = Date.now();
    await this.state.storage.put<GameState>("gameState", this.gameState);
  }

  // Action handler method
  async handleAction(action: string, data: any): Promise<GameState> {
    const gameState = await this.getGameState();
    
    switch (action) {
      case 'add-player':
        const player = await this.addPlayer(data.userId, data.name);
        return gameState;

      case 'remove-player':
        await this.removePlayer(data.userId);
        return gameState;

      case 'start-game':
        return await this.startGame();

      case 'advance-phase':
        return await this.advancePhase();

      case 'perform-action':
        return await this.processGameAction(data.action, data.playerId, data.actionData);

      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }

  async addPlayer(userId: string, name: string): Promise<Player> {
    const gameState = await this.getGameState();
    const existingPlayer = gameState.players.find(p => p.userId === userId);
    if (existingPlayer) {
      existingPlayer.isActive = true;
      await this.saveGameState();
      return existingPlayer;
    }

    if (gameState.gameStarted && gameState.currentPhase !== GamePhase.SETUP) {
      throw new Error("Cannot join game in progress");
    }

    const newPlayer = { userId, name, joinedAt: Date.now(), isActive: true };
    gameState.players.push(newPlayer);
    await this.saveGameState();
    return newPlayer;
  }

  async removePlayer(userId: string): Promise<void> {
    const gameState = await this.getGameState();
    const playerIndex = gameState.players.findIndex(p => p.userId === userId);
    if (playerIndex >= 0) {
      gameState.players[playerIndex].isActive = false;
      await this.saveGameState();
    }
  }

  async startGame(): Promise<GameState> {
    const gameState = await this.getGameState();
    const activePlayers = gameState.players.filter(p => p.isActive);
    if (activePlayers.length < 2) {
      throw new Error("Need at least 2 active players to start");
    }

    gameState.gameStarted = true;
    gameState.currentTurn = 1;
    gameState.currentPhase = GamePhase.PHASE_1;
    gameState.currentPlayerIndex = 0;
    gameState.gameOver = false;
    gameState.winner = null;

    await this.saveGameState();
    return gameState;
  }

  async advancePhase(): Promise<GameState> {
    const gameState = await this.getGameState();
    if (!gameState.gameStarted || gameState.gameOver) {
      throw new Error("Game not in progress");
    }

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
        this.advanceToNextPlayer(gameState);
        gameState.currentPhase = GamePhase.PHASE_1;
        break;
      default:
        throw new Error(`Unexpected game phase: ${gameState.currentPhase}`);
    }

    await this.saveGameState();
    return gameState;
  }

  private advanceToNextPlayer(gameState: GameState): void {
    const activePlayers = gameState.players.filter(p => p.isActive);
    gameState.currentPlayerIndex = (gameState.currentPlayerIndex + 1) % activePlayers.length;

    if (gameState.currentPlayerIndex === 0) {
      gameState.currentTurn++;
      this.checkGameOverConditions(gameState);
    }
  }

  private checkGameOverConditions(gameState: GameState): void {
    if (gameState.currentTurn >= 5) {
      gameState.gameOver = true;
      gameState.winner = this.determineWinner(gameState);
    }
  }

  private determineWinner(gameState: GameState): string | null {
    const randomPlayerIndex = Math.floor(Math.random() * gameState.players.length);
    return gameState.players[randomPlayerIndex].userId;
  }

  private async processGameAction(action: string, playerId: string, data: any): Promise<GameState> {
    const gameState = await this.getGameState();
    const activePlayers = gameState.players.filter(p => p.isActive);
    const currentPlayer = activePlayers[gameState.currentPlayerIndex];

    if (!currentPlayer || currentPlayer.userId !== playerId) {
      throw new Error("Not your turn");
    }

    switch (action) {
      case 'move':
        if (gameState.currentPhase !== GamePhase.PHASE_2) {
          throw new Error("Can only move in Phase 2");
        }
        // Implement move action here
        break;

      case 'attack':
        if (gameState.currentPhase !== GamePhase.PHASE_3) {
          throw new Error("Can only attack in Phase 3");
        }
        // Implement attack action here
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    await this.saveGameState();
    return gameState;
  }

  async fetch(request: Request) {
    const url = new URL(request.url);

    if (url.pathname === '/health') {
      return new Response(JSON.stringify({ status: 'ok', time: new Date().toISOString() }));
    }

    try {
      const body = await request.json();
      const gameState = await this.handleAction(body.action, body.data);
      return new Response(JSON.stringify(gameState));
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 400 });
    }
  }
}
