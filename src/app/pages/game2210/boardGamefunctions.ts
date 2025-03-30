"use server";

import { RouteContext } from "@redwoodjs/sdk/router";

// Get the current game state
export const getGameState = async (gameId: string, ctx?: RouteContext) => {
  try {
    const doId = ctx!.env.BOARD_GAME_DURABLE_OBJECT.idFromName(gameId);
    const gameDO = ctx!.env.BOARD_GAME_DURABLE_OBJECT.get(doId);
    
    const response = await gameDO.fetch(new Request("https://do-does-not-need-url/state"));
    
    if (!response.ok) {
      console.error("Failed to fetch game state:", response.statusText);
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching game state:", error);
    return null;
  }
};

// Add a player to the game
export const joinGame = async (gameId: string, userId: string, name: string, ctx?: RouteContext) => {
  try {
    const doId = ctx!.env.BOARD_GAME_DURABLE_OBJECT.idFromName(gameId);
    const gameDO = ctx!.env.BOARD_GAME_DURABLE_OBJECT.get(doId);
    
    const response = await gameDO.fetch(new Request("https://do-does-not-need-url/join", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userId, name })
    }));
    
    if (!response.ok) {
      console.error("Failed to join game:", response.statusText);
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error joining game:", error);
    return null;
  }
};

// Start the game
export const startGame = async (gameId: string, ctx?: RouteContext) => {
  try {
    const doId = ctx!.env.BOARD_GAME_DURABLE_OBJECT.idFromName(gameId);
    const gameDO = ctx!.env.BOARD_GAME_DURABLE_OBJECT.get(doId);
    
    const response = await gameDO.fetch(new Request("https://do-does-not-need-url/start", {
      method: 'POST'
    }));
    
    if (!response.ok) {
      console.error("Failed to start game:", response.statusText);
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error starting game:", error);
    return null;
  }
};

// Advance to the next phase
export const advancePhase = async (gameId: string, ctx?: RouteContext) => {
  try {
    const doId = ctx!.env.BOARD_GAME_DURABLE_OBJECT.idFromName(gameId);
    const gameDO = ctx!.env.BOARD_GAME_DURABLE_OBJECT.get(doId);
    
    const response = await gameDO.fetch(new Request("https://do-does-not-need-url/next-phase", {
      method: 'POST'
    }));
    
    if (!response.ok) {
      console.error("Failed to advance phase:", response.statusText);
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error advancing phase:", error);
    return null;
  }
};

// Perform a game action
export const performGameAction = async (
  gameId: string,
  playerId: string,
  action: string,
  actionData: any,
  ctx?: RouteContext
) => {
  try {
    const doId = ctx!.env.BOARD_GAME_DURABLE_OBJECT.idFromName(gameId);
    const gameDO = ctx!.env.BOARD_GAME_DURABLE_OBJECT.get(doId);
    
    const response = await gameDO.fetch(new Request("https://do-does-not-need-url/action", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        action, 
        playerId,
        ...actionData
      })
    }));
    
    if (!response.ok) {
      console.error("Failed to perform game action:", response.statusText);
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error performing game action:", error);
    return null;
  }
};