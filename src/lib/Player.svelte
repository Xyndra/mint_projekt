<script lang="ts">
    type Kind = "ash" | "gary" | "giovanni" | "serena";
    type Props = {
        x: number;
        y: number;
        kind: Kind;
    };
    let { x=0, y=0, kind="ash"}: Props = $props();
</script>

<div
    class="absolute"
    style={`left: ${x}px; top: ${y}px;`}
    >
    <img
        src={`/${kind}.png`}
        alt={kind}
        class="h-28"/>
</div>