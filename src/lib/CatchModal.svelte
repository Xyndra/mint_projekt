<script lang="ts">
    import { gameState } from "../logic/game.svelte";
    import { endCatchingPhase } from "../logic/phases/catchingPhase";
    import {
        createPokemon,
        getPokemonNameGerman,
        type Pokemon,
    } from "../logic/pokemon";
    import { autoSync } from "../logic/sync";
    import PokemonDisplay from "./PokemonDisplay.svelte";

    let modal: HTMLDialogElement;
    let catchingInProgress = $state(false);
    let catchResult: "success" | "failure" | null = $state(null);
    let pokemonDexNumber = $state(0);

    let catchingPokemon: Pokemon | null = $state(null);
    let showResult = $state(false);
    let pokemonGermanName = $state("");

    export async function openModal(dexNumber: number) {
        pokemonDexNumber = dexNumber;
        catchResult = null;
        showResult = false;
        catchingInProgress = false;

        catchingPokemon = null;

        try {
            catchingPokemon = await createPokemon(dexNumber);
            if (catchingPokemon) {
                pokemonGermanName = await getPokemonNameGerman(catchingPokemon);
            }
        } catch (error) {
            console.error("Error fetching Pokemon data:", error);
        }

        if (modal) {
            modal.showModal();
        }
    }

    export function closeModal() {
        if (modal) {
            modal.close();
        }
    }

    async function attemptCatch() {
        if (catchingInProgress) return;
        if (!catchingPokemon) {
            console.error("Wild Pokemon is not available");
            return;
        }

        catchingInProgress = true;
        catchResult = null;
        showResult = false;

        // Simulate catching animation duration
        setTimeout(async () => {
            // 50% catch rate for now - can be made more sophisticated later
            const catchSuccess = Math.random() < 0.5;

            if (catchSuccess) {
                try {
                    // Add to current player's collection
                    const currentPlayer =
                        gameState.players[gameState.currentPlayerIndex];
                    if (currentPlayer) {
                        console.log(
                            `Adding Pokemon #${pokemonDexNumber} to ${currentPlayer.name}'s team`,
                        );
                        console.log(
                            `Team before:`,
                            currentPlayer.pokemons.length,
                        );
                        currentPlayer.pokemons.push(catchingPokemon!);
                        console.log(
                            `Team after:`,
                            currentPlayer.pokemons.length,
                        );
                        // Sync the state to ensure the Pokemon is saved
                        await autoSync(gameState);
                        console.log("Pokemon added and synced to server");
                    } else {
                        console.error(
                            "Current player not found when trying to add Pokemon",
                        );
                    }

                    catchResult = "success";
                } catch (error) {
                    console.error("Error creating Pokemon:", error);
                    catchResult = "failure";
                }
            } else {
                catchResult = "failure";
            }

            catchingInProgress = false;
            showResult = true;

            // Additional sync after a short delay to ensure state persistence
            setTimeout(async () => {
                await autoSync(gameState);
            }, 100);
        }, 2000);
    }

    function continueTurn() {
        closeModal();
        endCatchingPhase();
    }

    // Auto-open modal when catching phase starts
    $effect(() => {
        if (
            gameState.catchingPhase?.active &&
            gameState.catchingPhase.playerName === gameState.localPlayer &&
            modal &&
            !modal.open
        ) {
            openModal(gameState.catchingPhase.wildPokemonDexNumber);
        }
    });
</script>

