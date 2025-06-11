import { endTurn, gameState } from "../game.svelte";
import { startCatchingPhase } from "./catchingPhase";
import { startFightingPhase, startOpponentSelection } from "./fightingPhase";
import { startDicePhase } from "./dicePhase";

export interface MovementPhaseState {
    active: boolean;
    remainingMoves: number;
    playerName: string;
}

export function startMovementPhase(moves: number, playerName?: string): void {
    if (!gameState.hasStarted) {
        throw new Error("Game has not started yet");
    }

    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    const targetPlayerName = playerName || currentPlayer.name;

    if (targetPlayerName !== currentPlayer.name) {
        throw new Error("Player name mismatch");
    }

    gameState.movementPhase = {
        active: true,
        remainingMoves: moves,
        playerName: targetPlayerName,
    };
}

export function doPlayerMove(newPosition: number): void {
    if (!gameState.hasStarted) {
        throw new Error("Game has not started yet");
    }

    if (!gameState.movementPhase?.active) {
        throw new Error("Not in movement phase");
    }

    // check if player index is currentPlayerIndex
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    if (currentPlayer.name !== gameState.localPlayer) {
        throw new Error("It's not your turn");
    }

    if (gameState.movementPhase.playerName !== currentPlayer.name) {
        throw new Error("Not your movement phase");
    }

    // Check for valid player and position
    if (!currentPlayer) {
        throw new Error("Player not found");
    } else if (newPosition < 0 || newPosition >= gameState.map.points.size) {
        throw new Error("Invalid position");
    }

    const currentPoint = gameState.map.points.get(currentPlayer.position);
    const targetPoint = gameState.map.points.get(newPosition);

    if (!currentPoint) {
        throw new Error("No map point found at the current position");
    } else if (!targetPoint) {
        throw new Error("No map point found at the target position");
    } else if (!currentPoint.connectedPoints.includes(newPosition)) {
        throw new Error(
            "Target position is not connected to the current position",
        );
    }

    // Move the player
    currentPlayer.position = newPosition;
    gameState.movementPhase.remainingMoves--;

    console.log(
        `Moved to position ${newPosition}, ${gameState.movementPhase.remainingMoves} moves remaining`,
    );

    // Check if movement phase is complete
    if (gameState.movementPhase.remainingMoves <= 0) {
        endMovementPhase();
    }
}

export function endMovementPhase(): void {
    if (!gameState.movementPhase?.active) {
        return;
    }

    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    const currentPoint = gameState.map.points.get(currentPlayer.position);

    // Check for other players on the same space for potential fight
    const playersOnSameSpace = gameState.players.filter(
        (player) =>
            player.position === currentPlayer.position &&
            player.name !== currentPlayer.name,
    );

    if (playersOnSameSpace.length > 0) {
        // Start fighting phase
        if (playersOnSameSpace.length === 1) {
            // Only one opponent, fight directly
            startFightingPhase(
                currentPlayer.name,
                playersOnSameSpace.map((p) => p.name),
            );
        } else {
            // Multiple opponents, let initiator choose
            startOpponentSelection(
                currentPlayer.name,
                playersOnSameSpace.map((p) => p.name),
            );
        }
        return; // Don't end the turn yet
    }

    if (currentPoint) {
        // Trigger point effects
        if (!currentPoint.alreadyVisited.includes(currentPlayer.name)) {
            currentPoint.alreadyVisited.push(currentPlayer.name);
            if (currentPoint.oneTimeModifier) {
                currentPoint.oneTimeModifier(currentPlayer);
            }
        }

        // Check if this is a catch point
        if (currentPoint.kind === "catch") {
            // Start catching phase instead of ending turn
            const randomDexNumber = Math.floor(Math.random() * 1020) + 1; // Random Pokemon 1-1020
            startCatchingPhase(currentPlayer.name, randomDexNumber);
            return; // Don't end the turn yet
        }

        if (currentPoint.multipleTimeModifier) {
            currentPoint.multipleTimeModifier(currentPlayer);
        }
    }

    // Clear movement phase
    gameState.movementPhase = undefined;

    endTurn();
}
