import { defineApp } from "@redwoodjs/sdk/worker";
import { route, layout } from "@redwoodjs/sdk/router";
import { Document } from "@/app/Document";
import { setCommonHeaders } from "@/app/headers";
import { uniqueNamesGenerator, adjectives, colors, animals } from "unique-names-generator";

import { realtimeRoute } from "@redwoodjs/sdk/realtime/worker";
import Game from "./app/pages/game/Game";

export { RealtimeDurableObject } from "@redwoodjs/sdk/realtime/durableObject";
export { BoardGameDurableObject } from "@/boardGameDurableObject";

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
    route("/board-game/:gameId", Game),
    //
    // Game API routes
    //

    // Register a player
    route('/api/board-game/:gameId/register', async (ctx) => {
      const gameId = ctx.params.gameId;
      let proposedUserId;

      try {
        const body = await ctx.request.json();
        proposedUserId = body.proposedUserId;

        const doId = ctx.env.BOARD_GAME_DURABLE_OBJECT.idFromName(gameId);
        const gameDO = ctx.env.BOARD_GAME_DURABLE_OBJECT.get(doId);

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

    // Get game state
    route('/api/board-game/:gameId/state', async (ctx) => {
      const gameId = ctx.params.gameId;

      try {
        const doId = ctx.env.BOARD_GAME_DURABLE_OBJECT.idFromName(gameId);
        const gameDO = ctx.env.BOARD_GAME_DURABLE_OBJECT.get(doId);

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

    // Update game board
    route('/api/board-game/:gameId/update', async (ctx) => {
      const gameId = ctx.params.gameId;
      const { userId, boardUpdate } = await ctx.request.json();

      try {
        const doId = ctx.env.BOARD_GAME_DURABLE_OBJECT.idFromName(gameId);
        const gameDO = ctx.env.BOARD_GAME_DURABLE_OBJECT.get(doId);

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

    // Test routes for debugging
    route('/api/test', () => {
      return new Response(JSON.stringify({ test: 'success' }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }),

    route('/api/board-game-test', async (ctx) => {
      try {
        const doId = ctx.env.BOARD_GAME_DURABLE_OBJECT.idFromName('test-game');
        const gameDO = ctx.env.BOARD_GAME_DURABLE_OBJECT.get(doId);

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
    })
  ]),
]);
