import { Board2210AD } from "../../components/Board2210AD";
import { getGameState } from "./boardGamefunctions";
import { RouteContext } from "@redwoodjs/sdk/router";

const Game2210 = async (ctx: RouteContext) => {
  const gameId = ctx.params.gameId;
  const gameState = await getGameState(gameId, ctx);
  return <Board2210AD props={{ initialGameState: gameState, gameId }} />;
};

export default Game2210;