import type { Player } from "./game";
import {
    drawTwoItemCards,
    encounterWildPokemon,
    randomEvent,
} from "./mapEvents";
import { PathMapGenerator } from "./pathMapGenerator";

export interface RawMapPoint {
    // Visual properties
    x: number;
    y: number;
    kind: "city" | "catch" | "event";
    city_name?: string;
    color?: string;
    text?: string;

    // Game logic properties
    path: string;
    oneTimeModifier?: (player: Player) => void;
    multipleTimeModifier?: (player: Player) => void;
}

const rawMapPoints: RawMapPoint[] = [
    {
        x: 662,
        y: 1630,
        kind: "city",
        city_name: "Alabastia",
        text: "Start",
        path: "a",
    },
    {
        x: 441,
        y: 1464,
        kind: "catch",
        color: "#f86cc4",
        path: "a",
    },
    {
        x: 448,
        y: 1303,
        kind: "event",
        color: "#f86cc4",
        path: "a",
    },
    {
        x: 304,
        y: 1211,
        kind: "catch",
        color: "#f86cc4",
        path: "a",
    },
    {
        x: 600,
        y: 1120,
        kind: "city",
        city_name: "Vertania City",
        text: "Ziehe 2 Item Karten",
        path: "a",
        oneTimeModifier: drawTwoItemCards,
    },
    {
        x: 520,
        y: 940,
        kind: "event",
        color: "#f86cc4",
        path: "a",
    },
    {
        x: 369,
        y: 886,
        kind: "catch",
        color: "#f86cc4",
        path: "a",
    },
    {
        x: 407,
        y: 738,
        kind: "event",
        color: "#f86cc4",
        path: "a",
    },
    {
        x: 270,
        y: 648,
        kind: "catch",
        color: "#f86cc4",
        path: "a",
    },
    {
        x: 255,
        y: 490,
        kind: "catch",
        color: "#f86cc4",
        path: "a",
    },
    {
        x: 400,
        y: 400,
        kind: "catch",
        color: "#f86cc4",
        path: "a",
    },
    {
        x: 680,
        y: 464,
        kind: "city",
        city_name: "Marmoria City",
        text: "Ziehe 2 Item Karten",
        path: "a",
        oneTimeModifier: drawTwoItemCards,
    },
    {
        x: 589,
        y: 287,
        kind: "event",
        color: "#f86cc4",
        path: "a",
    },
    {
        x: 607,
        y: 127,
        kind: "catch",
        color: "#f86cc4",
        path: "a",
    },
    {
        x: 764,
        y: 237,
        kind: "event",
        color: "#f86cc4",
        path: "a",
    },
    {
        x: 912,
        y: 224,
        kind: "catch",
        color: "#f86cc4",
        path: "a",
    },
    {
        x: 914,
        y: 385,
        kind: "catch",
        color: "#f86cc4",
        path: "a",
    },
    {
        x: 1114,
        y: 332,
        kind: "catch",
        color: "#087c31",
        path: "a",
    },
    {
        x: 1183,
        y: 197,
        kind: "event",
        color: "#087c31",
        path: "a",
    },
    {
        x: 1370,
        y: 213,
        kind: "catch",
        color: "#087c31",
        path: "a",
    },
    {
        x: 1558,
        y: 241,
        kind: "catch",
        color: "#087c31",
        path: "a",
    },
    {
        x: 1494,
        y: 479,
        kind: "event",
        color: "#087c31",
        path: "a",
    },
    {
        x: 1764,
        y: 368,
        kind: "city",
        city_name: "Azuria City",
        text: "Heile ein Pokemon oder Würfel eine 1 oder 6, um alle Pokemon zu heilen",
        path: "a",
    },
    {
        x: 2042,
        y: 261,
        kind: "catch",
        color: "#087c31",
        path: "b",
    },
    {
        x: 2242,
        y: 297,
        kind: "event",
        color: "#087c31",
        path: "b",
    },
    {
        x: 2411,
        y: 293,
        kind: "catch",
        color: "#087c31",
        path: "b",
    },
    {
        x: 2557,
        y: 347,
        kind: "catch",
        color: "#087c31",
        path: "b",
    },
    {
        x: 2704,
        y: 445,
        kind: "event",
        color: "#087c31",
        path: "b",
    },
    {
        x: 2845,
        y: 485,
        kind: "catch",
        color: "#087c31",
        path: "b",
    },
    {
        x: 2806,
        y: 649,
        kind: "event",
        color: "#087c31",
        path: "b",
    },
    {
        x: 2299,
        y: 793,
        kind: "catch",
        color: "#087c31",
        path: "e",
    },
    {
        x: 2094,
        y: 758,
        kind: "event",
        color: "#087c31",
        path: "e",
    },
    {
        x: 2566,
        y: 764,
        kind: "city",
        city_name: "Lavandia",
        text: "Ziehe 2 Item Karten",
        path: "b",
    },
    {
        x: 1850,
        y: 558,
        kind: "event",
        color: "#087c31",
        path: "c",
    },
    {
        x: 1666,
        y: 564,
        kind: "catch",
        color: "#087c31",
        path: "c",
    },
    {
        x: 1800,
        y: 785,
        kind: "city",
        city_name: "Saffronia City",
        text: "Ziehe 2 Item Karten",
        path: "c",
    },
    {
        x: 1232,
        y: 764,
        kind: "city",
        city_name: "Prismania City",
        text: "Ziehe 2 Item Karten",
        path: "d",
    },
];

export interface MapPoint extends RawMapPoint {
    alreadyVisited: string[]; // Player names - required in final MapPoint
    connectedPoints: number[]; // Generated from path connections
}

// Automatically assign default modifiers based on kind and initialize alreadyVisited
// Generate connected points using path system
function generateConnectedMapPoints(): MapPoint[] {
    const generator = new PathMapGenerator(rawMapPoints);

    // Define how paths connect (a connects to b at the end)
    generator.connectPaths("a", "end", "b", "start");
    generator.connectPaths("a", "end", "c", "start");
    generator.connectPaths("c", "end", "d", "start");
    generator.connectPaths("b", "end", "e", "start");
    generator.connectPaths("e", "end", "c", "end");

    const pointsWithConnections = generator.generateMapPoints();

    return pointsWithConnections.map((point) => {
        const newPoint: MapPoint = {
            ...point,
            alreadyVisited: [],
        };

        // Assign default modifiers based on point kind
        if (point.kind === "catch") {
            newPoint.multipleTimeModifier = encounterWildPokemon;
        } else if (point.kind === "event") {
            newPoint.multipleTimeModifier = randomEvent;
        }

        return newPoint;
    });
}

export const mapPoints: MapPoint[] = generateConnectedMapPoints();
