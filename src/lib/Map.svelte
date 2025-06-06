<script lang="ts">
    import { onMount } from "svelte";
    import kanto from "../assets/kanto.png";
    import MapPoint from "./MapPoint.svelte";
    import { mapPoints } from "../logic/mapPoints";

    // Helper to create a smooth SVG path through points (Catmull-Rom to Bezier)
    function catmullRom2bezier(points: { x: number; y: number }[]) {
        if (points.length < 2) return "";
        let d = `M ${points[0].x} ${points[0].y}`;
        for (let i = 0; i < points.length - 1; i++) {
            const p0 = points[i - 1] || points[i];
            const p1 = points[i];
            const p2 = points[i + 1];
            const p3 = points[i + 2] || p2;
            const cp1x = p1.x + (p2.x - p0.x) / 6;
            const cp1y = p1.y + (p2.y - p0.y) / 6;
            const cp2x = p2.x - (p3.x - p1.x) / 6;
            const cp2y = p2.y - (p3.y - p1.y) / 6;
            d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
        }
        return d;
    }

    // Generate paths for each path group
    function generatePathsByGroup() {
        const pathGroups = new Map<string, number[]>();

        // Group point indices by path (matching PathMapGenerator logic)
        mapPoints.forEach((point, index) => {
            if (!pathGroups.has(point.path)) {
                pathGroups.set(point.path, []);
            }
            pathGroups.get(point.path)!.push(index);
        });

        // Generate spline for each path group
        const pathSvgs: { path: string; pathId: string }[] = [];
        pathGroups.forEach((pointIndices, pathId) => {
            // Sort by original array order to maintain sequence (same as PathMapGenerator)
            pointIndices.sort((a, b) => a - b);

            // Convert indices back to points
            const sortedPoints = pointIndices.map((index) => mapPoints[index]);

            const pathData = catmullRom2bezier(sortedPoints);
            if (pathData) {
                pathSvgs.push({ path: pathData, pathId });
            }
        });

        return pathSvgs;
    }

    // Generate connection lines between different paths
    function generatePathConnections() {
        const connections: {
            from: { x: number; y: number };
            to: { x: number; y: number };
            fromIndex: number;
            toIndex: number;
            fromPath: string;
            toPath: string;
        }[] = [];

        mapPoints.forEach((point, index) => {
            point.connectedPoints.forEach((connectedIndex) => {
                const connectedPoint = mapPoints[connectedIndex];
                // Only draw connections between different paths to avoid duplicating the main path lines
                if (
                    point.path !== connectedPoint.path &&
                    index < connectedIndex
                ) {
                    connections.push({
                        from: { x: point.x, y: point.y },
                        to: { x: connectedPoint.x, y: connectedPoint.y },
                        fromIndex: index,
                        toIndex: connectedIndex,
                        fromPath: point.path,
                        toPath: connectedPoint.path,
                    });
                }
            });
        });

        return connections;
    }

    // Get start and end points for each path for debugging
    function getPathEndpoints() {
        const pathGroups = new Map<string, number[]>();

        // Group point indices by path
        mapPoints.forEach((point, index) => {
            if (!pathGroups.has(point.path)) {
                pathGroups.set(point.path, []);
            }
            pathGroups.get(point.path)!.push(index);
        });

        const endpoints: {
            pathId: string;
            start: { x: number; y: number; index: number };
            end: { x: number; y: number; index: number };
        }[] = [];

        pathGroups.forEach((pointIndices, pathId) => {
            pointIndices.sort((a, b) => a - b);
            const startIndex = pointIndices[0];
            const endIndex = pointIndices[pointIndices.length - 1];

            endpoints.push({
                pathId,
                start: {
                    x: mapPoints[startIndex].x,
                    y: mapPoints[startIndex].y,
                    index: startIndex,
                },
                end: {
                    x: mapPoints[endIndex].x,
                    y: mapPoints[endIndex].y,
                    index: endIndex,
                },
            });
        });

        return endpoints;
    }

    let pathSvgs = generatePathsByGroup();
    let pathConnections = generatePathConnections();
    let pathEndpoints = getPathEndpoints();

    let mapWidth = $state(1);
    let mapHeight = $state(1);
    let scaleFactor = $derived(mapWidth / 3200);

    // Development grid settings
    let showGrid = $state(false); // Set to false for production
    let gridSpacing = $state(50); // Grid cell size in pixels (before scaling)
    let mousePosition = $state({ x: 0, y: 0 });
    let currentKind = $state<"catch" | "event">("event"); // Current point type
    let showPathDebug = $state(false); // Show path start/end indicators

    let copiedCoordinates = $state<string | null>(null);
    let copyFadeTimeout: ReturnType<typeof setTimeout> | null = null;

    function updateSize() {
        // Get size of outer div
        const outer = document.getElementById("outer");
        if (!outer) return;
        const width = outer.clientWidth;
        const height = outer.clientHeight;
        if (width / 3200 > height / 2212) {
            mapWidth = width;
            mapHeight = 2212 * (width / 3200);
        } else {
            mapHeight = height;
            mapWidth = 3200 * (height / 2212);
        }
    }

    function handleMouseMove(event: MouseEvent) {
        // Get mouse position relative to the map container
        const mapContainer = document.querySelector(".map-container");
        if (!mapContainer) return;

        const rect = mapContainer.getBoundingClientRect();
        const x = Math.floor((event.clientX - rect.left) / scaleFactor);
        const y = Math.floor((event.clientY - rect.top) / scaleFactor);

        mousePosition = { x, y };
    }

    // Handle map click to copy coordinates
    function handleMapClick(event: MouseEvent) {
        if (!showGrid) return;

        const mapContainer = document.querySelector(".map-container");
        if (!mapContainer) return;

        const rect = mapContainer.getBoundingClientRect();
        let x = Math.floor((event.clientX - rect.left) / scaleFactor);
        let y = Math.floor((event.clientY - rect.top) / scaleFactor);

        // Create coordinate JSON string and copy to clipboard
        const pointData = {
            x,
            y,
            kind: currentKind,
            color: "#087c31",
            path: "a",
        };
        const coordText = JSON.stringify(pointData, null, 2) + ",\n";
        navigator.clipboard
            .writeText(coordText)
            .then(() => {
                copiedCoordinates = `Copied point data!`;

                // Clear previous timeout if it exists
                if (copyFadeTimeout) {
                    clearTimeout(copyFadeTimeout);
                }

                // Hide the "Copied!" message after 2 seconds
                copyFadeTimeout = setTimeout(() => {
                    copiedCoordinates = null;
                }, 2000);
            })
            .catch((err) => {
                console.error("Could not copy coordinates: ", err);
            });
    }

    // Generate grid lines
    function generateGridLines() {
        const horizontalLines = [];
        const verticalLines = [];

        // Create horizontal lines
        for (let y = 0; y <= mapHeight / scaleFactor; y += gridSpacing) {
            horizontalLines.push(y);
        }

        // Create vertical lines
        for (let x = 0; x <= mapWidth / scaleFactor; x += gridSpacing) {
            verticalLines.push(x);
        }

        return { horizontalLines, verticalLines };
    }

    // Toggle grid with keyboard shortcut (G key)
    function handleKeyDown(event: KeyboardEvent) {
        if (event.key === "g" || event.key === "G") {
            showGrid = !showGrid;
        } else if ((event.key === "t" || event.key === "T") && showGrid) {
            currentKind = currentKind === "catch" ? "event" : "catch";
        }
    }

    onMount(() => {
        updateSize();
        window.addEventListener("resize", updateSize);
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("resize", updateSize);
            window.removeEventListener("keydown", handleKeyDown);
            if (copyFadeTimeout) {
                clearTimeout(copyFadeTimeout);
            }
        };
    });
