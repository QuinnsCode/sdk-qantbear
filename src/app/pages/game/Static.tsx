"use client";

export const Static = ({
  props,
}: {
  props: { 
    initialGameState: any; 
    gameId: string 
  };
}) => {
  const { gameId, initialGameState } = props;
  
  // Very minimal component with no state or effects
  return (
    <div style={{ padding: '20px' }}>
      <h1>Static Test Component</h1>
      <p>Game ID: {gameId}</p>
      <p>State received: {initialGameState ? "Yes" : "No"}</p>
      <pre style={{ background: '#f0f0f0', padding: '10px' }}>
        {JSON.stringify({
          gameId,
          stateInfo: initialGameState ? {
            players: initialGameState.players?.length || 0,
            phase: initialGameState.currentPhase,
            turn: initialGameState.currentTurn
          } : null
        }, null, 2)}
      </pre>
    </div>
  );
};