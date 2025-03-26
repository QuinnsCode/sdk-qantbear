"use server";

import { RouteContext } from "@redwoodjs/sdk/router";

export const getBoard = async (gameId: string, ctx?: RouteContext) => {
  const doId = ctx!.env.GAME_DURABLE_OBJECT.idFromName(gameId);
  const gameDO = ctx!.env.GAME_DURABLE_OBJECT.get(doId);
  return gameDO.getBoard();
};

export const updateBoard = async (
  gameId: string,
  board: string[],
  ctx?: RouteContext,
) => {
  const doId = ctx!.env.GAME_DURABLE_OBJECT.idFromName(gameId);
  const gameDO = ctx!.env.GAME_DURABLE_OBJECT.get(doId);
  await gameDO.setBoard(board);
};