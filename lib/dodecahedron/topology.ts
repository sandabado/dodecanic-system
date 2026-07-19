import type { HouseNumber } from "@/types/houses";

export type Point3 = readonly [number, number, number];
export type HouseEdge = readonly [HouseNumber, HouseNumber];

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

/** One canonical, undirected, degree-five topology shared by the model and UI. */
export const DODECAHEDRON_EDGE_PAIRS: readonly HouseEdge[] = [
  [5, 6], [5, 9], [5, 11], [5, 3], [5, 8],
  [6, 9], [9, 11], [11, 3], [3, 8], [8, 6],
  [6, 7], [6, 4], [9, 4], [9, 2], [11, 2],
  [11, 1], [3, 1], [3, 10], [8, 10], [8, 7],
  [7, 4], [4, 2], [2, 1], [1, 10], [10, 7],
  [12, 7], [12, 4], [12, 2], [12, 1], [12, 10],
];

export const DODECAHEDRON_EDGES = DODECAHEDRON_EDGE_PAIRS.map(([houseA, houseB]) => ({
  id: `${Math.min(houseA, houseB).toString().padStart(2, "0")}-${Math.max(houseA, houseB).toString().padStart(2, "0")}`,
  houseA,
  houseB,
}));

export function getAdjacentHouses(house: HouseNumber): HouseNumber[] {
  return DODECAHEDRON_EDGE_PAIRS.flatMap(([houseA, houseB]) => {
    if (houseA === house) return [houseB];
    if (houseB === house) return [houseA];
    return [];
  });
}
