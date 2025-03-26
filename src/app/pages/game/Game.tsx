import { GameBoard } from "./GameBoard";
import { getBoard } from "./functions";
import { RouteContext } from "@redwoodjs/sdk/router";

const Game = async (ctx: RouteContext) => {
  const gameId = ctx.params.gameId;
  const board = await getBoard(gameId, ctx);
  return <GameBoard props={{ initialBoard: board, gameId }} />;
};

export default Game;