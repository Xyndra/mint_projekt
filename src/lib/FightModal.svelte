<script lang="ts">
    import { gameState } from "../logic/game.svelte";
    import {
        selectPokemonForFight,
        confirmOpponentSelection,
        checkAndExecuteFight,
        continueAfterFight,
    } from "../logic/phases/fightingPhase";
    import PokemonDisplay from "./PokemonDisplay.svelte";

    let modal: HTMLDialogElement;
    let localPlayerInFight = $state(false);
    let hasSelectedPokemon = $state(false);
    let awaitingSelection: string[] = $state([]);
    let battleLog: string[] = $state([]);
    let opponentSelectionPhase = $state({
        active: false,
        availableOpponents: [] as string[],
        selectedOpponents: [] as string[],
    });
    let isInitiator = $state(false);

    let currentPlayer = $derived(
        gameState.players.find((p) => p.name === gameState.localPlayer),
    );

    let fighters = $derived(
        gameState.fightingPhase?.fighters
            ?.map((fighterName) =>
                gameState.players.find((p) => p.name === fighterName),
            )
            .filter(Boolean) || [],
    );

    export function openModal() {
        if (modal) {
            modal.showModal();
        }
    }

    export function closeModal() {
        if (modal) {
            modal.close();
        }
    }

    async function handlePokemonSelect(index: number) {
        if (!gameState.fightingPhase || hasSelectedPokemon) return;

        try {
            await selectPokemonForFight(index);
        } catch (error) {
            console.error("Error selecting Pokemon for fight:", error);
        }
    }

    function handleClose() {
        continueAfterFight();
        closeModal();
    }

    function handleOpponentSelect(opponentName: string) {
        if (!opponentSelectionPhase.active) return;

        if (opponentSelectionPhase.selectedOpponents.includes(opponentName)) {
            opponentSelectionPhase.selectedOpponents =
                opponentSelectionPhase.selectedOpponents.filter(
                    (name) => name !== opponentName,
                );
        } else {
            opponentSelectionPhase.selectedOpponents = [
                ...opponentSelectionPhase.selectedOpponents,
                opponentName,
            ];
        }
    }

    function handleConfirmOpponents() {
        if (
            !isInitiator ||
            opponentSelectionPhase.selectedOpponents.length === 0
        )
            return;

        try {
            confirmOpponentSelection();
        } catch (error) {
            console.error("Error confirming opponents:", error);
        }
    }

    async function handleRecoveryCheck() {
        try {
            await checkAndExecuteFight();
        } catch (error) {
            console.error("Error in recovery check:", error);
        }
    }

    // Auto-open modal when fighting phase is active for local player
    $effect(() => {
        if (gameState.fightingPhase?.active) {
            localPlayerInFight =
                gameState.fightingPhase.fighters?.includes(
                    gameState.localPlayer || "",
                ) || false;

            if (localPlayerInFight && modal && !modal.open) {
                openModal();
            }
        } else {
            localPlayerInFight = false;
            if (modal && modal.open) {
                closeModal();
            }
        }
    });

    // Update fighting state
    $effect(() => {
        if (gameState.fightingPhase?.active) {
            hasSelectedPokemon = Boolean(
                gameState.fightingPhase.selectedPokemon &&
                    gameState.localPlayer &&
                    gameState.localPlayer in
                        gameState.fightingPhase.selectedPokemon,
            );

            awaitingSelection = gameState.fightingPhase.awaitingSelection || [];
            battleLog = gameState.fightingPhase.battleLog || [];

            if (gameState.fightingPhase.opponentSelectionPhase) {
                opponentSelectionPhase = {
                    active: true,
                    availableOpponents:
                        gameState.fightingPhase.opponentSelectionPhase
                            .availableOpponents || [],
                    selectedOpponents:
                        gameState.fightingPhase.opponentSelectionPhase
                            .selectedOpponents || [],
                };
                isInitiator =
                    gameState.fightingPhase.initiator === gameState.localPlayer;
            } else {
                opponentSelectionPhase = {
                    active: false,
                    availableOpponents: [],
                    selectedOpponents: [],
                };
                isInitiator = false;
            }
        }
    });
</script>

