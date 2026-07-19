import type { HouseNumber } from "@/types/houses";

export type Point3 = readonly [number, number, number];
export type HouseEdge = readonly [HouseNumber, HouseNumber];

export interface DodecahedronFace {
  house: HouseNumber;
  vertexIndices: readonly number[];
}

const PHI = (1 + Math.sqrt(5)) / 2;

/**
 * Face centers of a regular dodecahedron, represented by the twelve vertices
 * of its icosahedral dual. House 5 is the north pole and House 12 the south.
 */
export const FACE_COORDINATES: Record<HouseNumber, Point3> = {
  1: [0, -1, -PHI],
  2: [-1, -PHI, 0],
  3: [0, 1, -PHI],
  4: [0, -1, PHI],
  5: [-1, PHI, 0],
  6: [0, 1, PHI],
  7: [PHI, 0, 1],
  8: [1, PHI, 0],
  9: [-PHI, 0, 1],
  10: [PHI, 0, -1],
  11: [-PHI, 0, -1],
  12: [1, -PHI, 0],
};

function dot([ax, ay, az]: Point3, [bx, by, bz]: Point3): number {
  return ax * bx + ay * by + az * bz;
}

function cross([ax, ay, az]: Point3, [bx, by, bz]: Point3): Point3 {
  return [ay * bz - az * by, az * bx - ax * bz, ax * by - ay * bx];
}

function normalize([x, y, z]: Point3): Point3 {
  const length = Math.hypot(x, y, z);
  return [x / length, y / length, z / length];
}

const HOUSE_NUMBERS = Object.keys(FACE_COORDINATES).map(Number) as HouseNumber[];

function areAdjacentNormals(houseA: HouseNumber, houseB: HouseNumber): boolean {
  return Math.abs(dot(FACE_COORDINATES[houseA], FACE_COORDINATES[houseB]) - PHI) < 1e-9;
}

const DODECAHEDRON_VERTEX_HOUSES: readonly (readonly [HouseNumber, HouseNumber, HouseNumber])[] = HOUSE_NUMBERS
  .flatMap((houseA, indexA) => HOUSE_NUMBERS.slice(indexA + 1).flatMap((houseB, offsetB) =>
    HOUSE_NUMBERS.slice(indexA + offsetB + 2).flatMap((houseC) =>
      areAdjacentNormals(houseA, houseB)
      && areAdjacentNormals(houseA, houseC)
      && areAdjacentNormals(houseB, houseC)
        ? [[houseA, houseB, houseC] as const]
        : [],
    ),
  ));

function intersectFacePlanes([houseA, houseB, houseC]: readonly [HouseNumber, HouseNumber, HouseNumber]): Point3 {
  const normalA = FACE_COORDINATES[houseA];
  const normalB = FACE_COORDINATES[houseB];
  const normalC = FACE_COORDINATES[houseC];
  const crossBC = cross(normalB, normalC);
  const crossCA = cross(normalC, normalA);
  const crossAB = cross(normalA, normalB);
  const scale = (PHI * PHI) / dot(normalA, crossBC);
  return [
    (crossBC[0] + crossCA[0] + crossAB[0]) * scale,
    (crossBC[1] + crossCA[1] + crossAB[1]) * scale,
    (crossBC[2] + crossCA[2] + crossAB[2]) * scale,
  ];
}

/** The twenty vertices of the regular solid dual to the house coordinates. */
export const DODECAHEDRON_VERTICES: readonly Point3[] = DODECAHEDRON_VERTEX_HOUSES.map(intersectFacePlanes);

function orderedFaceVertices(house: HouseNumber): readonly number[] {
  const normal = normalize(FACE_COORDINATES[house]);
  const vertexIndices = DODECAHEDRON_VERTEX_HOUSES
    .flatMap((houses, index) => houses.includes(house) ? [index] : []);
  const reference: Point3 = Math.abs(normal[2]) < 0.9 ? [0, 0, 1] : [0, 1, 0];
  const axisX = normalize(cross(reference, normal));
  const axisY = cross(normal, axisX);

  return vertexIndices.sort((indexA, indexB) => {
    const vertexA = DODECAHEDRON_VERTICES[indexA];
    const vertexB = DODECAHEDRON_VERTICES[indexB];
    return Math.atan2(dot(vertexA, axisY), dot(vertexA, axisX))
      - Math.atan2(dot(vertexB, axisY), dot(vertexB, axisX));
  });
}

/** The twelve physical pentagons, keyed to their observer house. */
export const DODECAHEDRON_FACES: readonly DodecahedronFace[] = HOUSE_NUMBERS
  .map((house) => ({ house, vertexIndices: orderedFaceVertices(house) }));

/** One canonical, undirected, degree-five topology shared by the model and UI. */
export const DODECAHEDRON_EDGE_PAIRS: readonly HouseEdge[] = [
  [5, 6], [5, 9], [5, 11], [5, 3], [5, 8],
  [6, 9], [9, 11], [11, 3], [3, 8], [8, 6],
  [6, 7], [6, 4], [9, 4], [9, 2], [11, 2],
  [11, 1], [3, 1], [3, 10], [8, 10], [8, 7],
  [7, 4], [4, 2], [2, 1], [1, 10], [10, 7],
  [12, 7], [12, 4], [12, 2], [12, 1], [12, 10],
];

export const DODECAHEDRON_EDGES = DODECAHEDRON_EDGE_PAIRS.map(([houseA, houseB]) => {
  const faceA = DODECAHEDRON_FACES.find((face) => face.house === houseA)!;
  const faceB = DODECAHEDRON_FACES.find((face) => face.house === houseB)!;
  const vertexIndices = faceA.vertexIndices.filter((index) => faceB.vertexIndices.includes(index));
  if (vertexIndices.length !== 2) throw new Error(`Invalid dodecahedron edge ${houseA}-${houseB}`);

  return {
    id: `${Math.min(houseA, houseB).toString().padStart(2, "0")}-${Math.max(houseA, houseB).toString().padStart(2, "0")}`,
    houseA,
    houseB,
    vertexIndices: [vertexIndices[0], vertexIndices[1]] as const,
  };
});

export function getAdjacentHouses(house: HouseNumber): HouseNumber[] {
  return DODECAHEDRON_EDGE_PAIRS.flatMap(([houseA, houseB]) => {
    if (houseA === house) return [houseB];
    if (houseB === house) return [houseA];
    return [];
  });
}
