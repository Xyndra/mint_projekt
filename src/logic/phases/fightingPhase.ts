import { endTurn, gameState } from "../game.svelte";
import { autoSync } from "../sync";
import { startCatchingPhase } from "./catchingPhase";
import { startDicePhase } from "./dicePhase";
import { getAttackPower } from "../pokemon";

export interface FightingPhaseState {
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
}

export function startFightingPhase(
    initiator: string,
    opponents: string[],
): void {
    if (!gameState.hasStarted) {
        throw new Error("Das Spiel hat noch nicht begonnen");
    }

    // Clear movement phase
    gameState.movementPhase = undefined;

    const allFighters = [initiator, ...opponents];

    // Filter fighters to only include those with living Pokemon
    const fightersWithPokemon = allFighters.filter((fighterName) => {
        const fighter = gameState.players.find((p) => p.name === fighterName);
        return fighter && fighter.pokemons.some((p) => p.health > 0);
    });

    if (fightersWithPokemon.length < 2) {
        // No fight possible, continue with normal turn flow
        continueAfterFight();
        return;
    }

    gameState.fightingPhase = {
        active: true,
        fighters: fightersWithPokemon,
        initiator,
        selectedPokemon: {},
        battleLog: [],
        awaitingSelection: [...fightersWithPokemon],
    };

    autoSync(gameState);
}

export async function selectPokemonForFight(
    pokemonIndex: number,
): Promise<void> {
    if (!gameState.fightingPhase?.active) {
        throw new Error("Nicht in der Kampfphase");
    }

    if (!gameState.localPlayer) {
        throw new Error("Kein lokaler Spieler gesetzt");
    }

    if (!gameState.fightingPhase.fighters.includes(gameState.localPlayer)) {
        throw new Error("Du bist nicht Teil dieses Kampfes");
    }

    if (gameState.localPlayer in gameState.fightingPhase.selectedPokemon) {
        throw new Error("Du hast bereits ein Pokemon ausgewählt");
    }

    const player = gameState.players.find(
        (p) => p.name === gameState.localPlayer,
    );
    if (!player || !player.pokemons[pokemonIndex]) {
        throw new Error("Ungültige Pokemon-Auswahl");
    }

    gameState.fightingPhase.selectedPokemon[gameState.localPlayer] =
        pokemonIndex;
    gameState.fightingPhase.awaitingSelection =
        gameState.fightingPhase.awaitingSelection.filter(
            (name) => name !== gameState.localPlayer,
        );

    console.log(
        "selectPokemonForFight: Player",
        gameState.localPlayer,
        "selected Pokemon",
        pokemonIndex,
    );
    console.log(
        "selectPokemonForFight: Remaining awaiting selection:",
        gameState.fightingPhase.awaitingSelection,
    );

    // Check if all fighters have selected their Pokemon
    await checkAndExecuteFight();

    autoSync(gameState);
}

// Helper function to check if fight should be executed and execute it
export async function checkAndExecuteFight(): Promise<void> {
    if (!gameState.fightingPhase?.active) {
        return;
    }

    // Skip if battle already started (has battle log)
    if (gameState.fightingPhase.battleLog.length > 0) {
        return;
    }

    // Check if all fighters have selected their Pokemon
    const allSelected = gameState.fightingPhase.fighters.every(
        (fighterName) =>
            fighterName in gameState.fightingPhase!.selectedPokemon,
    );

    console.log("checkAndExecuteFight: State check", {
        fighters: gameState.fightingPhase.fighters,
        selectedPokemon: gameState.fightingPhase.selectedPokemon,
        awaitingSelection: gameState.fightingPhase.awaitingSelection,
        allSelected,
        awaitingLength: gameState.fightingPhase.awaitingSelection.length,
        battleLogLength: gameState.fightingPhase.battleLog.length,
    });

    // Additional debug logging for stuck states
    if (allSelected && gameState.fightingPhase.awaitingSelection.length > 0) {
        console.warn(
            "STUCK STATE DETECTED: All players selected but awaitingSelection not empty",
            {
                allSelectedPlayers: gameState.fightingPhase.fighters.filter(
                    (name) => name in gameState.fightingPhase!.selectedPokemon,
                ),
                awaitingPlayers: gameState.fightingPhase.awaitingSelection,
            },
        );

        // Fix the stuck state by clearing awaitingSelection
        gameState.fightingPhase.awaitingSelection = [];
        console.log("FIXING STUCK STATE: Cleared awaitingSelection array");
    }

    if (allSelected && gameState.fightingPhase.awaitingSelection.length === 0) {
        console.log(
            "checkAndExecuteFight: All players selected, starting fight",
        );
        await executeFight();
    }
}

// Export function to manually fix stuck states (for debugging)
export function fixStuckFightState(): void {
    if (!gameState.fightingPhase?.active) {
        console.log("No active fighting phase to fix");
        return;
    }

    const allSelected = gameState.fightingPhase.fighters.every(
        (fighterName) =>
            fighterName in gameState.fightingPhase!.selectedPokemon,
    );

    if (allSelected && gameState.fightingPhase.battleLog.length === 0) {
        console.log("Fixing stuck fight state...");
        gameState.fightingPhase.awaitingSelection = [];
        checkAndExecuteFight();
        autoSync(gameState);
    }
}