</script>

<svelte:head>
    <link
        rel="preload"
        as="image"
        href="/src/assets/kanto.png"
        fetchpriority="high"
    />
</svelte:head>

{#if showGrid}
    <div class="flex flex-col gap-2 mb-2">
        <label class="flex items-center gap-2">
            <input type="checkbox" bind:checked={showGrid} />
            Show Development Grid
            <span class="text-sm text-gray-500 ml-2">(Press G to toggle)</span>
        </label>
        <label class="flex items-center gap-2">
            <input type="checkbox" bind:checked={showPathDebug} />
            Show Path Debug (Start/End points and connection labels)
        </label>
        <div class="flex items-center gap-2">
            <span>Grid Spacing:</span>
            <input
                type="range"
                min="10"
                max="100"
                step="10"
                bind:value={gridSpacing}
            />
            <span>{gridSpacing}px</span>
        </div>

        <div class="flex items-center gap-2">
            <span>Current Mode: </span>
            <span
                class={`font-bold ${
                    currentKind === "catch" ? "text-red-600" : "text-pink-500"
                }`}>{currentKind}</span
            >
            <span class="text-sm text-gray-500 ml-2">(Press T to toggle)</span>
        </div>

        <div class="flex items-center gap-2 text-sm">
            <span
                >Mouse Position: X: {mousePosition.x}, Y: {mousePosition.y}</span
            >
            {#if copiedCoordinates}
                <span
                    class="ml-4 bg-green-100 text-green-800 px-2 py-1 rounded animate-pulse"
                >
                    {copiedCoordinates}
                </span>
            {:else}
                <span class="ml-4 text-gray-500"
                    >(Click on map to copy point data in JSON format)</span
                >
            {/if}
        </div>
    </div>
{/if}

<div id="outer" class="overflow-auto w-full h-full">
    <div
        aria-hidden="true"
        class="relative map-container block w-full text-left"
        onmousemove={handleMouseMove}
        onclick={handleMapClick}
        onkeydown={handleKeyDown}
    >
        <div style={`width: ${mapWidth}px; height: ${mapHeight}px;`}>
            <div class="relative inline-block">
                <img src={kanto} alt="Kanto Map" class="inline" />
                <div
                    class="absolute inset-0 bg-white opacity-10 pointer-events-none"
                ></div>
            </div>
            <svg
                width={mapWidth}
                height={mapHeight}
                viewBox={`0 0 3200 2212`}
                style="position:absolute;top:0;left:0;pointer-events:none;"
            >
                {#each pathSvgs as { path, pathId }}
                    <path
                        d={path}
                        fill="none"
                        stroke="black"
                        stroke-width="15"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        data-path={pathId}
                    />
                {/each}

                <!-- Draw connections between different paths -->
                {#each pathConnections as connection}
                    <line
                        x1={connection.from.x}
                        y1={connection.from.y}
                        x2={connection.to.x}
                        y2={connection.to.y}
                        stroke={showPathDebug ? "red" : "black"}
                        stroke-width="15"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-dasharray={showPathDebug ? "15,5" : "none"}
                    />
                    {#if showPathDebug}
                        <!-- Label connection -->
                        <text
                            x={(connection.from.x + connection.to.x) / 2}
                            y={(connection.from.y + connection.to.y) / 2}
                            fill="red"
                            font-size="24"
                            text-anchor="middle"
                            font-weight="bold"
                        >
                            {connection.fromIndex}→{connection.toIndex}
                        </text>
                    {/if}
                {/each}

                {#if showPathDebug}
                    <!-- Draw path start/end indicators -->
                    {#each pathEndpoints as endpoint}
                        <!-- Start point (green circle) -->
                        <circle
                            cx={endpoint.start.x}
                            cy={endpoint.start.y}
                            r="25"
                            fill="green"
                            stroke="white"
                            stroke-width="3"
                        />
                        <text
                            x={endpoint.start.x}
                            y={endpoint.start.y + 8}
                            fill="white"
                            font-size="20"
                            text-anchor="middle"
                            font-weight="bold"
                        >
                            S{endpoint.pathId}
                        </text>

                        <!-- End point (blue circle) -->
                        <circle
                            cx={endpoint.end.x}
                            cy={endpoint.end.y}
                            r="25"
                            fill="blue"
                            stroke="white"
                            stroke-width="3"
                        />
                        <text
                            x={endpoint.end.x}
                            y={endpoint.end.y + 8}
                            fill="white"
                            font-size="20"
                            text-anchor="middle"
                            font-weight="bold"
                        >
                            E{endpoint.pathId}
                        </text>
                    {/each}
                {/if}
            </svg>
        </div>

        {#if showGrid}
            {#each generateGridLines().horizontalLines as y}
                <div
                    class="absolute border-t border-blue-500 opacity-30"
                    style={`top: ${y * scaleFactor}px; left: 0; width: ${mapWidth}px; height: ${Math.max(1, scaleFactor)}px;`}
                >
                    <span
                        class="absolute left-0 -mt-3 bg-white bg-opacity-70 px-1 text-xs"
                        style={`font-size: ${12 * scaleFactor}px;`}>{y}</span
                    >
                </div>
            {/each}

            {#each generateGridLines().verticalLines as x}
                <div
                    class="absolute border-l border-blue-500 opacity-30"
                    style={`left: ${x * scaleFactor}px; top: 0; height: ${mapHeight}px; width: ${Math.max(1, scaleFactor)}px;`}
                >
                    <span
                        class="absolute top-0 -ml-3 bg-white bg-opacity-70 px-1 text-xs"
                        style={`font-size: ${12 * scaleFactor}px;`}>{x}</span
                    >
                </div>
            {/each}
        {/if}

        <div
            class="absolute top-0 left-0 pointer-events-none"
            style={`width: ${mapWidth}px; height: ${mapHeight}px;`}
        >
            {#each mapPoints as point}
                <MapPoint
                    x={point.x}
                    y={point.y}
                    kind={point.kind}
                    city_name={point.city_name}
                    text={point.text}
                    color={point.color}
                    {mapWidth}
                />
            {/each}
        </div>
    </div>
</div>