<dialog bind:this={modal} class="modal">
    <div class="modal-box max-w-4xl">
        <h2 class="text-2xl font-bold mb-4 text-center">🥊 Pokemon Kampf!</h2>

        <!-- Status Display -->
        <div class="mb-6 text-center">
            {#if opponentSelectionPhase?.active}
                <p class="text-lg">
                    {#if isInitiator}
                        Wähle deine Gegner für den Kampf aus:
                    {:else}
                        Warte auf die Gegnerwahl des Initiators...
                    {/if}
                </p>
            {:else if awaitingSelection.length > 0 && battleLog.length === 0}
                <p class="text-lg">
                    Warte auf Pokemon-Auswahl der anderen Spieler...
                </p>
                <div class="mt-2">
                    <span class="text-sm text-gray-600">
                        Wartend auf: {awaitingSelection.join(", ")}
                    </span>
                </div>
                {#if gameState.fightingPhase?.fighters.every((fighterName) => fighterName in (gameState.fightingPhase?.selectedPokemon || {}))}
                    <div class="mt-3">
                        <p class="text-sm text-yellow-600">
                            Alle Spieler haben gewählt, aber der Kampf ist noch
                            nicht gestartet.
                        </p>
                        <button
                            class="btn btn-sm btn-warning mt-2"
                            onclick={handleRecoveryCheck}
                        >
                            Kampf manuell starten
                        </button>
                    </div>
                {/if}
            {:else if battleLog.length > 0}
                <p class="text-lg font-bold text-green-600">Kampf beendet!</p>
            {:else}
                <p class="text-lg">Wähle dein Pokemon für den Kampf!</p>
            {/if}
        </div>

        <!-- Opponent Selection Phase -->
        {#if opponentSelectionPhase?.active}
            <div class="mb-6">
                <h3 class="text-lg font-semibold mb-3">
                    {#if isInitiator}
                        Verfügbare Gegner:
                    {:else}
                        Kampfteilnehmer werden ausgewählt...
                    {/if}
                </h3>
                <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {#each opponentSelectionPhase.availableOpponents as opponentName}
                        {@const opponent = gameState.players.find(
                            (p) => p.name === opponentName,
                        )}
                        {#if opponent}
                            <button
                                class="p-4 border rounded-lg transition-colors {opponentSelectionPhase.selectedOpponents.includes(
                                    opponentName,
                                )
                                    ? 'bg-blue-100 border-blue-500'
                                    : 'bg-gray-50 border-gray-300 hover:bg-gray-100'}"
                                onclick={() =>
                                    handleOpponentSelect(opponentName)}
                                disabled={!isInitiator}
                            >
                                <div class="font-semibold">
                                    {opponent.name}
                                </div>
                                <div class="text-sm text-gray-600">
                                    {opponent.pokemons.filter(
                                        (p) => p.health > 0,
                                    ).length} verfügbare Pokemon
                                </div>
                                {#if opponentSelectionPhase.selectedOpponents.includes(opponentName)}
                                    <div
                                        class="mt-2 text-blue-600 text-sm font-medium"
                                    >
                                        ✓ Ausgewählt
                                    </div>
                                {/if}
                            </button>
                        {/if}
                    {/each}
                </div>

                {#if isInitiator && opponentSelectionPhase.selectedOpponents.length > 0}
                    <div class="mt-4 text-center">
                        <button
                            class="btn btn-primary"
                            onclick={handleConfirmOpponents}
                        >
                            Gegner bestätigen ({opponentSelectionPhase
                                .selectedOpponents.length})
                        </button>
                    </div>
                {/if}
            </div>
        {:else}
            <!-- Fighter Status -->
            <div class="mb-6">
                <h3 class="text-lg font-semibold mb-3">Kampfteilnehmer:</h3>
                <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {#each fighters as fighter}
                        <div class="p-4 border rounded-lg bg-gray-50">
                            <div class="font-semibold">
                                {fighter!.name}
                                {#if fighter!.name === gameState.fightingPhase?.initiator}
                                    <span class="text-sm text-blue-600 ml-1">
                                        (Initiator)
                                    </span>
                                {/if}
                            </div>
                            <div class="text-sm text-gray-600">
                                {fighter!.pokemons.filter((p) => p.health > 0)
                                    .length} verfügbare Pokemon
                            </div>
                            {#if gameState.fightingPhase?.selectedPokemon && fighter!.name in gameState.fightingPhase.selectedPokemon}
                                <div
                                    class="mt-2 text-green-600 text-sm font-medium"
                                >
                                    ✓ Pokemon ausgewählt
                                </div>
                            {:else if awaitingSelection.includes(fighter!.name)}
                                <div
                                    class="mt-2 text-yellow-600 text-sm font-medium"
                                >
                                    ⏳ Wählt Pokemon...
                                </div>
                            {/if}
                        </div>
                    {/each}
                </div>
            </div>
        {/if}

        <!-- Pokemon Selection -->
        {#if localPlayerInFight && !hasSelectedPokemon && awaitingSelection.length > 0 && currentPlayer && !opponentSelectionPhase?.active}
            <div class="mb-6">
                <h3 class="text-lg font-semibold mb-3">Wähle dein Pokemon:</h3>
                <div
                    class="grid grid-cols-2 md:grid-cols-3 gap-4 h-96 overflow-y-auto"
                >
                    {#each currentPlayer.pokemons as pokemon, index}
                        {#if pokemon.health > 0}
                            <button
                                class="p-4 border rounded-lg hover:bg-gray-50 transition-colors border-gray-300"
                                onclick={() => handlePokemonSelect(index)}
                            >
                                <div class="w-full h-full">
                                    <PokemonDisplay {pokemon} />
                                </div>
                            </button>
                        {/if}
                    {/each}
                </div>

                {#if currentPlayer.pokemons.filter((p) => p.health > 0).length === 0}
                    <div class="text-center text-gray-600 p-4">
                        Keine kampffähigen Pokemon verfügbar.
                    </div>
                {/if}
            </div>
        {/if}

        <!-- Battle Log -->
        {#if battleLog.length > 0}
            <div class="mb-6">
                <h3 class="text-lg font-semibold mb-3">Kampfverlauf:</h3>
                <div
                    class="bg-gray-100 p-4 rounded-lg max-h-48 overflow-y-auto"
                >
                    {#each battleLog as logEntry}
                        <div class="text-sm mb-1">{logEntry}</div>
                    {/each}
                </div>
            </div>
        {/if}

        <!-- Selected Pokemon Display -->
        {#if gameState.fightingPhase?.selectedPokemon && Object.keys(gameState.fightingPhase.selectedPokemon).length > 0}
            <div class="mb-6">
                <h3 class="text-lg font-semibold mb-3">Ausgewählte Pokemon:</h3>
                <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {#each fighters as fighter}
                        {#if gameState.fightingPhase?.selectedPokemon && fighter!.name in gameState.fightingPhase.selectedPokemon}
                            {@const pokemonIndex =
                                gameState.fightingPhase.selectedPokemon[
                                    fighter!.name
                                ]}
                            {@const pokemon = fighter!.pokemons[pokemonIndex]}
                            {#if pokemon}
                                <div
                                    class="p-4 border rounded-lg bg-blue-50 border-blue-300"
                                >
                                    <div class="font-semibold mb-2">
                                        {fighter!.name}
                                    </div>
                                    <PokemonDisplay {pokemon} />
                                </div>
                            {/if}
                        {/if}
                    {/each}
                </div>
            </div>
        {/if}

        <!-- Controls -->
        <div class="flex justify-center">
            {#if battleLog.length > 0}
                <button class="btn btn-primary" onclick={handleClose}>
                    Schließen
                </button>
            {:else if opponentSelectionPhase?.active && !isInitiator}
                <div class="text-center text-gray-600">
                    Warte auf Gegnerwahl...
                </div>
            {:else if !localPlayerInFight && !opponentSelectionPhase?.active}
                <div class="text-center text-gray-600">
                    Du nimmst nicht an diesem Kampf teil.
                </div>
            {:else if hasSelectedPokemon}
                <div class="text-center text-gray-600">
                    Pokemon ausgewählt. Warte auf andere Spieler...
                </div>
            {/if}
        </div>
    </div>
</dialog>