<dialog bind:this={modal} class="modal">
    <div class="modal-box max-w-md">
        <h2 class="text-2xl font-bold text-center mb-6">
            Wildes Pokemon entdeckt!
        </h2>

        <!-- Pokemon Display -->
        <div class="flex flex-col items-center mb-6">
            {#if catchingPokemon}
                <div class="pokemon-display-container mb-4">
                    <PokemonDisplay pokemon={catchingPokemon} />
                </div>
            {:else}
                <div class="pokemon-container mb-4">
                    <div class="pokemon-sprite">👾</div>
                </div>
            {/if}
            <h3 class="text-xl font-semibold">
                {pokemonGermanName || `Pokemon #${pokemonDexNumber}`}
            </h3>
            <p class="text-sm text-base-content/70">#{pokemonDexNumber}</p>
        </div>

        <!-- Catching Animation -->
        {#if catchingInProgress}
            <div class="text-center mb-6">
                <div class="pokeball-animation mb-4">
                    <div class="pokeball">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            class="w-16 h-16"
                        >
                            <circle
                                cx="12"
                                cy="12"
                                r="10"
                                fill="#fff"
                                stroke="#000"
                                stroke-width="2"
                            />
                            <!-- red upper half -->
                            <path
                                d="M12 2a10 10 0 0 1 10 10H2A10 10 0 0 1 12 2z"
                                fill="#ff0000"
                            />
                            <circle cx="12" cy="12" r="4" fill="#000" />
                            <line
                                x1="2"
                                y1="12"
                                x2="22"
                                y2="12"
                                stroke="#000"
                                stroke-width="2"
                            />
                            <circle cx="12" cy="12" r="2" fill="#fff" />
                        </svg>
                    </div>
                </div>
                <p class="text-lg">Fangversuch läuft...</p>
            </div>
        {/if}

        <!-- Catch Result -->
        {#if showResult && catchResult}
            <div class="text-center mb-6">
                {#if catchResult === "success"}
                    <div class="success-animation mb-4">
                        <div class="text-6xl">✨</div>
                    </div>
                    <div
                        class="alert alert-success flex flex-col items-center gap-2"
                    >
                        <span class="text-lg font-bold">Gefangen!</span>
                        <p>
                            Du hast {pokemonGermanName ||
                                `Pokemon #${pokemonDexNumber}`} erfolgreich gefangen!
                        </p>
                        {#if catchingPokemon?.shiny}
                            <p class="text-yellow-400 font-bold">
                                ✨ Es ist ein Shiny! ✨
                            </p>
                        {/if}
                    </div>
                {:else}
                    <div class="failure-animation mb-4">
                        <div class="text-6xl">💨</div>
                    </div>
                    <div class="alert alert-error">
                        <span class="text-lg font-bold">Entkommen!</span>
                        <p>
                            {pokemonGermanName ||
                                `Pokemon #${pokemonDexNumber}`} ist entkommen!
                        </p>
                    </div>
                {/if}
            </div>
        {/if}

        <!-- Controls -->
        <div class="flex justify-center gap-4">
            {#if !catchingInProgress && !showResult}
                <button class="btn btn-primary" onclick={attemptCatch}>
                    Pokemon fangen
                </button>
            {:else if showResult}
                <button class="btn btn-primary" onclick={continueTurn}>
                    Weiter
                </button>
            {/if}
        </div>
    </div>
</dialog>

<style>
    .pokemon-display-container {
        width: 150px;
        height: 150px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(145deg, #f0f0f0, #e0e0e0);
        border-radius: 12px;
        box-shadow:
            8px 8px 16px #d0d0d0,
            -8px -8px 16px #ffffff;
        padding: 10px;
    }

    .pokemon-container {
        width: 120px;
        height: 120px;
        border-radius: 50%;
        background: linear-gradient(145deg, #f0f0f0, #e0e0e0);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow:
            8px 8px 16px #d0d0d0,
            -8px -8px 16px #ffffff;
    }

    .pokemon-sprite {
        font-size: 4rem;
        filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3));
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .pokeball-animation {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 80px;
    }

    .pokeball {
        font-size: 3rem;
        animation: shake 0.5s infinite;
    }

    .success-animation {
        animation: bounce 0.6s ease-in-out;
    }

    .failure-animation {
        animation: fade-out 0.8s ease-in-out;
    }

    @keyframes shake {
        0%,
        100% {
            transform: translateX(0);
        }
        25% {
            transform: translateX(-5px) rotate(-5deg);
        }
        75% {
            transform: translateX(5px) rotate(5deg);
        }
    }

    @keyframes bounce {
        0%,
        20%,
        53%,
        80%,
        100% {
            transform: translateY(0);
        }
        40%,
        43% {
            transform: translateY(-20px);
        }
        70% {
            transform: translateY(-10px);
        }
        90% {
            transform: translateY(-4px);
        }
    }

    @keyframes fade-out {
        0% {
            opacity: 1;
            transform: scale(1);
        }
        50% {
            opacity: 0.5;
            transform: scale(1.1);
        }
        100% {
            opacity: 1;
            transform: scale(1);
        }
    }
</style>
