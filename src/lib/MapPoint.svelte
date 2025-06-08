<script lang="ts">
    import { gameState } from "../logic/game.svelte";
    import type { MapPoint } from "../logic/mapPoints";
    import PlayerDisplay from "./PlayerDisplay.svelte";

    let { point, id, scale }: { point: MapPoint; id: number; scale: number } =
        $props();

    // Base size for points (in original map pixels)
    const baseSize = 130;

    let players = $derived.by(() => {
        return gameState.players.filter((player) => player.position === id);
    });
</script>

<div
    class="absolute pointer-events-auto"
    style={`left: ${point.x * scale}px; top: ${point.y * scale}px;`}
>
    <div class="absolute z-[2]">
        {#each players as player}
            {#if gameState.players[gameState.currentPlayerIndex].name === player.name}
                <PlayerDisplay x={0} y={0} {scale} kind={player.avatar} />
            {/if}
        {/each}

        <div
            class="absolute flex flex-row gap-1"
            style={`top: ${80 * scale}px; margin-top: ${-10 * scale}px; transform: translateX(-50%);`}
        >
            {#each players as player}
                {#if gameState.players[gameState.currentPlayerIndex].name !== player.name}
                    <div
                        class="rounded-full bg-yellow border-black"
                        class:bg-blue-500={player.avatar === "ash"}
                        class:bg-yellow-500={player.avatar === "gary"}
                        class:bg-green-500={player.avatar === "giovanni"}
                        class:bg-red-500={player.avatar === "serena"}
                        style={`width: ${20 * scale}px; height: ${20 * scale}px;
                                border-width: ${2 * scale}px;`}
                    ></div>
                {/if}
            {/each}
        </div>
    </div>

    {#if point.kind === "city"}
        <div
            class="flex flex-col justify-center items-center border-black bg-[#fffc]"
            style={`
                margin-left: ${-150 * scale}px;
                margin-top: ${-85 * scale}px;
                font-size: ${34 * scale}px;
                border-width: ${2 * scale}px;
                border-radius: 0 0 ${14 * scale}px ${14 * scale}px;
                min-width: ${300 * scale}px;
            `}
        >
            <div
                class="bg-black text-white font-bold text-center w-full"
                style={`padding: ${2 * scale}px ${8 * scale}px;`}
            >
                <p>{point.city_name}</p>
            </div>
            <div
                class="flex items-center justify-center"
                style={`padding: ${4 * scale}px; min-height: ${140 * scale}px;`}
            >
                <p
                    class="text-center w-full"
                    style={`max-width: ${280 * scale}px; font-size: ${(point.text !== undefined && point.text.length < 20 ? 34 : 25) * scale}px;`}
                >
                    {#if point.text}
                        {point.text}
                    {/if}
                </p>
            </div>
        </div>
    {:else}
        <div
            class="aspect-square rounded-full flex justify-center items-center text-center text-white"
            style={`
                background-color: ${point.color};
                width: ${baseSize * scale}px;
                height: ${baseSize * scale}px;
                margin-left: ${-(baseSize * scale) / 2}px;
                margin-top: ${-(baseSize * scale) / 2}px;
            `}
        >
            {#if point.kind === "catch"}
                <p
                    style={`font-size: ${35 * scale}px; margin-top: ${-6 * scale}px;`}
                >
                    Fangen
                </p>
            {:else if point.kind === "event"}
                <p style={`font-size: ${23 * scale}px;`}>
                    Ziehe eine Ereignis- karte
                </p>
            {/if}
        </div>
    {/if}
</div>
