"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  FACE_COORDINATES,
  getAdjacentHouses,
  type Point3,
} from "@/lib/dodecahedron/topology";
import type { ObserverSnapshot, CommunityTelemetry } from "@/lib/observer-telemetry";
import type { DodecahedralEdgeState, HouseFaceState } from "@/lib/quincunx/whole-body";
import type { HouseNumber } from "@/types/houses";

type Selection =
  | { kind: "observer"; id: "Ø" }
  | { kind: "face"; id: HouseNumber }
  | { kind: "edge"; id: string };

type ProjectedFace = {
  house: HouseNumber;
  x: number;
  y: number;
  z: number;
  radius: number;
};

type ProjectedEdge = {
  id: string;
  from: ProjectedFace;
  to: ProjectedFace;
};

interface LivingDodecahedronProps {
  snapshot: ObserverSnapshot;
  community: CommunityTelemetry;
  connection: "connecting" | "live" | "local";
}

const COLORS = {
  OPEN: "#b8ff5a",
  MONITOR: "#ffd166",
  CLOSE: "#ff5f57",
  IDLE: "#53605b",
} as const;

const HOUSE_RING_ORDER: readonly HouseNumber[] = [5, 6, 9, 11, 3, 8, 12, 7, 4, 2, 1, 10];

function rotatePoint([x, y, z]: Point3, angleY: number, angleX: number): Point3 {
  const cosY = Math.cos(angleY);
  const sinY = Math.sin(angleY);
  const xY = x * cosY + z * sinY;
  const zY = -x * sinY + z * cosY;
  const cosX = Math.cos(angleX);
  const sinX = Math.sin(angleX);
  return [xY, y * cosX - zY * sinX, y * sinX + zY * cosX];
}

