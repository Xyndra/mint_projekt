import { gameState } from "../game.svelte";
import { startMovementPhase } from "./movementPhase";

export interface DicePhaseState {
    active: boolean;
    playerName: string;
    diceResults?: number[];
    totalMoves?: number;
}

export function startDicePhase(playerName: string): void {
    if (!gameState.hasStarted) {
        throw new Error("Game has not started yet");
    }

    gameState.dicePhase = {
        active: true,
        playerName,
        diceResults: undefined,
        totalMoves: undefined,
    };
}

export function setDiceResults(diceResults: number[]): void {
    if (!gameState.dicePhase?.active) {
        throw new Error("Not in dice phase");
    }

    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    if (currentPlayer.name !== gameState.localPlayer) {
        throw new Error("It's not your turn");
    }

    if (gameState.dicePhase.playerName !== currentPlayer.name) {
        throw new Error("Not your dice phase");
    }

    const totalMoves = diceResults.reduce((sum, value) => sum + value, 0);
    gameState.dicePhase.diceResults = diceResults;
    gameState.dicePhase.totalMoves = totalMoves;
}

export function endDicePhase(): void {
    if (!gameState.dicePhase?.active) {
        return;
    }

    const totalMoves = gameState.dicePhase.totalMoves;
    const playerName = gameState.dicePhase.playerName;

    // Clear dice phase
    gameState.dicePhase = undefined;

    // Start movement phase with the dice results
    if (totalMoves && totalMoves > 0) {
        startMovementPhase(totalMoves, playerName);
    }
}
