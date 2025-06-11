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
import { startDicePhase } from "./phases/dicePhase";

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
    dicePhase?: {
        active: boolean;
        playerName: string;
        diceResults?: number[];
        totalMoves?: number;
    };
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
    fightingPhase?: {
        active: boolean;
        fighters: string[]; // Array of player names involved in the fight
        initiator: string; // Player who landed on the space
        selectedPokemon: Record<string, number>; // Map of player name to selected pokemon index
        battleLog: string[];
        awaitingSelection: string[]; // Players who haven't selected a Pokemon yet
        opponentSelectionPhase?: {
            active: boolean;
            availableOpponents: string[];
            selectedOpponents: string[];
        };
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
        dicePhase: undefined,
        movementPhase: undefined,
        catchingPhase: undefined,
        fightingPhase: undefined,
    }),
);

export function setGameState(newState: SyncableGameState): void {
    gameState.players = newState.players;
    gameState.currentPlayerIndex = newState.currentPlayerIndex;
    gameState.hasStarted = newState.hasStarted;
    gameState.winner = newState.winner;
    gameState.dicePhase = newState.dicePhase;
    gameState.movementPhase = newState.movementPhase;
    gameState.catchingPhase = newState.catchingPhase;
    gameState.fightingPhase = newState.fightingPhase;
}

$effect.root(() => {
    $effect(() => {
        (window as any).gameState = gameState;
        if (
            gameState.dicePhase === undefined &&
            gameState.movementPhase === undefined &&
            gameState.catchingPhase === undefined &&
            gameState.fightingPhase === undefined
        ) {
            startDicePhase(
                gameState.players[gameState.currentPlayerIndex].name,
            );
        }
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

    // Start the first player's turn with dice phase
    const firstPlayer = gameState.players[gameState.currentPlayerIndex];
    startDicePhase(firstPlayer.name);

    autoSync(gameState);
}

(window as any).startGame = startGame;

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
    gameState.dicePhase = undefined;
    gameState.movementPhase = undefined;
    gameState.catchingPhase = undefined;
    gameState.fightingPhase = undefined;
}

(window as any).resetGame = resetGame;

export function endTurn() {
    if (!gameState.hasStarted) {
        throw new Error("Game has not started yet");
    }

    // Clear current phases
    gameState.dicePhase = undefined;
    gameState.movementPhase = undefined;
    gameState.catchingPhase = undefined;
    gameState.fightingPhase = undefined;

    // Move to next player's turn
    gameState.currentPlayerIndex =
        (gameState.currentPlayerIndex + 1) % gameState.players.length;

    // Start dice phase for the next player
    const nextPlayer = gameState.players[gameState.currentPlayerIndex];
    startDicePhase(nextPlayer.name);

    autoSync(gameState);
}