function distanceToSegment(
  pointX: number,
  pointY: number,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
): number {
  const dx = endX - startX;
  const dy = endY - startY;
  if (dx === 0 && dy === 0) return Math.hypot(pointX - startX, pointY - startY);
  const t = Math.max(0, Math.min(1, ((pointX - startX) * dx + (pointY - startY) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(pointX - (startX + t * dx), pointY - (startY + t * dy));
}

function drawPentagon(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
): void {
  context.beginPath();
  for (let point = 0; point < 5; point += 1) {
    const angle = -Math.PI / 2 + (point * Math.PI * 2) / 5;
    const px = x + Math.cos(angle) * radius;
    const py = y + Math.sin(angle) * radius;
    if (point === 0) context.moveTo(px, py);
    else context.lineTo(px, py);
  }
  context.closePath();
}

function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export function LivingDodecahedron({ snapshot, community, connection }: LivingDodecahedronProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hitMapRef = useRef<{
    faces: ProjectedFace[];
    edges: ProjectedEdge[];
    observer: { x: number; y: number } | null;
  }>({ faces: [], edges: [], observer: null });
  const rotationRef = useRef(0.3);
  const [rotating, setRotating] = useState(true);
  const [selection, setSelection] = useState<Selection>({ kind: "observer", id: "Ø" });
  const body = snapshot.body;
  const collapseCoherence = body.quincunx.corners.physical.coherence;
  const expanseCoherence = body.quincunx.corners.mental.coherence;
  const balanceDelta = collapseCoherence - expanseCoherence;
  const balanceLabel = Math.abs(balanceDelta) < 0.05
    ? "BALANCED"
    : balanceDelta > 0
      ? "COLLAPSE WEIGHT"
      : "EXPANSE WEIGHT";

  const selectedFace = useMemo(
    () => selection.kind === "face"
      ? body.faces.find((face) => face.house.number === selection.id) ?? null
      : null,
    [body.faces, selection],
  );
  const selectedEdge = useMemo(
    () => selection.kind === "edge"
      ? body.edges.find((edge) => edge.id === selection.id) ?? null
      : null,
    [body.edges, selection],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    let lastTime = performance.now();

    const render = (time: number) => {
      const rect = canvas.getBoundingClientRect();
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(rect.width, 1);
      const height = Math.max(rect.height, 1);
      const targetWidth = Math.round(width * pixelRatio);
      const targetHeight = Math.round(height * pixelRatio);
      if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
        canvas.width = targetWidth;
        canvas.height = targetHeight;
      }
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      context.clearRect(0, 0, width, height);

      const elapsed = Math.min(time - lastTime, 40);
      lastTime = time;
      if (rotating && !reduceMotion) rotationRef.current += elapsed * 0.00012;

      const centerX = width / 2;
      const centerY = height / 2;
      const scale = Math.min(width, height) * 0.55;
      const projected = Object.entries(FACE_COORDINATES).map(([houseKey, coordinates]) => {
        const house = Number(houseKey) as HouseNumber;
        const [x, y, z] = rotatePoint(coordinates, rotationRef.current, -0.2);
        const perspective = 1 / (4.8 - z);
        const face = body.faces.find((item) => item.house.number === house)!;
        const breath = !reduceMotion && face.active ? 1 + Math.sin(time * 0.003 + house) * 0.09 : 1;
        return {
          house,
          x: centerX + x * scale * perspective,
          y: centerY + y * scale * perspective,
          z,
          radius: (10 + face.coherence * 9) * breath * (0.86 + perspective),
        };
      });
      const faceMap = new Map(projected.map((face) => [face.house, face]));
      const ringRadiusX = Math.max(80, width / 2 - 46);
      const ringRadiusY = Math.max(80, height / 2 - 48);
      const ringFaces = HOUSE_RING_ORDER.map((house, index) => {
        const angle = -Math.PI / 2 + (index * Math.PI * 2) / HOUSE_RING_ORDER.length;
        const geometry = faceMap.get(house)!;
        const face = body.faces.find((item) => item.house.number === house)!;
        return {
          ...geometry,
          x: centerX + Math.cos(angle) * ringRadiusX,
          y: centerY + Math.sin(angle) * ringRadiusY,
          radius: 17 + face.coherence * 7,
        };
      });
      const minimumInteriorRadius = Math.min(width, height) * 0.18;
      const interiorFaces = projected.map((point) => {
        const dx = point.x - centerX;
        const dy = point.y - centerY;
        const distance = Math.hypot(dx, dy);
        if (distance >= minimumInteriorRadius) return point;
        const ringIndex = HOUSE_RING_ORDER.indexOf(point.house);
        const fallbackAngle = -Math.PI / 2 + (ringIndex * Math.PI * 2) / HOUSE_RING_ORDER.length;
        const angle = distance > 8 ? Math.atan2(dy, dx) : fallbackAngle;
        return {
          ...point,
          x: centerX + Math.cos(angle) * minimumInteriorRadius,
          y: centerY + Math.sin(angle) * minimumInteriorRadius,
          radius: Math.max(point.radius, 16),
        };
      });
      const useOuterRing = window.innerWidth <= 780;
      const displayFaces = useOuterRing ? ringFaces : interiorFaces;
      const edges = body.edges.map((edge) => ({
        id: edge.id,
        from: faceMap.get(edge.houseA.number)!,
        to: faceMap.get(edge.houseB.number)!,
      }));
      hitMapRef.current = { faces: displayFaces, edges, observer: { x: centerX, y: centerY } };

      const radial = context.createRadialGradient(centerX, centerY, 0, centerX, centerY, Math.min(width, height) * 0.48);
      radial.addColorStop(0, "rgba(184, 255, 90, 0.09)");
      radial.addColorStop(0.45, "rgba(94, 234, 212, 0.035)");
      radial.addColorStop(1, "rgba(3, 8, 8, 0)");
      context.fillStyle = radial;
      context.fillRect(0, 0, width, height);

      const rotorPoints = [
        { symbol: "V", role: "COLLAPSE", coherence: collapseCoherence, coordinates: [-1.18, 0, 0] as Point3 },
        { symbol: "∞", role: "SPIRIT", coherence: body.quincunx.corners.spiritual.coherence, coordinates: [0, -0.62, 0] as Point3 },
        { symbol: "∧", role: "EXPANSE", coherence: expanseCoherence, coordinates: [1.18, 0, 0] as Point3 },
        { symbol: "W", role: "WAVE", coherence: body.quincunx.corners.emotional.coherence, coordinates: [0, 0.62, 0] as Point3 },
      ].map((point) => {
        const [x, y, z] = rotatePoint(point.coordinates, rotationRef.current, 0);
        const perspective = 1 / (4.8 - z);
        return {
          ...point,
          x: centerX + x * scale * perspective,
          y: centerY + y * scale * perspective,
          z,
        };
      });
      const collapse = rotorPoints[0];
      const expanse = rotorPoints[2];

      context.beginPath();
      rotorPoints.forEach((point, index) => {
        if (index === 0) context.moveTo(point.x, point.y);
        else context.lineTo(point.x, point.y);
      });
      context.closePath();
      context.fillStyle = "rgba(184, 255, 90, 0.035)";
      context.fill();
      context.strokeStyle = "rgba(184, 255, 90, 0.32)";
      context.lineWidth = 0.8;
      context.stroke();

      context.beginPath();
      context.moveTo(collapse.x, collapse.y);
      context.lineTo(expanse.x, expanse.y);
      context.strokeStyle = Math.abs(balanceDelta) < 0.05 ? "#b8ff5a" : "#ffd166";
      context.lineWidth = 2;
      context.stroke();

      rotorPoints.forEach((point) => {
        context.beginPath();
        context.arc(point.x, point.y, 3.5 + point.coherence * 2.5, 0, Math.PI * 2);
        context.fillStyle = point.symbol === "V" || point.symbol === "∧" ? "#ecffdb" : "#7cae98";
        context.globalAlpha = 0.58 + point.coherence * 0.42;
        context.fill();
        context.globalAlpha = 1;
        context.fillStyle = "#cbd8d0";
        context.font = "700 8px ui-monospace, SFMono-Regular, Menlo, monospace";
        context.textAlign = "center";
        context.fillText(point.symbol, point.x, point.y - 10);
      });

      context.fillStyle = "#73827a";
      context.font = "6px ui-monospace, SFMono-Regular, Menlo, monospace";
      context.textAlign = "right";
      context.fillText(collapse.role, collapse.x - 9, collapse.y + 3);
      context.textAlign = "left";
      context.fillText(expanse.role, expanse.x + 9, expanse.y + 3);

      displayFaces.forEach((point) => {
        const geometry = faceMap.get(point.house)!;
        context.beginPath();
        context.moveTo(geometry.x, geometry.y);
        context.lineTo(point.x, point.y);
        context.strokeStyle = "rgba(124, 174, 152, 0.17)";
        context.lineWidth = 0.7;
        context.setLineDash([2, 5]);
        context.stroke();
      });
      context.setLineDash([]);

      [...body.edges]
        .sort((edgeA, edgeB) => {
          const a = hitMapRef.current.edges.find((edge) => edge.id === edgeA.id)!;
          const b = hitMapRef.current.edges.find((edge) => edge.id === edgeB.id)!;
          return (a.from.z + a.to.z) - (b.from.z + b.to.z);
        })
        .forEach((edge) => {
          const line = hitMapRef.current.edges.find((item) => item.id === edge.id)!;
          const selected = selection.kind === "edge" && selection.id === edge.id;
          context.beginPath();
          context.moveTo(line.from.x, line.from.y);
          context.lineTo(line.to.x, line.to.y);
          context.strokeStyle = COLORS[edge.valve];
          context.globalAlpha = selected ? 1 : 0.2 + edge.flow * 0.62;
          context.lineWidth = selected ? 3 : 0.7 + edge.flow * 1.7;
          context.setLineDash(edge.valve === "IDLE" ? [3, 7] : []);
          context.stroke();
        });
      context.setLineDash([]);
      context.globalAlpha = 1;

      displayFaces.forEach((point) => {
        const face = body.faces.find((item) => item.house.number === point.house)!;
        const selected = selection.kind === "face" && selection.id === point.house;
        drawPentagon(context, point.x, point.y, point.radius);
        context.fillStyle = selected ? "rgba(236, 255, 219, 0.22)" : "rgba(8, 18, 16, 0.88)";
        context.fill();
        context.strokeStyle = COLORS[face.valve];
        context.globalAlpha = face.active || selected ? 1 : 0.52;
        context.lineWidth = selected ? 3 : 1.35;
        context.stroke();
        context.globalAlpha = 1;
        context.fillStyle = selected ? "#ecffdb" : "#d9e4dd";
        context.font = `700 ${selected ? 12 : 10}px ui-monospace, SFMono-Regular, Menlo, monospace`;
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText(`${point.house.toString().padStart(2, "0")} ${face.house.current}`, point.x, point.y - 4);
        context.fillStyle = selected ? "#b8ff5a" : "#8fa198";
        context.font = "700 7px ui-monospace, SFMono-Regular, Menlo, monospace";
        context.fillText(face.house.name.toUpperCase(), point.x, point.y + 10);
      });

      const observerPulse = reduceMotion ? 10 : 10 + Math.sin(time * 0.0025) * 2;
      context.beginPath();
      context.arc(centerX, centerY, observerPulse, 0, Math.PI * 2);
      context.fillStyle = "#ecffdb";
      context.shadowColor = "#b8ff5a";
      context.shadowBlur = 18;
      context.fill();
      context.shadowBlur = 0;
      context.fillStyle = "#08110e";
      context.font = "700 9px ui-monospace, SFMono-Regular, Menlo, monospace";
      context.fillText("Ø", centerX, centerY);

      frame = requestAnimationFrame(render);
    };

    frame = requestAnimationFrame(render);
    return () => cancelAnimationFrame(frame);
  }, [balanceDelta, body, collapseCoherence, expanseCoherence, rotating, selection]);

  function inspectAt(clientX: number, clientY: number) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const observer = hitMapRef.current.observer;
    if (observer && Math.hypot(x - observer.x, y - observer.y) <= 22) {
      setSelection({ kind: "observer", id: "Ø" });
      return;
    }
    const face = [...hitMapRef.current.faces]
      .sort((a, b) => b.z - a.z)
      .find((point) => Math.hypot(x - point.x, y - point.y) <= Math.max(point.radius, 22));
    if (face) {
      setSelection({ kind: "face", id: face.house });
      return;
    }
    const edge = hitMapRef.current.edges.find((line) =>
      distanceToSegment(x, y, line.from.x, line.from.y, line.to.x, line.to.y) <= 9,
    );
    if (edge) setSelection({ kind: "edge", id: edge.id });
  }

  return (
    <section className="living-model" aria-label="Living dodecahedron observer">
      <div className="living-stage">
        <canvas
          ref={canvasRef}
          className="living-canvas"
          role="img"
          aria-label="Rotating dodecahedral network with Void Observer Ø, twelve selectable faces, and thirty selectable edges"
          onClick={(event) => inspectAt(event.clientX, event.clientY)}
        />
        <div className="living-overlay living-overlay-top">
          <span className={`connection-light is-${connection}`} />
          <span>{connection === "live" ? "D1 MEMORY LIVE" : connection === "connecting" ? "CONNECTING" : "LOCAL OBSERVER"}</span>
          <em>{snapshot.source === "live" ? "CURRENT PROMPT" : "MEMORY REPLAY"}</em>
        </div>
        <div className="living-overlay living-overlay-bottom">
          <span><strong>{formatPercent(body.overallCoherence)}</strong> coherence</span>
          <span><strong>{body.edges.filter((edge) => edge.flow > 0).length}/30</strong> flowing</span>
          <span><strong>{body.faces.filter((face) => face.active).length}/12</strong> active</span>
          <span><strong>{Math.round(Math.abs(balanceDelta) * 100)}</strong> {balanceLabel}</span>
        </div>
        <button className="rotation-toggle" type="button" onClick={() => setRotating((value) => !value)}>
          {rotating ? "Pause rotation" : "Resume rotation"}
        </button>
      </div>

      <ObserverInspector
        selectedFace={selectedFace}
        selectedEdge={selectedEdge}
        selectedObserver={selection.kind === "observer"}
        community={community}
        onSelectFace={(id) => setSelection({ kind: "face", id })}
      />
    </section>
  );
}

