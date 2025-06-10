<script lang="ts">
    import type { PlayerKind } from "./PlayerDisplay.svelte";
    import { addPlayer, startGame, gameState } from "../logic/game.svelte";

    let playerName = $state("");
    let selectedAvatar: PlayerKind = $state("ash");
    let errorMessage = $state("");
    let modal: HTMLDialogElement;

    const avatarOptions: { value: PlayerKind; label: string }[] = [
        { value: "ash", label: "Ash" },
        { value: "gary", label: "Gary" },
        { value: "giovanni", label: "Giovanni" },
        { value: "serena", label: "Serena" },
    ];

    function handleAddPlayer() {
        try {
            if (!playerName.trim()) {
                errorMessage = "Bitte geben Sie einen Spielernamen ein";
                return;
            }
            addPlayer(playerName.trim(), selectedAvatar);
            playerName = "";
            errorMessage = "";
        } catch (error) {
            errorMessage =
                error instanceof Error ? error.message : "An error occurred";
        }
    }

    function handleStartGame() {
        try {
            startGame();
        } catch (error) {
            errorMessage =
                error instanceof Error ? error.message : "An error occurred";
        }
    }

    // Show modal when game hasn't started
    $effect(() => {
        if (!gameState.hasStarted && modal) {
            modal.showModal();
        } else if (gameState.hasStarted && modal) {
            modal.close();
        }
    });
</script>

<dialog bind:this={modal} class="modal">
    <div class="modal-box">
        <div class="flex justify-between items-center mb-6">
            <h2 class="text-3xl font-bold">🎮 Spiel einrichten</h2>
            <div class="badge badge-primary badge-lg">
                {gameState.players.length}/4 Spieler
            </div>
        </div>

        <!-- Players List -->
        <div class="mb-6">
            <h3 class="text-xl font-semibold mb-4 flex items-center gap-2">
                <span>👥</span>
                Aktuelle Spieler
            </h3>

            {#if gameState.players.length > 0}
                <div class="grid gap-3">
                    {#each gameState.players as player, index}
                        <div
                            class="flex items-center gap-4 p-4 bg-base-200 rounded-xl border-2 border-base-300"
                        >
                            <div class="badge badge-neutral badge-lg">
                                {index + 1}
                            </div>
                            <div>
                                <div class="w-12 h-12 rounded-xl">
                                    <img
                                        src={`/${player.avatar}.png`}
                                        alt={player.avatar}
                                        class="h-20 -translate-y-4"
                                    />
                                </div>
                            </div>
                            <span class="font-semibold text-lg"
                                >{player.name}</span
                            >
                            {#if player.name === gameState.localPlayer}
                                <div class="badge badge-success">Du</div>
                            {/if}
                        </div>
                    {/each}
                </div>
            {:else}
                <div class="text-center py-12 text-base-content/60">
                    <div class="text-6xl mb-4">🎯</div>
                    <p class="text-lg">Noch keine Spieler hinzugefügt</p>
                    <p class="text-sm opacity-75">
                        Fügen Sie Ihren ersten Spieler hinzu, um zu beginnen!
                    </p>
                </div>
            {/if}
        </div>

        <!-- Add Player Section -->
        {#if gameState.players.length < 4 && !gameState.localPlayer}
            <div class="divider text-lg font-semibold">
                <span>Neuen Spieler hinzufügen</span>
            </div>

            <div class="space-y-6">
                <!-- Player Name Input -->
                <div class="form-control">
                    <label class="label" for="playerName">
                        <span class="label-text text-base font-semibold">
                            Spielername
                        </span>
                    </label>
                    <input
                        id="playerName"
                        type="text"
                        bind:value={playerName}
                        oninput={() => (errorMessage = "")}
                        placeholder="Spielername eingeben"
                        maxlength="20"
                        class="input input-bordered input-lg w-full"
                    />
                </div>

                <!-- Avatar Selection -->
                <div class="form-control">
                    <fieldset>
                        <legend class="label">
                            <span class="label-text text-base font-semibold">
                                Avatar wählen
                            </span>
                        </legend>
                        <div class="grid grid-cols-2 gap-4">
                            {#each avatarOptions as option}
                                <label class="cursor-pointer">
                                    <input
                                        type="radio"
                                        bind:group={selectedAvatar}
                                        value={option.value}
                                        class="sr-only"
                                    />
                                    <div
                                        class="p-4 border-3 rounded-xl transition-all duration-300 hover:scale-105 {selectedAvatar ===
                                        option.value
                                            ? 'border-primary bg-primary/20 shadow-lg'
                                            : 'border-base-300 hover:border-primary/50 hover:bg-base-200'}"
                                    >
                                        <div
                                            class="flex flex-col items-center gap-3"
                                        >
                                            <img
                                                src={`/${option.value}.png`}
                                                alt={option.label}
                                                class="h-28"
                                            />
                                            <span class="font-semibold text-lg">
                                                {option.label}
                                            </span>
                                        </div>
                                    </div>
                                </label>
                            {/each}
                        </div>
                    </fieldset>
                </div>

                <!-- Add Player Button -->
                <button
                    onclick={handleAddPlayer}
                    class="btn btn-primary btn-lg w-full"
                >
                    ➕ Spieler hinzufügen
                </button>
            </div>
        {:else if gameState.players.length >= 4}
            <div class="alert alert-info">
                ℹ️
                <span class="font-semibold"
                    >Maximale Spieleranzahl erreicht (4/4)</span
                >
            </div>
        {:else if gameState.localPlayer}
            <div class="alert alert-info">
                ℹ️
                <span class="font-semibold"
                    >Sie haben bereits ihren Spieler hinzugefügt</span
                >
            </div>
        {/if}

        <!-- Error Message -->
        {#if errorMessage}
            <div class="alert alert-error mt-6">
                ⚠️
                <span class="font-semibold">{errorMessage}</span>
            </div>
        {/if}

        <!-- Start Game Section -->
        <div class="divider text-lg font-semibold mt-8">
            <span>🚀 Bereit zum Spielen?</span>
        </div>

        <div class="space-y-4">
            {#if gameState.players.length < 2}
                <div class="alert alert-warning">
                    ⚠️
                    <span class="font-semibold">
                        Fügen Sie mindestens 2 Spieler hinzu, um das Spiel zu
                        starten
                    </span>
                </div>
            {:else}
                <div class="alert alert-success">
                    ✔️
                    <span class="font-semibold">
                        Bereit zu starten mit {gameState.players.length} Spielern!
                    </span>
                </div>
            {/if}

            <button
                onclick={handleStartGame}
                disabled={gameState.players.length < 2}
                class="btn btn-success btn-lg w-full text-xl"
            >
                🚀 Spiel starten!
            </button>
        </div>
    </div>
</dialog>

<style>
    dialog.modal::backdrop {
        background-color: rgba(0, 0, 0, 0.5);
    }

    dialog.modal[open] {
        display: flex;
        align-items: center;
        justify-content: center;
    }
</style>
