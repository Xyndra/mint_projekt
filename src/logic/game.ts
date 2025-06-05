type Pokemon = {
    name: string;
    attack: number;
    health: number;
}

type Item = 'potion' | 'revive' | 'berry';

type Player = {
    name: string;
    avatar: string;
    position: number;
    pokemons: Pokemon[];
    items: Item[];
}

type MapPoint = {
    kind: 'empty' | 'pokemon' | 'item';
    color: string;
    connectedPoints: number[];
    oneTimeModifier?: (player: Player) => void;
    alreadyVisited: string[]; // Player names
    multipleTimeModifier?: (player: Player) => void;
}

type GameMap = {
    points: Map<number, MapPoint>;
}

type GameState = {
    players: Player[];
    map: GameMap;
    currentPlayerIndex: number;
    hasStarted?: boolean;
    winner?: Player;
}

var gameState: GameState = {
    players: [],
    map: {
        points: new Map<number, MapPoint>()
    },
    currentPlayerIndex: 0
};

export function addPlayer(name: string, avatar: string): void {
    if (gameState.players.length >= 4) {
        throw new Error("Maximum number of players reached");
    } else if (gameState.players.some(player => player.name === name)) {
        throw new Error("Player with this name already exists");
    } else if (gameState.hasStarted) {
        throw new Error("Cannot add players after the game has started");
    }
    gameState.players.push({
        name: name,
        avatar: avatar,
        position: 0,
        pokemons: [],
        items: []
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
    } else if (!currentPoint.connectedPoints.findIndex(p => p === currentPlayer.position)) {
        throw new Error("New position is not connected to the current position");
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