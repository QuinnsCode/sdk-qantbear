import { defineApp } from "@redwoodjs/sdk/worker";
import { route, layout } from "@redwoodjs/sdk/router";
import { Document } from "@/app/Document";
import { setCommonHeaders } from "@/app/headers";
import {
  uniqueNamesGenerator,
  adjectives,
  colors,
  animals,
} from "unique-names-generator";

import { realtimeRoute } from "@redwoodjs/sdk/realtime/worker";
import Game2210 from "./app/pages/game2210/Game2210";

export { RealtimeDurableObject } from "@redwoodjs/sdk/realtime/durableObject";
export { BoardGameDurableObject } from "./boardGameDurableObject";

export type Context = {};

export default defineApp<Context>([
  setCommonHeaders(),
  realtimeRoute((env) => env.REALTIME_DURABLE_OBJECT),
  layout(Document, [
    route("/", () => {
      const randomName = uniqueNamesGenerator({
        dictionaries: [adjectives, colors, animals],
        separator: "-",
        length: 3,
      });

      return new Response(null, {
        status: 302,
        headers: {
          Location: `/board-game/${randomName}`,
        },
      });
    }),
    route("/board-game", () => {
      const randomName = uniqueNamesGenerator({
        dictionaries: [adjectives, colors, animals],
        separator: "-",
        length: 3,
      });
    
      return new Response(null, {
        status: 302,
        headers: {
          Location: `/board-game/${randomName}`,
        },
      });
    }),
    route("/board-game/:gameId", Game2210),

    //
    // Board game API routes ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    //
    //getGameState,
    route('/api/board-game/:gameId/state', async (ctx) => {
      const gameId = ctx.params.gameId;
      console.log(`Attempting to get state for game: ${gameId}`);
      
      try {
        console.log("About to create DO ID");
        const doId = ctx.env.BOARD_GAME_DURABLE_OBJECT.idFromName(gameId);
        
        console.log("About to get DO stub");
        const gameDO = ctx.env.BOARD_GAME_DURABLE_OBJECT.get(doId);
        
        console.log("About to fetch from DO");
        // First try a very simple request to see if basic communication works
        const response = await gameDO.fetch(new Request('do-does-not-need-url/health'));
        
        console.log("Response from DO:", response.status);
        if (!response.ok) {
          console.error("DO health check failed:", response.statusText);
          return new Response(JSON.stringify({ 
            error: 'Health check failed', 
            status: response.status,
            statusText: response.statusText 
          }), { 
            status: response.status, 
            headers: { 'Content-Type': 'application/json' } 
          });
        }
        
        // If health check passes, try getting state
        const stateResponse = await gameDO.fetch(new Request('do-does-not-need-url/state'));
        if (!stateResponse.ok) {
          console.error("Failed to get state:", stateResponse.statusText);
          return new Response(JSON.stringify({ 
            error: 'Failed to get game state',
            status: stateResponse.status,
            statusText: stateResponse.statusText
          }), { 
            status: stateResponse.status,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        
        const result = await stateResponse.json();
        return new Response(JSON.stringify(result), {
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (error) {
        console.error('Get board game state error:', error);
        return new Response(JSON.stringify({ 
          error: error.message,
          stack: error.stack,
          name: error.name
        }), { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }),
    // addPlayer,
    route('/api/board-game/:gameId/join', async (ctx) => {
      const gameId = ctx.params.gameId;
      
      try {
        const { userId, name } = await ctx.request.json();
        
        const doId = ctx.env.BOARD_GAME_DURABLE_OBJECT.idFromName(gameId);
        const gameDO = ctx.env.BOARD_GAME_DURABLE_OBJECT.get(doId);
        
        const response = await gameDO.fetch(new Request('do-does-not-need-url/join', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ userId, name })
        }));
        
        if (!response.ok) {
          return new Response(JSON.stringify({ error: 'Failed to join game' }), { 
            status: response.status,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        
        const result = await response.json();
        return new Response(JSON.stringify(result), {
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (error) {
        console.error('Join board game error:', error);
        return new Response(JSON.stringify({ error: error.message }), { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }),
    // startGame,
    route('/api/board-game/:gameId/start', async (ctx) => {
      const gameId = ctx.params.gameId;
      
      try {
        const doId = ctx.env.BOARD_GAME_DURABLE_OBJECT.idFromName(gameId);
        const gameDO = ctx.env.BOARD_GAME_DURABLE_OBJECT.get(doId);
        
        const response = await gameDO.fetch(new Request('do-does-not-need-url/start', {
          method: 'POST'
        }));
        
        if (!response.ok) {
          return new Response(JSON.stringify({ error: 'Failed to start game' }), { 
            status: response.status,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        
        const result = await response.json();
        return new Response(JSON.stringify(result), {
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (error) {
        console.error('Start board game error:', error);
        return new Response(JSON.stringify({ error: error.message }), { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }),
    // advancePhase,
    route('/api/board-game/:gameId/next-phase', async (ctx) => {
      const gameId = ctx.params.gameId;
      
      try {
        const doId = ctx.env.BOARD_GAME_DURABLE_OBJECT.idFromName(gameId);
        const gameDO = ctx.env.BOARD_GAME_DURABLE_OBJECT.get(doId);
        
        const response = await gameDO.fetch(new Request('do-does-not-need-url/next-phase', {
          method: 'POST'
        }));
        
        if (!response.ok) {
          return new Response(JSON.stringify({ error: 'Failed to advance phase' }), { 
            status: response.status,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        
        const result = await response.json();
        return new Response(JSON.stringify(result), {
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (error) {
        console.error('Advance board game phase error:', error);
        return new Response(JSON.stringify({ error: error.message }), { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }),
  ]),
]);
