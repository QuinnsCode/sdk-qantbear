import { DurableObject } from "cloudflare:workers";

export class GameDurableObject extends DurableObject {
  private state: DurableObjectState;
  private board: string[] | undefined;

  constructor(state: DurableObjectState, env: Env) {
    super(state, env);
    this.state = state;
    this.board = undefined;
  }

  async getBoard(): Promise<string[]> {
    return (this.board ??=
      (await this.state.storage.get<string[]>("board")) ?? Array(9).fill(null));
  }

  async setBoard(newBoard: string[]): Promise<void> {
    this.board = newBoard;
    await this.state.storage.put<string[]>("board", this.board);
  }

  // Handle fetch method for compatibility with existing code
  async fetch(request: Request) {
    const url = new URL(request.url);
    
    // Handle your test endpoints
    if (url.pathname === '/test') {
      return new Response(JSON.stringify({ 
        testResponse: 'DO is working',
        time: new Date().toISOString()
      }));
    }
    
    if (url.pathname === '/test-register') {
      const testPlayer = {
        userId: 'test-user-' + Date.now(),
        assignedLetter: 'X',
        joinedAt: Date.now()
      };
      return new Response(JSON.stringify(testPlayer));
    }
    
    // For direct method calls (for the new approach)
    if (url.pathname === '/getBoard') {
      const board = await this.getBoard();
      return new Response(JSON.stringify(board));
    }
    
    if (url.pathname === '/setBoard') {
      const { board } = await request.json();
      await this.setBoard(board);
      return new Response(JSON.stringify(board));
    }
    
    // For handling the existing API calls
    try {
      const body = await request.json();
      
      if (body.action === 'get-state') {
        const board = await this.getBoard();
        return new Response(JSON.stringify(board));
      }
      
      if (body.action === 'update-board') {
        await this.setBoard(body.boardUpdate);
        return new Response(JSON.stringify(body.boardUpdate));
      }
      
      return new Response('Invalid action', { status: 400 });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
  }
}