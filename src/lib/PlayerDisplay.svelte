<script lang="ts">
    export type PlayerKind = "ash" | "gary" | "giovanni" | "serena";
    type Props = {
        x: number;
        y: number;
        scale: number;
        kind: PlayerKind;
    };
    let { x = 0, y = 0, scale, kind = "ash" }: Props = $props();
</script>

<div
    class="absolute w-max"
    style={`left: ${x}px; top: ${y}px; transform: translate(-50%, -50%);`}
>
    <img src={`/${kind}.png`} alt={kind} style={`height: ${150 * scale}px;`} />
</div>
