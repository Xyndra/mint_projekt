import { type GameState, gameState, setGameState } from "./game.svelte";

// Generate unique tab identifier
function generateTabId(): string {
    return `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Get or create tab ID
function getTabId(): string {
    let tabId = sessionStorage.getItem("tabId");
    if (!tabId) {
        tabId = generateTabId();
        sessionStorage.setItem("tabId", tabId);
    }
    return tabId;
}

// Save local player to localStorage with tab differentiation
function saveLocalPlayer(playerName: string | undefined): void {
    const tabId = getTabId();
    const key = `localPlayer_${tabId}`;
    if (playerName) {
        localStorage.setItem(key, playerName);
    } else {
        localStorage.removeItem(key);
    }
}

// Load local player from localStorage for current tab
function loadLocalPlayer(): string | undefined {
    const tabId = getTabId();
    const key = `localPlayer_${tabId}`;
    return localStorage.getItem(key) || undefined;
}

// Syncable state type (excludes map)
export type SyncableGameState = Omit<Omit<GameState, "map">, "localPlayer">;

// Serialize game state for syncing (excluding map)
function serializeGameState(gameState: GameState): string {
    const syncableState: SyncableGameState = {
        players: gameState.players,
        currentPlayerIndex: gameState.currentPlayerIndex,
        hasStarted: gameState.hasStarted,
        winner: gameState.winner,
        movementPhase: gameState.movementPhase,
    };
    return JSON.stringify(syncableState);
}

// Deserialize and merge game state from server (excluding map)
function deserializeGameState(
    data: string,
    gameState: GameState,
    overwriteState: boolean,
): void {
    try {
        const syncableState: SyncableGameState = JSON.parse(data);
        if (overwriteState) {
            setGameState(syncableState);
        } else {
            gameState.players = syncableState.players;
            gameState.currentPlayerIndex = syncableState.currentPlayerIndex;
            gameState.hasStarted = syncableState.hasStarted;
            gameState.winner = syncableState.winner;
            gameState.movementPhase = syncableState.movementPhase;
        }
    } catch (error) {
        console.error("Failed to deserialize game state:", error);
        console.log(data);
        console.log(gameState);
    }
}

// Sync state with server
export async function syncStateToServer(gameState: GameState): Promise<void> {
    try {
        const response = await fetch("/api/state", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: serializeGameState(gameState),
        });
        if (!response.ok) {
            throw new Error(`Failed to sync state: ${response.statusText}`);
        }
    } catch (error) {
        console.error("Failed to sync state to server:", error);
    }
}

// Load state from server
export async function loadStateFromServer(
    gameState: GameState,
    overwriteState: boolean = true,
): Promise<void> {
    try {
        const response = await fetch("/api/state");
        if (response.ok) {
            const data = await response.text();
            if (data !== "No state set") {
                deserializeGameState(data, gameState, overwriteState);
            }
        }
    } catch (error) {
        console.error("Failed to load state from server:", error);
    }
}

// Auto-sync state after game-changing operations
export async function autoSync(gameState: GameState): Promise<void> {
    await syncStateToServer(gameState);
}

// Manual sync functions for debugging
export async function forceSyncToServer(gameState: GameState): Promise<void> {
    console.log("Forcing sync to server...");
    await syncStateToServer(gameState);
}

export async function forceLoadFromServer(gameState: GameState): Promise<void> {
    console.log("Loading state from server...");
    await loadStateFromServer(gameState);
}

// Utility to get current syncable state as JSON string
export function getCurrentSyncableState(gameState: GameState): string {
    return serializeGameState(gameState);
}

// Utility to manually set state from JSON string
export function setStateFromJson(
    jsonString: string,
    gameState: GameState,
): void {
    deserializeGameState(jsonString, gameState, true);
}

// Initialize game state by loading from server
export async function initializeGameState(
    gameState: GameState,
): Promise<GameState> {
    console.log("Initializing game state...");
    await loadStateFromServer(gameState, false);

    // Validate that the saved local player still exists in the game
    if (gameState.localPlayer) {
        const playerExists = gameState.players.some(
            (player) => player.name === gameState.localPlayer,
        );
        if (!playerExists) {
            console.log(
                "Saved local player no longer exists in game, clearing...",
            );
            gameState.localPlayer = undefined;
            // Clear from localStorage as well
            const tabId = getTabId();
            const key = `localPlayer_${tabId}`;
            localStorage.removeItem(key);
        }
    }

    // fetch every second to keep state updated
    setInterval(() => {
        // Skip loading if we're in an active movement phase for the local player
        if (
            gameState.movementPhase?.active &&
            gameState.movementPhase.playerName === gameState.localPlayer
        ) {
            return;
        }

        loadStateFromServer(gameState);

        // Also validate local player periodically
        if (gameState.localPlayer) {
            const playerExists = gameState.players.some(
                (player) => player.name === gameState.localPlayer,
            );
            if (!playerExists) {
                console.log(
                    "Local player no longer exists in game, clearing...",
                );
                gameState.localPlayer = undefined;
                // Clear from localStorage as well
                const tabId = getTabId();
                const key = `localPlayer_${tabId}`;
                localStorage.removeItem(key);
            }
        }
    }, 1000);
    return gameState;
}

// Export tab management functions for use in other modules
export { getTabId, saveLocalPlayer, loadLocalPlayer };

// Expose sync functions to window for debugging
(window as any).forceSyncToServer = () => forceSyncToServer(gameState);
(window as any).forceLoadFromServer = () => forceLoadFromServer(gameState);
(window as any).getCurrentSyncableState = () =>
    getCurrentSyncableState(gameState);
(window as any).setStateFromJson = (jsonString: string) =>
    setStateFromJson(jsonString, gameState);
(window as any).syncStateToServer = () => syncStateToServer(gameState);
(window as any).loadStateFromServer = () => loadStateFromServer(gameState);
(window as any).initializeGameState = () => initializeGameState(gameState);

// Debug functions for local player persistence
(window as any).getTabId = getTabId;
(window as any).saveLocalPlayer = saveLocalPlayer;
(window as any).loadLocalPlayer = loadLocalPlayer;
(window as any).clearLocalPlayer = () => {
    saveLocalPlayer(undefined);
    gameState.localPlayer = undefined;
};