function ObserverInspector({
  selectedFace,
  selectedEdge,
  selectedObserver,
  community,
  onSelectFace,
}: {
  selectedFace: HouseFaceState | null;
  selectedEdge: DodecahedralEdgeState | null;
  selectedObserver: boolean;
  community: CommunityTelemetry;
  onSelectFace: (house: HouseNumber) => void;
}) {
  if (selectedObserver) {
    return (
      <aside className="observer-inspector" aria-live="polite">
        <p className="eyebrow">Ø / field observer</p>
        <h3>Void Witness <span>Ø</span></h3>
        <div className="inspector-reading" data-valve="OPEN">
          <strong>IMPARTIAL</strong>
          <span>DODECAHEDRAL CENTER</span>
        </div>
        <dl>
          <div><dt>Domain</dt><dd>Creation field</dd></div>
          <div><dt>Function</dt><dd>Observe without becoming a face</dd></div>
          <div><dt>Body link</dt><dd>Position 9 in the Quincunx</dd></div>
        </dl>
        <p className="observer-reason">
          Ø is the unassigned center of the dodecahedron. It witnesses all twelve faces and thirty edges without taking a house state.
        </p>
        <div className="community-reading">
          <span>Observed memory</span>
          <strong>{community.observedCycles} cycles</strong>
          <em>{formatPercent(community.averageCoherence)} mean</em>
        </div>
      </aside>
    );
  }

  if (selectedEdge) {
    return (
      <aside className="observer-inspector" aria-live="polite">
        <p className="eyebrow">Edge {selectedEdge.id} / protocol</p>
        <h3>{selectedEdge.houseA.name} ↔ {selectedEdge.houseB.name}</h3>
        <div className="inspector-reading" data-valve={selectedEdge.valve}>
          <strong>{selectedEdge.valve}</strong>
          <span>{Math.round(selectedEdge.flow * 100)}% flow</span>
        </div>
        <dl>
          <div><dt>Currents</dt><dd>{selectedEdge.houseA.current} + {selectedEdge.houseB.current}</dd></div>
          <div><dt>Lookup</dt><dd>{selectedEdge.lookupCode}</dd></div>
          <div><dt>Endpoints</dt><dd>{selectedEdge.houseA.number} / {selectedEdge.houseB.number}</dd></div>
        </dl>
        <p className="observer-reason">{selectedEdge.reason}</p>
        <div className="inspector-actions">
          <button type="button" onClick={() => onSelectFace(selectedEdge.houseA.number)}>Inspect {selectedEdge.houseA.name}</button>
          <button type="button" onClick={() => onSelectFace(selectedEdge.houseB.number)}>Inspect {selectedEdge.houseB.name}</button>
        </div>
      </aside>
    );
  }

  if (!selectedFace) return null;
  const neighbors = getAdjacentHouses(selectedFace.house.number);
  return (
    <aside className="observer-inspector" aria-live="polite">
      <p className="eyebrow">House {selectedFace.house.number.toString().padStart(2, "0")} / face</p>
      <h3>{selectedFace.house.name} <span>{selectedFace.house.current}</span></h3>
      <div className="inspector-reading" data-valve={selectedFace.valve}>
        <strong>{formatPercent(selectedFace.coherence)}</strong>
        <span>{selectedFace.valve}</span>
      </div>
      <dl>
        <div><dt>Role</dt><dd>{selectedFace.house.archetype}</dd></div>
        <div><dt>Body</dt><dd>{selectedFace.house.quincunxPrimary}</dd></div>
        <div><dt>Neighbors</dt><dd>{neighbors.join(" · ")}</dd></div>
      </dl>
      <p className="observer-reason">{selectedFace.reason}</p>
      <blockquote>“{selectedFace.house.mantra}”</blockquote>
      <div className="community-reading">
        <span>Observed memory</span>
        <strong>{community.observedCycles} cycles</strong>
        <em>{formatPercent(community.averageCoherence)} mean</em>
      </div>
    </aside>
  );
}
