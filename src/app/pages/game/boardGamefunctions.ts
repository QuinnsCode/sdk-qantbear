"use server";

import { RouteContext } from "@redwoodjs/sdk/router";

// Get the current game state
export const getGameState = async (gameId: string, ctx?: RouteContext) => {
  try {
    const doId = ctx!.env.BOARD_GAME_DURABLE_OBJECT.idFromName(gameId);
    const gameDO = ctx!.env.BOARD_GAME_DURABLE_OBJECT.get(doId);
    
    const gameState = await gameDO.getGameState();
    
    // Convert to plain serializable object
    return JSON.parse(JSON.stringify(gameState));
  } catch (error) {
    console.error("Error fetching game state:", error);
    
    // Return a default empty state that matches your GameState interface
    return {
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
  }
};

// Add a player to the game
export const joinGame = async (gameId: string, userId: string, name: string, ctx?: RouteContext) => {
  try {
    const doId = ctx!.env.BOARD_GAME_DURABLE_OBJECT.idFromName(gameId);
    const gameDO = ctx!.env.BOARD_GAME_DURABLE_OBJECT.get(doId);
    
    // Call the method directly
    return await gameDO.addPlayer(userId, name);
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
    
    // Call the method directly
    return await gameDO.startGame();
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
    
    // Call the method directly
    return await gameDO.advancePhase();
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
    
    // Call the method directly
    return await gameDO.processGameAction(action, playerId, actionData);
  } catch (error) {
    console.error("Error performing game action:", error);
    return null;
  }
};