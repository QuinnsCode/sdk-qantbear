import { DurableObject } from "cloudflare:workers";

interface GameState {
  players: string[];
  currentTurn: number;
  currentPhase: string;
  board: any;
  lastUpdated: number;
}

export class BoardGameDurableObject extends DurableObject {
  private state: DurableObjectState;
  private gameState: GameState | undefined;

  constructor(state: DurableObjectState, env: any) {
    super(state, env);
    this.state = state;
    this.gameState = undefined;
  }

  async getGameState(): Promise<GameState> {
    if (!this.gameState) {
      const storedState = await this.state.storage.get<GameState>("gameState");
      this.gameState = structuredClone(storedState) ?? {
        players: [],
        currentTurn: 0,
        currentPhase: "setup",
        board: {},
        lastUpdated: Date.now(),
      };
  
      // Ensure the default state is stored
      if (!storedState) {
        await this.state.storage.put("gameState", this.gameState);
      }
    }
  
    return structuredClone(this.gameState); // Return a safe copy
  }
  

  async setGameState(newState: GameState): Promise<void> {
    this.gameState = newState;
    newState.lastUpdated = Date.now();
    await this.state.storage.put<GameState>("gameState", newState);
  }

  async fetch(request: Request) {
    const url = new URL(request.url);
    
    // Direct method calls
    if (url.pathname === '/getState') {
      const gameState = await this.getGameState();
      return new Response(JSON.stringify(gameState));
    }

    if (url.pathname === '/updateBoard') {
      const { board } = await request.json();
      const currentState = await this.getGameState();
      const updatedState = {
        ...currentState,
        board: board
      };
      await this.setGameState(updatedState);
      return new Response(JSON.stringify(updatedState));
    }

    // Test endpoints
    if (url.pathname === '/test') {
      return new Response(JSON.stringify({ 
        testResponse: 'DO is working',
        time: new Date().toISOString()
      }));
    }

    try {
      const body = await request.json();
      
      // Existing action handlers
      if (body.action === 'get-state') {
        const gameState = await this.getGameState();
        return new Response(JSON.stringify(gameState));
      }
      
      if (body.action === 'update-board') {
        const currentState = await this.getGameState();
        const updatedState = {
          ...currentState,
          board: body.boardUpdate
        };
        await this.setGameState(updatedState);
        return new Response(JSON.stringify(updatedState));
      }

      if (body.action === 'register') {
        const { proposedUserId } = body;
        const currentState = await this.getGameState();
        
        if (currentState.players.includes(proposedUserId)) {
          return new Response(JSON.stringify({ userId: proposedUserId }));
        } else {
          const updatedPlayers = [...currentState.players, proposedUserId];
          const updatedState = { ...currentState, players: updatedPlayers };
          await this.setGameState(updatedState);
          return new Response(JSON.stringify({ userId: proposedUserId }));
        }
      }
      
      return new Response('Invalid action', { status: 400 });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
  }
}