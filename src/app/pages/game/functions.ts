"use server";

import { RouteContext } from "@redwoodjs/sdk/router";

export const getGameState = async (gameId: string, ctx?: RouteContext) => {
  const doId = ctx!.env.BOARD_GAME_DURABLE_OBJECT.idFromName(gameId);
  const gameDO = ctx!.env.BOARD_GAME_DURABLE_OBJECT.get(doId);
  return gameDO.getGameState();
};

export const joinGame = async (gameId: string, userId: string, name: string, ctx?: RouteContext) => {
  const doId = ctx!.env.BOARD_GAME_DURABLE_OBJECT.idFromName(gameId);
  const gameDO = ctx!.env.BOARD_GAME_DURABLE_OBJECT.get(doId);
  return gameDO.addPlayer(userId, name);
};

export const startGame = async (gameId: string, ctx?: RouteContext) => {
  const doId = ctx!.env.BOARD_GAME_DURABLE_OBJECT.idFromName(gameId);
  const gameDO = ctx!.env.BOARD_GAME_DURABLE_OBJECT.get(doId);
  return gameDO.startGame();
};

export const advancePhase = async (gameId: string, ctx?: RouteContext) => {
  const doId = ctx!.env.BOARD_GAME_DURABLE_OBJECT.idFromName(gameId);
  const gameDO = ctx!.env.BOARD_GAME_DURABLE_OBJECT.get(doId);
  return gameDO.advancePhase();
};

export const performGameAction = async (
  gameId: string,
  playerId: string,
  action: string,
  actionData: any,
  ctx?: RouteContext
) => {
  const doId = ctx!.env.BOARD_GAME_DURABLE_OBJECT.idFromName(gameId);
  const gameDO = ctx!.env.BOARD_GAME_DURABLE_OBJECT.get(doId);
  return (gameDO as any).processGameAction(action, playerId, actionData);
};