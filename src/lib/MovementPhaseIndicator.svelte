<script lang="ts">
    import { gameState } from "../logic/game.svelte";
    import { endMovementPhase } from "../logic/phases/movementPhase";

    let isVisible = $derived.by(() => {
        return (
            gameState.movementPhase?.active &&
            gameState.movementPhase.playerName === gameState.localPlayer
        );
    });

    let remainingMoves = $derived.by(() => {
        return gameState.movementPhase?.remainingMoves || 0;
    });
</script>

{#if isVisible}
    <div class="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
        <div class="alert alert-info shadow-lg max-w-md">
            <div class="flex-1">
                <h3 class="font-bold">Bewegungsphase</h3>
                <div class="text-sm">
                    Verbleibende Schritte:
                    <span class="badge badge-primary font-bold text-lg"
                        >{remainingMoves}</span
                    >
                </div>
                <div class="text-xs mt-1 opacity-75">
                    Klicke auf benachbarte Punkte zum Bewegen
                </div>
            </div>
        </div>
    </div>
{/if}

<style>
    .alert {
        animation: slide-down 0.3s ease-out;
    }

    @keyframes slide-down {
        from {
            transform: translate(-50%, -100%);
            opacity: 0;
        }
        to {
            transform: translate(-50%, 0);
            opacity: 1;
        }
    }
</style>
