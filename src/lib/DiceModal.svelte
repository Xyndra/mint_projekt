<script lang="ts">
    import { onMount } from "svelte";
    import { gameState } from "../logic/game.svelte";
    import { setDiceResults, endDicePhase } from "../logic/phases/dicePhase";

    let modal: HTMLDialogElement;
    let diceCount = $state(1);
    let diceResults: number[] = $state([]);
    let isRolling = $state(false);
    let showResults = $state(false);
    let hasRolledThisTurn = $state(false);

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

    function rollDice() {
        if (isRolling || hasRolledThisTurn) return;

        isRolling = true;
        showResults = false;
        diceResults = [];

        // Simulate rolling animation duration
        setTimeout(() => {
            // Generate random results for each die
            const results = Array.from(
                { length: diceCount },
                () => Math.floor(Math.random() * 6) + 1,
            );
            diceResults = results;
            isRolling = false;
            showResults = true;
            hasRolledThisTurn = true;

            // Set dice results in game state
            try {
                setDiceResults(results);
            } catch (error) {
                console.error("Error setting dice results:", error);
            }
        }, 1200);
    }

    function getDiceEmoji(value: number): string {
        const diceEmojis = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];
        return diceEmojis[value - 1] || "⚀";
    }

    function getTotalSum(): number {
        return diceResults.reduce((sum, value) => sum + value, 0);
    }

    function handleMoveSelection() {
        try {
            endDicePhase();
            closeModal();
        } catch (error) {
            console.error("Error ending dice phase:", error);
        }
    }

    function resetDice() {
        diceResults = [];
        showResults = false;
        isRolling = false;
        hasRolledThisTurn = false;
    }

    onMount(() => {
        resetDice();
    });

    // Auto-open modal when dice phase is active for local player
    $effect(() => {
        if (
            gameState.dicePhase?.active &&
            gameState.dicePhase.playerName === gameState.localPlayer &&
            modal &&
            !modal.open
        ) {
            openModal();
            resetDice();
        } else if (
            (!gameState.dicePhase?.active ||
                gameState.dicePhase.playerName !== gameState.localPlayer) &&
            modal &&
            modal.open
        ) {
            closeModal();
        }
    });

    // Reset dice state when dice phase ends
    $effect(() => {
        if (!gameState.dicePhase?.active) {
            resetDice();
        }
    });
</script>

<dialog bind:this={modal} class="modal">
    <div class="modal-box">
        <!-- Dice Display Area -->
        <div class="mb-8">
            <div
                class="flex flex-wrap justify-center gap-4 min-h-[120px] items-center"
            >
                {#each Array(diceCount) as _, index}
                    <div class="dice-container">
                        {#if isRolling}
                            <div class="dice rolling">
                                <div class="dice-face">🎲</div>
                            </div>
                        {:else if showResults && diceResults[index]}
                            <div class="dice result">
                                <div class="dice-face">
                                    {getDiceEmoji(diceResults[index])}
                                </div>
                                <div class="dice-number">
                                    {diceResults[index]}
                                </div>
                            </div>
                        {:else}
                            <div class="dice idle">
                                <div class="dice-face">🎲</div>
                            </div>
                        {/if}
                    </div>
                {/each}
            </div>
        </div>

        <!-- Results Display -->
        {#if showResults && diceResults.length > 0 && diceCount > 1}
            <div class="mb-6 text-center">
                <div class="stats stats-horizontal bg-base-200 shadow">
                    <div class="stat">
                        <div class="stat-title">Einzelwerte</div>
                        <div class="stat-value text-2xl">
                            {diceResults.join(" + ")}
                        </div>
                    </div>
                    <div class="stat">
                        <div class="stat-title">Summe</div>
                        <div class="stat-value text-primary">
                            {getTotalSum()}
                        </div>
                    </div>
                </div>
            </div>
        {/if}

        <!-- Controls -->
        <div class="flex justify-center items-center gap-4">
            {#if !hasRolledThisTurn}
                <button
                    class="btn btn-primary min-w-32"
                    onclick={rollDice}
                    disabled={isRolling}
                >
                    {#if isRolling}Würfeln...{:else}Würfeln{/if}
                </button>
            {/if}

            {#if showResults && diceResults.length > 0}
                <button
                    class="btn btn-success"
                    onclick={() => handleMoveSelection()}
                >
                    Bewegungsphase starten ({getTotalSum()} Schritte)
                </button>
            {/if}
        </div>
    </div>
</dialog>

<style>
    .dice-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
    }

    .dice {
        width: 80px;
        height: 80px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(145deg, #ffffff, #e6e6e6);
        box-shadow:
            8px 8px 16px #d1d1d1,
            -8px -8px 16px #ffffff;
        border: 2px solid #ddd;
        position: relative;
        transition: all 0.3s ease;
    }

    .dice.idle {
        opacity: 0.7;
        transform: scale(0.95);
    }

    .dice.rolling {
        animation: roll 0.1s infinite linear;
        background: linear-gradient(145deg, #ff6b6b, #ee5a52);
        box-shadow:
            8px 8px 16px #cc4444,
            -8px -8px 16px #ff8888;
        border-color: #ff4444;
    }

    .dice.result {
        animation: bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        background: linear-gradient(145deg, #51cf66, #40c057);
        box-shadow:
            8px 8px 16px #37a348,
            -8px -8px 16px #6dd675;
        border-color: #40c057;
    }

    .dice-face {
        font-size: 2.5rem;
        transition: all 0.2s ease;
    }

    .dice.rolling .dice-face {
        animation: spin 0.1s infinite linear;
    }

    .dice-number {
        position: absolute;
        bottom: -8px;
        right: -8px;
        background: hsl(var(--p));
        color: hsl(var(--pc));
        border-radius: 50%;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.875rem;
        font-weight: bold;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    @keyframes roll {
        0% {
            transform: rotate(0deg) scale(1);
        }
        25% {
            transform: rotate(90deg) scale(1.1);
        }
        50% {
            transform: rotate(180deg) scale(1);
        }
        75% {
            transform: rotate(270deg) scale(1.1);
        }
        100% {
            transform: rotate(360deg) scale(1);
        }
    }

    @keyframes spin {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }

    @keyframes bounce-in {
        0% {
            transform: scale(0) rotate(180deg);
            opacity: 0;
        }
        50% {
            transform: scale(1.3) rotate(90deg);
            opacity: 0.8;
        }
        100% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
        }
    }

    .stats {
        animation: slide-up 0.5s ease-out;
    }

    @keyframes slide-up {
        from {
            transform: translateY(20px);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }
</style>
