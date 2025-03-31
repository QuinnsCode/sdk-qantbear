import { BoardGame } from "./BoardGame";  
import { getGameState } from "./boardGamefunctions";
import { RouteContext } from "@redwoodjs/sdk/router";

const Game = async (ctx: RouteContext) => {
  const gameId = ctx.params.gameId;
  const gameState = await getGameState(gameId, ctx);
  return <BoardGame props={{ initialGameState: gameState, gameId }} />;
};

export default Game;