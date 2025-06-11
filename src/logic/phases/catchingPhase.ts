import { endTurn, gameState } from "../game.svelte";
import { autoSync } from "../sync";
import { startDicePhase } from "./dicePhase";

export interface CatchingPhaseState {
    active: boolean;
    playerName: string;
    wildPokemonDexNumber: number;
}

export function startCatchingPhase(
    playerName: string,
    wildPokemonDexNumber: number,
): void {
    gameState.movementPhase = undefined; // Clear movement phase
    gameState.catchingPhase = {
        active: true,
        playerName,
        wildPokemonDexNumber,
    };
}

export function endCatchingPhase(): void {
    if (!gameState.catchingPhase?.active) {
        return;
    }

    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    const currentPoint = gameState.map.points.get(currentPlayer.position);

    // Trigger any remaining point effects that might not have been triggered
    if (currentPoint && currentPoint.multipleTimeModifier) {
        currentPoint.multipleTimeModifier(currentPlayer);
    }

    endTurn();
}
