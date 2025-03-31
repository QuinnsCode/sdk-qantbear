//RW_TODO: I Have to use this @/app/pages/game/BoardGame here but not on other app
// import { BoardGame } from "@/app/pages/game/BoardGame";
// import { getGameState } from "./functions";
// import { RouteContext } from "@redwoodjs/sdk/router";

// const Game = async (ctx: RouteContext) => {
//   const gameId = ctx.params.gameId;
//   try {
//     const gameState = await getGameState(gameId, ctx);
//     // Ensure serializable state
//     const safeGameState = JSON.parse(JSON.stringify(gameState || {}));
//     return <BoardGame props={{ initialGameState: safeGameState, gameId }} />;
//   } catch (error) {
//     console.error("Error loading game:", error);
//     return <div>Error loading game: {String(error)}</div>;
//   }
// };

// export default Game;

import { Static } from '@/app/pages/game/Static';
import { getGameState } from "./functions";
import { RouteContext } from "@redwoodjs/sdk/router";

const Game = async (ctx: RouteContext) => {
  const gameId = ctx.params.gameId;
  
  try {
    const gameState = await getGameState(gameId, ctx);
    
    // Ensure we have a serializable object
    const safeGameState = JSON.parse(JSON.stringify(gameState || {}));
    
    return <Static props={{ initialGameState: safeGameState, gameId }} />;
  } catch (error) {
    // Add error handling to help diagnose issues
    console.error("Error in Game component:", error);
    
    // Return a fallback UI
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        <h1>Error Loading Game</h1>
        <p>There was an error loading the game state.</p>
        <p>Game ID: {gameId}</p>
        <pre>{String(error)}</pre>
      </div>
    );
  }
};

export default Game;