export async function executeFight(): Promise<void> {
    if (!gameState.fightingPhase?.active) {
        console.warn("executeFight called but fighting phase not active");
        return;
    }

    // Prevent double execution
    if (gameState.fightingPhase.battleLog.length > 0) {
        console.warn("executeFight called but battle already started");
        return;
    }

    console.log(
        "executeFight: Starting battle with fighters:",
        gameState.fightingPhase.fighters,
    );
    console.log(
        "executeFight: Selected Pokemon:",
        gameState.fightingPhase.selectedPokemon,
    );

    // Create battle log
    gameState.fightingPhase.battleLog = ["Kampf beginnt!"];
    console.log("executeFight: Battle log initialized");

    // Store original Pokemon references to avoid index issues when removing
    const fightingPokemon: {
        fighter: string;
        pokemon: any;
        originalIndex: number;
    }[] = [];

    // Get all fighting Pokemon with their original references
    for (const fighterName of gameState.fightingPhase.fighters) {
        const fighter = gameState.players.find((p) => p.name === fighterName);
        const pokemonIndex =
            gameState.fightingPhase.selectedPokemon[fighterName];

        if (
            fighter &&
            pokemonIndex !== undefined &&
            fighter.pokemons[pokemonIndex]
        ) {
            fightingPokemon.push({
                fighter: fighterName,
                pokemon: fighter.pokemons[pokemonIndex],
                originalIndex: pokemonIndex,
            });
        }
    }

    // Process each fighter's attack
    for (const attackerData of fightingPokemon) {
        if (attackerData.pokemon.health <= 0) {
            gameState.fightingPhase.battleLog.push(
                `${attackerData.fighter}s Pokemon ist bereits besiegt!`,
            );
            continue;
        }

        const attackPower = await getAttackPower(attackerData.pokemon);

        // Attack all other fighters' Pokemon
        for (const defenderData of fightingPokemon) {
            if (defenderData.fighter === attackerData.fighter) continue;

            if (defenderData.pokemon.health <= 0) {
                continue; // Already fainted
            }

            defenderData.pokemon.health -= attackPower;
            gameState.fightingPhase.battleLog.push(
                `${attackerData.fighter}s Pokemon verursacht ${attackPower} Schaden an ${defenderData.fighter}s Pokemon!`,
            );

            if (defenderData.pokemon.health <= 0) {
                defenderData.pokemon.health = 0;
                gameState.fightingPhase.battleLog.push(
                    `${defenderData.fighter}s Pokemon ist besiegt!`,
                );
            }
        }
    }

    // Note: Defeated Pokemon (health <= 0) are kept in the team for display purposes
    // They will be automatically filtered out in UI components when selecting Pokemon for future battles

    gameState.fightingPhase.battleLog.push("Kampf beendet!");

    autoSync(gameState);
}

export function startOpponentSelection(
    initiator: string,
    availableOpponents: string[],
): void {
    if (!gameState.hasStarted) {
        throw new Error("Das Spiel hat noch nicht begonnen");
    }

    // Clear movement phase
    gameState.movementPhase = undefined;

    // Filter opponents to only include those with living Pokemon
    const opponentsWithPokemon = availableOpponents.filter((opponentName) => {
        const opponent = gameState.players.find((p) => p.name === opponentName);
        return opponent && opponent.pokemons.some((p) => p.health > 0);
    });

    if (opponentsWithPokemon.length === 0) {
        // No opponents with Pokemon, continue with normal turn flow
        continueAfterFight();
        return;
    }

    gameState.fightingPhase = {
        active: true,
        fighters: [initiator],
        initiator,
        selectedPokemon: {},
        battleLog: [],
        awaitingSelection: [],
        opponentSelectionPhase: {
            active: true,
            availableOpponents: opponentsWithPokemon,
            selectedOpponents: [],
        },
    };

    autoSync(gameState);
}

export function selectOpponentForFight(opponentName: string): void {
    if (!gameState.fightingPhase?.opponentSelectionPhase?.active) {
        throw new Error("Nicht in der Gegnerwahl-Phase");
    }

    if (!gameState.localPlayer) {
        throw new Error("Kein lokaler Spieler gesetzt");
    }

    if (gameState.fightingPhase.initiator !== gameState.localPlayer) {
        throw new Error("Du bist nicht der Initiator des Kampfes");
    }

    const { selectedOpponents } =
        gameState.fightingPhase.opponentSelectionPhase;

    if (selectedOpponents.includes(opponentName)) {
        // Remove if already selected
        gameState.fightingPhase.opponentSelectionPhase.selectedOpponents =
            selectedOpponents.filter((name) => name !== opponentName);
    } else {
        // Add if not selected
        gameState.fightingPhase.opponentSelectionPhase.selectedOpponents = [
            ...selectedOpponents,
            opponentName,
        ];
    }

    autoSync(gameState);
}

export function confirmOpponentSelection(): void {
    if (!gameState.fightingPhase?.opponentSelectionPhase?.active) {
        throw new Error("Nicht in der Gegnerwahl-Phase");
    }

    if (!gameState.localPlayer) {
        throw new Error("Kein lokaler Spieler gesetzt");
    }

    if (gameState.fightingPhase.initiator !== gameState.localPlayer) {
        throw new Error("Du bist nicht der Initiator des Kampfes");
    }

    const selectedOpponents =
        gameState.fightingPhase.opponentSelectionPhase.selectedOpponents;

    if (selectedOpponents.length === 0) {
        throw new Error("Du musst mindestens einen Gegner auswählen");
    }

    // Start the actual fight with selected opponents
    startFightingPhase(gameState.fightingPhase.initiator, selectedOpponents);
}

export function continueAfterFight(): void {
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

    endTurn();
}
