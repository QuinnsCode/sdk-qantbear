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
import Note from "./app/pages/note/Note";
import Game from "./app/pages/game/Game";

export { RealtimeDurableObject } from "@redwoodjs/sdk/realtime/durableObject";
export { NoteDurableObject } from "@/noteDurableObject";
export { GameDurableObject } from "@/gameDurableObject";

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
          Location: `/game/${randomName}`,
        },
      });
    }),
    route("/note/:key", Note),
    route("/games/:gameId", Game),
    route("/game/:gameId", Game),
    // Game API routes
    route('/api/game/:gameId/register', async (ctx) => {
      const gameId = ctx.params.gameId;
      let proposedUserId;
      
      try {
        // Clone the request before reading its body if you need to use it multiple times
        const body = await ctx.request.json();
        proposedUserId = body.proposedUserId;
        
        // Create a fresh Request object for the DO
        const doId = ctx.env.GAME_DURABLE_OBJECT.idFromName(gameId);
        const gameDO = ctx.env.GAME_DURABLE_OBJECT.get(doId);
        
        const doRequest = new Request('https://internal', {
          method: 'POST',
          body: JSON.stringify({ 
            action: 'register',
            gameId,
            proposedUserId
          })
        });
        
        const response = await gameDO.fetch(doRequest);
        
        if (!response.ok) {
          return new Response(JSON.stringify({ error: 'Failed to register player' }), { 
            status: response.status,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        
        // Clone the response before reading its body if you need to use it multiple times
        const result = await response.json();
        return new Response(JSON.stringify(result), {
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (error) {
        console.error('Registration error:', error);
        return new Response(JSON.stringify({ error: error.message }), { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }),

    route('/api/game/:gameId/state', async (ctx) => {
      const gameId = ctx.params.gameId;
      
      try {
        const doId = ctx.env.GAME_DURABLE_OBJECT.idFromName(gameId);
        const gameDO = ctx.env.GAME_DURABLE_OBJECT.get(doId);
        
        const response = await gameDO.fetch(new Request('https://internal', {
          method: 'POST',
          body: JSON.stringify({ 
            action: 'get-state',
            gameId
          })
        }));
        
        if (!response.ok) {
          return new Response(JSON.stringify({ error: 'Failed to get game state' }), { 
            status: response.status,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        
        const result = await response.json();
        return new Response(JSON.stringify(result), {
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (error) {
        console.error('Get state error:', error);
        return new Response(JSON.stringify({ error: error.message }), { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }),

    route('/api/game/:gameId/update', async (ctx) => {
      const gameId = ctx.params.gameId;
      const { userId, boardUpdate } = await ctx.request.json();
      
      try {
        const doId = ctx.env.GAME_DURABLE_OBJECT.idFromName(gameId);
        const gameDO = ctx.env.GAME_DURABLE_OBJECT.get(doId);
        
        const response = await gameDO.fetch(new Request('https://internal', {
          method: 'POST',
          body: JSON.stringify({ 
            action: 'update-board',
            gameId,
            userId,
            boardUpdate
          })
        }));
        
        if (!response.ok) {
          return new Response(JSON.stringify({ error: 'Failed to update board' }), { 
            status: response.status,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        
        const result = await response.json();
        return new Response(JSON.stringify(result), {
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (error) {
        console.error('Update board error:', error);
        return new Response(JSON.stringify({ error: error.message }), { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }),
    route('/api/test', () => {
      return new Response(JSON.stringify({ test: 'success' }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }),
    route('/api/game-do-test', async (ctx) => {
      try {
        // Use a fixed ID for testing
        const doId = ctx.env.GAME_DURABLE_OBJECT.idFromName('test-game');
        const gameDO = ctx.env.GAME_DURABLE_OBJECT.get(doId);
        
        const response = await gameDO.fetch(new Request('https://internal/test'));
        
        if (!response.ok) {
          return new Response(JSON.stringify({ error: 'DO test failed' }), { 
            status: response.status,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        
        const result = await response.json();
        return new Response(JSON.stringify(result), {
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (error) {
        console.error('DO test error:', error);
        return new Response(JSON.stringify({ error: error.message }), { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }),
    route('/api/game-test-register', async (ctx) => {
      try {
        const doId = ctx.env.GAME_DURABLE_OBJECT.idFromName('test-game');
        const gameDO = ctx.env.GAME_DURABLE_OBJECT.get(doId);
        
        const response = await gameDO.fetch(new Request('https://internal/test-register'));
        
        if (!response.ok) {
          return new Response(JSON.stringify({ error: 'Test registration failed' }), { 
            status: response.status,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        
        const result = await response.json();
        return new Response(JSON.stringify(result), {
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (error) {
        console.error('Test registration error:', error);
        return new Response(JSON.stringify({ error: error.message }), { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    })
  ]),
]);
