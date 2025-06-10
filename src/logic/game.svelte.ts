import type { Pokemon } from "./pokemon";
import type { PlayerKind } from "../lib/PlayerDisplay.svelte";
import { mapPoints, type MapPoint } from "./mapPoints";
import {
    autoSync,
    initializeGameState,
    type SyncableGameState,
    saveLocalPlayer,
    loadLocalPlayer,
} from "./sync";

type Item = "potion" | "revive" | "berry";

export type Player = {
    name: string;
    avatar: PlayerKind;
    position: number;
    pokemons: Pokemon[];
    items: Item[];
};

type GameMap = {
    points: Map<number, MapPoint>;
};

export type GameState = {
    players: Player[];
    localPlayer?: string;
    map: GameMap;
    currentPlayerIndex: number;
    hasStarted?: boolean;
    winner?: Player;
    movementPhase?: {
        active: boolean;
        remainingMoves: number;
        playerName: string;
    };
    catchingPhase?: {
        active: boolean;
        playerName: string;
        wildPokemonDexNumber: number;
    };
};

export var gameState: GameState = $state(
    await initializeGameState({
        players: [],
        localPlayer: loadLocalPlayer(),
        map: {
            points: new Map<number, MapPoint>(
                mapPoints.map((point: MapPoint, index: number) => [
                    index,
                    point,
                ]),
            ),
        },
        currentPlayerIndex: 0,
        movementPhase: undefined,
        catchingPhase: undefined,
    }),
);

export function setGameState(newState: SyncableGameState): void {
    gameState.players = newState.players;
    gameState.currentPlayerIndex = newState.currentPlayerIndex;
    gameState.hasStarted = newState.hasStarted;
    gameState.winner = newState.winner;
    gameState.movementPhase = newState.movementPhase;
    gameState.catchingPhase = newState.catchingPhase;
}

$effect.root(() => {
    $effect(() => {
        (window as any).gameState = gameState;
        autoSync(gameState);
    });
});

export function addPlayer(name: string, avatar: PlayerKind): void {
    if (gameState.players.length >= 4) {
        throw new Error("Maximum number of players reached");
    } else if (gameState.players.some((player) => player.name === name)) {
        throw new Error("Player with this name already exists");
    } else if (gameState.hasStarted) {
        throw new Error("Cannot add players after the game has started");
    } else if (gameState.localPlayer !== undefined) {
        throw new Error("Local player already set");
    }
    gameState.players.push({
        name: name,
        avatar: avatar,
        position: 0,
        pokemons: [],
        items: [],
    });
    gameState.localPlayer = name;
    saveLocalPlayer(name);
}

(window as any).addPlayer = addPlayer;

export function setLocalPlayer(name: string): void {
    if (gameState.localPlayer !== undefined) {
        throw new Error("Local player already set");
    }
    const player = gameState.players.find((p) => p.name === name);
    if (!player) {
        throw new Error("Player not found");
    }
    gameState.localPlayer = name;
    saveLocalPlayer(name);
}

(window as any).setLocalPlayer = setLocalPlayer;

export function startGame(): void {
    if (gameState.players.length < 2) {
        throw new Error("Not enough players to start the game");
    }
    gameState.hasStarted = true;
    autoSync(gameState);
}

(window as any).startGame = startGame;

export function startMovementPhase(moves: number): void {
    if (!gameState.hasStarted) {
        throw new Error("Game has not started yet");
    }

    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    if (currentPlayer.name !== gameState.localPlayer) {
        throw new Error("It's not your turn");
    }

    gameState.movementPhase = {
        active: true,
        remainingMoves: moves,
        playerName: currentPlayer.name,
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

    // Move to next player's turn
    gameState.currentPlayerIndex =
        (gameState.currentPlayerIndex + 1) % gameState.players.length;
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

    // Clear catching phase
    gameState.catchingPhase = undefined;

    // Move to next player's turn
    gameState.currentPlayerIndex =
        (gameState.currentPlayerIndex + 1) % gameState.players.length;

    // Trigger sync to ensure all players see the turn change
    autoSync(gameState);
}

(window as any).doPlayerMove = doPlayerMove;
(window as any).startMovementPhase = startMovementPhase;
(window as any).endMovementPhase = endMovementPhase;
(window as any).startCatchingPhase = startCatchingPhase;
(window as any).endCatchingPhase = endCatchingPhase;

export function resetGame() {
    gameState.players = [];
    gameState.localPlayer = undefined;
    saveLocalPlayer(undefined);
    gameState.map = {
        points: new Map<number, MapPoint>(
            mapPoints.map((point: MapPoint, index: number) => [index, point]),
        ),
    };
    gameState.currentPlayerIndex = 0;
    gameState.hasStarted = false;
    gameState.winner = undefined;
    gameState.movementPhase = undefined;
    gameState.catchingPhase = undefined;
}

(window as any).resetGame = resetGame;
