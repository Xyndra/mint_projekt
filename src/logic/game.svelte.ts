import type { Pokemon } from "./pokemon";
import type { PlayerKind } from "../lib/PlayerDisplay.svelte";

type Item = "potion" | "revive" | "berry";

export type Player = {
    name: string;
    avatar: PlayerKind;
    position: number;
    pokemons: Pokemon[];
    items: Item[];
};

import type { MapPoint } from "./mapPoints";

type GameMap = {
    points: Map<number, MapPoint>;
};

export type GameState = {
    players: Player[];
    map: GameMap;
    currentPlayerIndex: number;
    hasStarted?: boolean;
    winner?: Player;
};

export var gameState: GameState = $state({
    players: [
        {
            name: "Player 1",
            avatar: "ash",
            position: 1,
            pokemons: [],
            items: [],
        },
        {
            name: "Player 2",
            avatar: "gary",
            position: 2,
            pokemons: [],
            items: [],
        },
        {
            name: "Player 3",
            avatar: "giovanni",
            position: 0,
            pokemons: [],
            items: [],
        },
        {
            name: "Player 4",
            avatar: "serena",
            position: 0,
            pokemons: [],
            items: [],
        },
    ],
    map: {
        points: new Map<number, MapPoint>(),
    },
    currentPlayerIndex: 1,
});

export function addPlayer(name: string, avatar: PlayerKind): void {
    if (gameState.players.length >= 4) {
        throw new Error("Maximum number of players reached");
    } else if (gameState.players.some((player) => player.name === name)) {
        throw new Error("Player with this name already exists");
    } else if (gameState.hasStarted) {
        throw new Error("Cannot add players after the game has started");
    }
    gameState.players.push({
        name: name,
        avatar: avatar,
        position: 0,
        pokemons: [],
        items: [],
    });
}

export function startGame(): void {
    if (gameState.players.length < 2) {
        throw new Error("Not enough players to start the game");
    }
    gameState.hasStarted = true;
}

export function doPlayerMove(playerName: string, newPosition: number): void {
    if (!gameState.hasStarted) {
        throw new Error("Game has not started yet");
    }

    // check if player index is currentPlayerIndex
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    if (currentPlayer.name !== playerName) {
        throw new Error("It's not your turn");
    }

    // Check for valid player and position
    if (!currentPlayer) {
        throw new Error("Player not found");
    } else if (newPosition < 0 || newPosition >= gameState.map.points.size) {
        throw new Error("Invalid position");
    }

    currentPlayer.position = newPosition;
    const currentPoint = gameState.map.points.get(newPosition);
    if (!currentPoint) {
        throw new Error("No map point found at the new position");
    } else if (
        !currentPoint.connectedPoints.findIndex(
            (p) => p === currentPlayer.position,
        )
    ) {
        throw new Error(
            "New position is not connected to the current position",
        );
    }

    if (!currentPoint.alreadyVisited.includes(playerName)) {
        currentPoint.alreadyVisited.push(playerName);
        if (currentPoint.oneTimeModifier) {
            currentPoint.oneTimeModifier(currentPlayer);
        }
    }
    if (currentPoint.multipleTimeModifier) {
        currentPoint.multipleTimeModifier(currentPlayer);
    }
}
