import type { RawMapPoint } from "./mapPoints";

export interface PathConnection {
    fromPath: string;
    fromEnd: "start" | "end";
    toPath: string;
    toEnd: "start" | "end";
}

export class PathMapGenerator {
    private mapPoints: RawMapPoint[] = [];
    private pathConnections: PathConnection[] = [];

    constructor(mapPoints: RawMapPoint[]) {
        this.mapPoints = [...mapPoints];
    }

    // Define how two paths connect to each other
    connectPaths(
        fromPath: string,
        fromEnd: "start" | "end",
        toPath: string,
        toEnd: "start" | "end",
    ): this {
        this.pathConnections.push({
            fromPath,
            fromEnd,
            toPath,
            toEnd,
        });
        return this;
    }

    // Generate the final map points with connectedPoints
    generateMapPoints(): (RawMapPoint & { connectedPoints: number[] })[] {
        const finalMapPoints: (RawMapPoint & { connectedPoints: number[] })[] =
            this.mapPoints.map((point) => ({
                ...point,
                connectedPoints: [],
            }));

        // Group points by path
        const pathGroups = new Map<string, number[]>();
        this.mapPoints.forEach((point, index) => {
            if (point.path) {
                if (!pathGroups.has(point.path)) {
                    pathGroups.set(point.path, []);
                }
                pathGroups.get(point.path)!.push(index);
            }
        });

        // Connect points within each path (sequential order)
        pathGroups.forEach((pointIndices, pathId) => {
            // Sort by original array order to maintain sequence
            pointIndices.sort((a, b) => a - b);

            for (let i = 0; i < pointIndices.length; i++) {
                const currentIndex = pointIndices[i];

                // Connect to previous point in path
                if (i > 0) {
                    finalMapPoints[currentIndex].connectedPoints.push(
                        pointIndices[i - 1],
                    );
                }

                // Connect to next point in path
                if (i < pointIndices.length - 1) {
                    finalMapPoints[currentIndex].connectedPoints.push(
                        pointIndices[i + 1],
                    );
                }
            }
        });

        // Handle path connections
        this.pathConnections.forEach((connection) => {
            const fromPathPoints = pathGroups.get(connection.fromPath);
            const toPathPoints = pathGroups.get(connection.toPath);

            if (!fromPathPoints || !toPathPoints) return;

            // Sort to ensure correct start/end identification
            fromPathPoints.sort((a, b) => a - b);
            toPathPoints.sort((a, b) => a - b);

            const fromPointIndex =
                connection.fromEnd === "start"
                    ? fromPathPoints[0]
                    : fromPathPoints[fromPathPoints.length - 1];

            const toPointIndex =
                connection.toEnd === "start"
                    ? toPathPoints[0]
                    : toPathPoints[toPathPoints.length - 1];

            // Add bidirectional connection
            if (
                !finalMapPoints[fromPointIndex].connectedPoints.includes(
                    toPointIndex,
                )
            ) {
                finalMapPoints[fromPointIndex].connectedPoints.push(
                    toPointIndex,
                );
            }
            if (
                !finalMapPoints[toPointIndex].connectedPoints.includes(
                    fromPointIndex,
                )
            ) {
                finalMapPoints[toPointIndex].connectedPoints.push(
                    fromPointIndex,
                );
            }
        });

        return finalMapPoints;
    }

    // Helper method to visualize path structure (for debugging)
    debugPaths(): string {
        let debug = "=== PATH STRUCTURE ===\n";

        const pathGroups = new Map<string, number[]>();
        this.mapPoints.forEach((point, index) => {
            if (point.path) {
                if (!pathGroups.has(point.path)) {
                    pathGroups.set(point.path, []);
                }
                pathGroups.get(point.path)!.push(index);
            }
        });

        pathGroups.forEach((pointIndices, pathId) => {
            pointIndices.sort((a, b) => a - b);
            debug += `Path "${pathId}": [${pointIndices.join(" -> ")}]\n`;
        });

        debug += "\n=== PATH CONNECTIONS ===\n";
        this.pathConnections.forEach((connection) => {
            debug += `${connection.fromPath}(${connection.fromEnd}) <-> ${connection.toPath}(${connection.toEnd})\n`;
        });

        return debug;
    }

    // Get all points belonging to a specific path
    getPathPoints(pathId: string): { point: RawMapPoint; index: number }[] {
        return this.mapPoints
            .map((point, index) => ({ point, index }))
            .filter(({ point }) => point.path === pathId);
    }

    // Check if a point is at the start or end of its path
    getPathPosition(
        pointIndex: number,
    ): { pathId: string; position: "start" | "end" | "middle" } | null {
        const point = this.mapPoints[pointIndex];
        if (!point?.path) return null;

        const pathPoints = this.getPathPoints(point.path)
            .map(({ index }) => index)
            .sort((a, b) => a - b);

        if (pathPoints[0] === pointIndex) {
            return { pathId: point.path, position: "start" };
        }
        if (pathPoints[pathPoints.length - 1] === pointIndex) {
            return { pathId: point.path, position: "end" };
        }
        return { pathId: point.path, position: "middle" };
    }
}
