import type { Player } from "./game";
import {
    drawTwoItemCards,
    healOrChange,
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
        oneTimeModifier: healOrChange,
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
        oneTimeModifier: drawTwoItemCards,
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
        oneTimeModifier: drawTwoItemCards,
        path: "c",
    },
    {
        x: 1556,
        y: 879,
        kind: "catch",
        color: "#087c31",
        path: "d",
    },
    {
        x: 1472,
        y: 698,
        kind: "event",
        color: "#087c31",
        path: "d",
    },
    {
        x: 1232,
        y: 730,
        kind: "city",
        city_name: "Prismania City",
        text: "Ziehe 2 Item Karten",
        oneTimeModifier: drawTwoItemCards,
        path: "d",
    },
    {
        x: 930,
        y: 830,
        kind: "catch",
        color: "#d7322c",
        path: "d",
    },
    {
        x: 910,
        y: 980,
        kind: "catch",
        color: "#d7322c",
        path: "d",
    },
    {
        x: 910,
        y: 1130,
        kind: "catch",
        color: "#d7322c",
        path: "d",
    },
    {
        x: 910,
        y: 1280,
        kind: "event",
        color: "#d7322c",
        path: "d",
    },
    {
        x: 910,
        y: 1430,
        kind: "catch",
        color: "#d7322c",
        path: "d",
    },
    {
        x: 910,
        y: 1580,
        kind: "event",
        color: "#d7322c",
        path: "d",
    },
    {
        x: 1178,
        y: 1698,
        kind: "catch",
        color: "#d7322c",
        path: "d",
    },
    {
        x: 1316,
        y: 1803,
        kind: "event",
        color: "#d7322c",
        path: "d",
    },
    {
        x: 1627,
        y: 1755,
        kind: "city",
        city_name: "Fuchsania City",
        text: "Ziehe 2 Item Karten",
        oneTimeModifier: drawTwoItemCards,
        path: "f",
    },
    {
        x: 1643,
        y: 2000,
        kind: "catch",
        color: "#d7322c",
        path: "f",
    },
    {
        x: 1474,
        y: 2100,
        kind: "catch",
        color: "#d7322c",
        path: "f",
    },
    {
        x: 1209,
        y: 2106,
        kind: "event",
        color: "#d7322c",
        path: "f",
    },
    {
        x: 942,
        y: 2129,
        kind: "event",
        color: "#d7322c",
        path: "f",
    },
    {
        x: 644,
        y: 2108,
        kind: "event",
        color: "#d7322c",
        path: "f",
    },
    {
        x: 846,
        y: 1904,
        kind: "city",
        city_name: "Zinnoberinsel",
        text: "Ziehe 2 Item Karten",
        oneTimeModifier: drawTwoItemCards,
        path: "f",
    },
    {
        x: 1689,
        y: 1011,
        kind: "event",
        color: "#2C4AA0",
        path: "g",
    },

    {
        x: 1886,
        y: 996,
        kind: "catch",
        color: "#2C4AA0",
        path: "g",
    },
    {
        x: 1886,
        y: 1213,
        kind: "city",
        city_name: "Orania City",
        text: "Heile ein Pokemon oder Würfel eine 1 oder 6, um alle Pokemon zu heilen",
        oneTimeModifier: healOrChange,
        path: "g",
    },
    {
        x: 2115,
        y: 1187,
        kind: "event",
        color: "#2C4AA0",
        path: "g",
    },
    {
        x: 2209,
        y: 1037,
        kind: "event",
        color: "#2C4AA0",
        path: "h",
    },
    {
        x: 2394,
        y: 1036,
        kind: "catch",
        color: "#2C4AA0",
        path: "h",
    },
    {
        x: 2249,
        y: 1270,
        kind: "catch",
        color: "#2C4AA0",
        path: "i",
    },
    {
        x: 2410,
        y: 1259,
        kind: "event",
        color: "#2C4AA0",
        path: "i",
    },
    {
        x: 2534,
        y: 1151,
        kind: "event",
        color: "#2C4AA0",
        path: "i",
    },
    {
        x: 2650,
        y: 960,
        kind: "catch",
        color: "#2C4AA0",
        path: "j",
    },
    {
        x: 2727,
        y: 1085,
        kind: "event",
        color: "#2C4AA0",
        path: "j",
    },
    {
        x: 2737,
        y: 1236,
        kind: "catch",
        color: "#2C4AA0",
        path: "j",
    },
    {
        x: 2686,
        y: 1404,
        kind: "catch",
        color: "#2C4AA0",
        path: "k",
    },
    {
        x: 2534,
        y: 1393,
        kind: "event",
        color: "#2C4AA0",
        path: "k",
    },
    {
        x: 2372,
        y: 1500,
        kind: "catch",
        color: "#2C4AA0",
        path: "k",
    },
    {
        x: 2368,
        y: 1656,
        kind: "catch",
        color: "#2C4AA0",
        path: "k",
    },
    {
        x: 2207,
        y: 1762,
        kind: "event",
        color: "#2C4AA0",
        path: "k",
    },
    {
        x: 2052,
        y: 1676,
        kind: "catch",
        color: "#2C4AA0",
        path: "k",
    },
    {
        x: 1981,
        y: 1852,
        kind: "catch",
        color: "#2C4AA0",
        path: "k",
    },
    {
        x: 1852,
        y: 1762,
        kind: "event",
        color: "#2C4AA0",
        path: "k",
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
    generator.connectPaths("d", "end", "f", "start");
    generator.connectPaths("c", "end", "g", "start");
    generator.connectPaths("g", "end", "h", "start");
    generator.connectPaths("g", "end", "i", "start");
    generator.connectPaths("h", "end", "i", "end");
    generator.connectPaths("b", "end", "j", "start");
    generator.connectPaths("i", "end", "j", "end");
    generator.connectPaths("j", "end", "k", "start");
    generator.connectPaths("k", "end", "f", "start");

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
