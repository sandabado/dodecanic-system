"use client";

import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import {
  DODECAHEDRON_EDGES,
  DODECAHEDRON_FACES,
  DODECAHEDRON_VERTICES,
  FACE_COORDINATES,
  getAdjacentHouses,
  type Point3,
} from "@/lib/dodecahedron/topology";
import type { BirthProfile } from "@/lib/birth-profile";
import type { ObserverSnapshot, CommunityTelemetry } from "@/lib/observer-telemetry";
import type { DodecahedralEdgeState, HouseFaceState } from "@/lib/quincunx/whole-body";
import type { HouseNumber } from "@/types/houses";

type Selection =
  | { kind: "observer"; id: "Ø" }
  | { kind: "face"; id: HouseNumber }
  | { kind: "edge"; id: string };

type ProjectedPoint = {
  x: number;
  y: number;
  z: number;
};

type ProjectedFace = ProjectedPoint & {
  house: HouseNumber;
  radius: number;
  facing: number;
  points: readonly ProjectedPoint[];
};

type ProjectedEdge = {
  id: string;
  from: ProjectedPoint;
  to: ProjectedPoint;
  z: number;
};

interface LivingDodecahedronProps {
  snapshot: ObserverSnapshot;
  community: CommunityTelemetry;
  connection: "connecting" | "live" | "local";
  profile: BirthProfile | null;
}

const COLORS = {
  OPEN: "#b8ff5a",
  MONITOR: "#ffd166",
  CLOSE: "#ff5f57",
  IDLE: "#53605b",
} as const;

const HOUSE_ROMAN: Record<HouseNumber, string> = {
  1: "I", 2: "II", 3: "III", 4: "IV", 5: "V", 6: "VI",
  7: "VII", 8: "VIII", 9: "IX", 10: "X", 11: "XI", 12: "XII",
};

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

function tracePolygon(
  context: CanvasRenderingContext2D,
  points: readonly ProjectedPoint[],
): void {
  context.beginPath();
  points.forEach((point, index) => {
    if (index === 0) context.moveTo(point.x, point.y);
    else context.lineTo(point.x, point.y);
  });
  context.closePath();
}

function isPointInPolygon(x: number, y: number, points: readonly ProjectedPoint[]): boolean {
  let inside = false;
  for (let index = 0, previous = points.length - 1; index < points.length; previous = index, index += 1) {
    const point = points[index];
    const prior = points[previous];
    const crosses = (point.y > y) !== (prior.y > y)
      && x < ((prior.x - point.x) * (y - point.y)) / (prior.y - point.y) + point.x;
    if (crosses) inside = !inside;
  }
  return inside;
}

function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export function LivingDodecahedron({ snapshot, community, connection, profile }: LivingDodecahedronProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hitMapRef = useRef<{
    faces: ProjectedFace[];
    edges: ProjectedEdge[];
    observer: { x: number; y: number } | null;
  }>({ faces: [], edges: [], observer: null });
  const rotationRef = useRef({ x: -0.24, y: 0.3 });
  const orbitRef = useRef({
    pointerInside: false,
    pointerId: null as number | null,
    startX: 0,
    startY: 0,
    startRotationX: 0,
    startRotationY: 0,
    moved: false,
  });
  const spaceHeldRef = useRef(false);
  const suppressClickRef = useRef(false);
  const [rotating, setRotating] = useState(true);
  const [spaceHeld, setSpaceHeld] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [selection, setSelection] = useState<Selection>({ kind: "observer", id: "Ø" });
  const body = snapshot.body;
  const aethericCoherence = body.pillars.find((pillar) => pillar.id === "aetheric")?.coherence ?? body.overallCoherence;
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
    const stopOrbit = () => {
      const pointerId = orbitRef.current.pointerId;
      if (pointerId === null) return;
      suppressClickRef.current = orbitRef.current.moved;
      orbitRef.current.pointerId = null;
      setDragging(false);
      const canvas = canvasRef.current;
      if (canvas?.hasPointerCapture(pointerId)) canvas.releasePointerCapture(pointerId);
    };
    const isEditable = (target: EventTarget | null) => target instanceof HTMLElement
      && (target.matches("input, textarea, select") || target.isContentEditable);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code !== "Space" || isEditable(event.target)) return;
      const canvasActive = orbitRef.current.pointerInside || document.activeElement === canvasRef.current;
      if (!canvasActive) return;
      event.preventDefault();
      if (spaceHeldRef.current) return;
      spaceHeldRef.current = true;
      setSpaceHeld(true);
    };
    const onKeyUp = (event: KeyboardEvent) => {
      if (event.code !== "Space" || !spaceHeldRef.current) return;
      event.preventDefault();
      spaceHeldRef.current = false;
      setSpaceHeld(false);
      stopOrbit();
    };
    const onBlur = () => {
      spaceHeldRef.current = false;
      setSpaceHeld(false);
      stopOrbit();
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
    };
  }, []);

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
      if (rotating && !reduceMotion && orbitRef.current.pointerId === null) {
        rotationRef.current.y += elapsed * 0.00012;
      }

      const centerX = width / 2;
      const centerY = height / 2;
      const scale = Math.min(width, height) * 0.98;
      const angleX = rotationRef.current.x;
      const angleY = rotationRef.current.y;
      const projectedVertices = DODECAHEDRON_VERTICES.map((coordinates): ProjectedPoint => {
        const [x, y, z] = rotatePoint(coordinates, angleY, angleX);
        const perspective = 1 / (4.8 - z);
        return {
          x: centerX + x * scale * perspective,
          y: centerY + y * scale * perspective,
          z,
        };
      });
      const projectedFaces = DODECAHEDRON_FACES.map(({ house, vertexIndices }): ProjectedFace => {
        const points = vertexIndices.map((index) => projectedVertices[index]);
        const x = points.reduce((sum, point) => sum + point.x, 0) / points.length;
        const y = points.reduce((sum, point) => sum + point.y, 0) / points.length;
        const z = points.reduce((sum, point) => sum + point.z, 0) / points.length;
        const radius = points.reduce((sum, point) => sum + Math.hypot(point.x - x, point.y - y), 0) / points.length;
        const facing = rotatePoint(FACE_COORDINATES[house], angleY, angleX)[2];
        return { house, x, y, z, radius, facing, points };
      });
      const topologyEdgeMap = new Map(DODECAHEDRON_EDGES.map((edge) => [edge.id, edge]));
      const edges = body.edges.map((edge): ProjectedEdge => {
        const topology = topologyEdgeMap.get(edge.id)!;
        const from = projectedVertices[topology.vertexIndices[0]];
        const to = projectedVertices[topology.vertexIndices[1]];
        return { id: edge.id, from, to, z: (from.z + to.z) / 2 };
      });
      hitMapRef.current = { faces: projectedFaces, edges, observer: { x: centerX, y: centerY } };

      const radial = context.createRadialGradient(centerX, centerY, 0, centerX, centerY, Math.min(width, height) * 0.48);
      radial.addColorStop(0, "rgba(184, 255, 90, 0.09)");
      radial.addColorStop(0.45, "rgba(94, 234, 212, 0.035)");
      radial.addColorStop(1, "rgba(3, 8, 8, 0)");
      context.fillStyle = radial;
      context.fillRect(0, 0, width, height);

      [...projectedFaces]
        .sort((faceA, faceB) => faceA.z - faceB.z)
        .forEach((point) => {
          const face = body.faces.find((item) => item.house.number === point.house)!;
          const selected = selection.kind === "face" && selection.id === point.house;
          const frontFacing = point.facing > 0;
          tracePolygon(context, point.points);
          context.fillStyle = selected
            ? "rgba(184, 255, 90, 0.23)"
            : point.house === 9
              ? frontFacing ? "rgba(255, 209, 102, 0.16)" : "rgba(255, 209, 102, 0.025)"
              : frontFacing ? "rgba(8, 22, 18, 0.78)" : "rgba(8, 18, 16, 0.035)";
          context.fill();
          if (selected) {
            context.strokeStyle = COLORS[face.valve];
            context.globalAlpha = 0.82;
            context.lineWidth = 2.5;
            context.stroke();
            context.globalAlpha = 1;
          }
        });

      const rotorPoints = [
        { symbol: "V", role: "COLLAPSE", coherence: collapseCoherence, coordinates: [-1.18, 0, 0] as Point3 },
        { symbol: "∞", role: "SPIRIT", coherence: body.quincunx.corners.spiritual.coherence, coordinates: [0, -0.62, 0] as Point3 },
        { symbol: "∧", role: "EXPANSE", coherence: expanseCoherence, coordinates: [1.18, 0, 0] as Point3 },
        { symbol: "W", role: "WAVE", coherence: body.quincunx.corners.emotional.coherence, coordinates: [0, 0.62, 0] as Point3 },
      ].map((point) => {
        const [x, y, z] = rotatePoint(point.coordinates, angleY, angleX);
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
        context.font = "700 11px ui-monospace, SFMono-Regular, Menlo, monospace";
        context.textAlign = "center";
        context.fillText(point.symbol, point.x, point.y - 10);
      });

      context.fillStyle = "#73827a";
      context.font = "10px ui-monospace, SFMono-Regular, Menlo, monospace";
      context.textAlign = "right";
      context.fillText(collapse.role, collapse.x - 9, collapse.y + 3);
      context.textAlign = "left";
      context.fillText(expanse.role, expanse.x + 9, expanse.y + 3);

      const projectedEdgeMap = new Map(edges.map((edge) => [edge.id, edge]));
      context.lineCap = "round";
      context.lineJoin = "round";
      [...body.edges]
        .sort((edgeA, edgeB) => projectedEdgeMap.get(edgeA.id)!.z - projectedEdgeMap.get(edgeB.id)!.z)
        .forEach((edge) => {
          const line = projectedEdgeMap.get(edge.id)!;
          const selected = selection.kind === "edge" && selection.id === edge.id;
          const frontEdge = line.z > -0.05;
          context.beginPath();
          context.moveTo(line.from.x, line.from.y);
          context.lineTo(line.to.x, line.to.y);
          context.strokeStyle = COLORS[edge.valve];
          context.globalAlpha = selected
            ? 1
            : frontEdge
              ? 0.38 + edge.flow * 0.56
              : 0.09 + edge.flow * 0.2;
          context.lineWidth = selected ? 3.4 : frontEdge ? 0.9 + edge.flow * 1.55 : 0.65;
          context.setLineDash(edge.valve === "IDLE" ? [3, 7] : []);
          context.stroke();
        });
      context.setLineDash([]);
      context.globalAlpha = 1;

      [...projectedFaces]
        .sort((faceA, faceB) => faceA.z - faceB.z)
        .forEach((point) => {
          const face = body.faces.find((item) => item.house.number === point.house)!;
          const selected = selection.kind === "face" && selection.id === point.house;
          const wisdom = point.house === 9;
          if (point.facing <= 0.08 && !selected) return;
          const primaryLabel = `${HOUSE_ROMAN[point.house]} · ${face.house.name.toUpperCase()}`;
          const maximumLabelWidth = Math.max(72, point.radius * 1.85);
          let labelSize = Math.max(11, Math.min(14, point.radius * 0.28));

          context.beginPath();
          context.arc(point.x, point.y, face.active ? 2.8 : 1.8, 0, Math.PI * 2);
          context.fillStyle = wisdom ? "#ffd166" : COLORS[face.valve];
          context.globalAlpha = face.active || selected || wisdom ? 1 : 0.66;
          context.fill();
          context.globalAlpha = 1;

          context.font = `750 ${selected ? labelSize + 1 : labelSize}px ui-monospace, SFMono-Regular, Menlo, monospace`;
          while (context.measureText(primaryLabel).width > maximumLabelWidth && labelSize > 11) {
            labelSize -= 0.5;
            context.font = `750 ${selected ? labelSize + 1 : labelSize}px ui-monospace, SFMono-Regular, Menlo, monospace`;
          }
          const labelWidth = context.measureText(primaryLabel).width;
          context.fillStyle = "rgba(2, 7, 5, 0.9)";
          context.fillRect(point.x - labelWidth / 2 - 6, point.y - 16, labelWidth + 12, 20);
          context.fillStyle = selected ? "#ecffdb" : wisdom ? "#ffe7a3" : "#eef7f0";
          context.textAlign = "center";
          context.textBaseline = "middle";
          context.fillText(primaryLabel, point.x, point.y - 5);
          context.fillStyle = selected ? "#caff82" : wisdom ? "#ffe08a" : "#d2dfd7";
          context.font = "750 10px ui-monospace, SFMono-Regular, Menlo, monospace";
          context.fillText(`${face.house.current} · ${face.valve}`, point.x, point.y + 12);
        });

      const anchorPulse = reduceMotion ? 0 : Math.sin(time * 0.0025) * 2;
      context.beginPath();
      context.arc(centerX, centerY, 29 + anchorPulse, 0, Math.PI * 2);
      context.strokeStyle = profile ? "rgba(184, 255, 90, 0.72)" : "rgba(255, 209, 102, 0.48)";
      context.lineWidth = 1.2;
      context.stroke();

      context.beginPath();
      context.arc(centerX, centerY, 23 - anchorPulse * 0.4, 0, Math.PI * 2);
      context.strokeStyle = profile ? "rgba(184, 255, 90, 0.22)" : "rgba(255, 209, 102, 0.16)";
      context.setLineDash([2, 4]);
      context.stroke();
      context.setLineDash([]);

      context.fillStyle = "rgba(4, 10, 8, 0.9)";
      context.fillRect(centerX - 25, centerY - 43, 50, 14);
      context.fillStyle = profile ? "#b8ff5a" : "#ffd166";
      context.font = "800 10px ui-monospace, SFMono-Regular, Menlo, monospace";
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText("YOU", centerX, centerY - 36);

      const observerPulse = 10 + anchorPulse;
      context.beginPath();
      context.arc(centerX, centerY, observerPulse, 0, Math.PI * 2);
      context.fillStyle = "#ecffdb";
      context.shadowColor = "#b8ff5a";
      context.shadowBlur = 18;
      context.fill();
      context.shadowBlur = 0;
      context.fillStyle = "#08110e";
      context.font = "800 10px ui-monospace, SFMono-Regular, Menlo, monospace";
      context.fillText("Ø", centerX, centerY);

      const natalStatus = profile ? `${profile.birthDate} · ${profile.birthTime}` : "PROFILE PENDING";
      context.font = "750 10px ui-monospace, SFMono-Regular, Menlo, monospace";
      const natalStatusWidth = context.measureText(natalStatus).width;
      context.fillStyle = "rgba(4, 10, 8, 0.9)";
      context.fillRect(centerX - natalStatusWidth / 2 - 5, centerY + 29, natalStatusWidth + 10, 14);
      context.fillStyle = profile ? "#dfffb8" : "#d6bd83";
      context.fillText(natalStatus, centerX, centerY + 36);

      frame = requestAnimationFrame(render);
    };

    frame = requestAnimationFrame(render);
    return () => cancelAnimationFrame(frame);
  }, [balanceDelta, body, collapseCoherence, expanseCoherence, profile, rotating, selection]);

  function beginOrbit(event: ReactPointerEvent<HTMLCanvasElement>) {
    event.currentTarget.focus({ preventScroll: true });
    if (!spaceHeldRef.current || event.button !== 0) return;
    const rotation = rotationRef.current;
    orbitRef.current.pointerId = event.pointerId;
    orbitRef.current.startX = event.clientX;
    orbitRef.current.startY = event.clientY;
    orbitRef.current.startRotationX = rotation.x;
    orbitRef.current.startRotationY = rotation.y;
    orbitRef.current.moved = false;
    suppressClickRef.current = false;
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(true);
    event.preventDefault();
  }

  function moveOrbit(event: ReactPointerEvent<HTMLCanvasElement>) {
    if (orbitRef.current.pointerId !== event.pointerId) return;
    const deltaX = event.clientX - orbitRef.current.startX;
    const deltaY = event.clientY - orbitRef.current.startY;
    if (Math.hypot(deltaX, deltaY) > 3) orbitRef.current.moved = true;
    rotationRef.current.y = orbitRef.current.startRotationY + deltaX * 0.007;
    rotationRef.current.x = orbitRef.current.startRotationX + deltaY * 0.007;
    event.preventDefault();
  }

  function finishOrbit(event: ReactPointerEvent<HTMLCanvasElement>) {
    if (orbitRef.current.pointerId !== event.pointerId) return;
    suppressClickRef.current = orbitRef.current.moved;
    orbitRef.current.pointerId = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setDragging(false);
  }

  function inspectAt(clientX: number, clientY: number) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const observer = hitMapRef.current.observer;
    if (observer && Math.hypot(x - observer.x, y - observer.y) <= 34) {
      setSelection({ kind: "observer", id: "Ø" });
      return;
    }
    const edge = [...hitMapRef.current.edges]
      .sort((a, b) => b.z - a.z)
      .find((line) => distanceToSegment(x, y, line.from.x, line.from.y, line.to.x, line.to.y) <= 8);
    if (edge) {
      setSelection({ kind: "edge", id: edge.id });
      return;
    }
    const face = [...hitMapRef.current.faces]
      .filter((point) => point.facing > 0)
      .sort((a, b) => b.z - a.z)
      .find((point) => isPointInPolygon(x, y, point.points));
    if (face) setSelection({ kind: "face", id: face.house });
  }

  return (
    <section className="living-model" aria-label="Living dodecahedron observer">
      <div className="living-stage">
        <canvas
          ref={canvasRef}
          className={`living-canvas${spaceHeld ? " is-orbit-ready" : ""}${dragging ? " is-orbiting" : ""}`}
          role="img"
          aria-label="Solid rotating dodecahedron with Void Observer Ø, twelve selectable pentagonal faces, and thirty selectable physical edges"
          tabIndex={0}
          onPointerEnter={() => { orbitRef.current.pointerInside = true; }}
          onPointerLeave={() => { orbitRef.current.pointerInside = false; }}
          onPointerDown={beginOrbit}
          onPointerMove={moveOrbit}
          onPointerUp={finishOrbit}
          onPointerCancel={finishOrbit}
          onClick={(event) => {
            if (suppressClickRef.current) {
              suppressClickRef.current = false;
              return;
            }
            inspectAt(event.clientX, event.clientY);
          }}
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
          <span><strong>20V · 12F</strong> solid</span>
          <span><strong>{formatPercent(aethericCoherence)}</strong> aetheric</span>
          <span><strong>{Math.round(Math.abs(balanceDelta) * 100)}</strong> {balanceLabel}</span>
        </div>
        <div className={`orbit-hint${spaceHeld ? " is-active" : ""}`} aria-hidden="true">
          <kbd>SPACE</kbd>
          <span>{dragging ? "ORBITING" : spaceHeld ? "DRAG TO ORBIT" : "HOLD + DRAG"}</span>
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
        profile={profile}
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
  profile,
  onSelectFace,
}: {
  selectedFace: HouseFaceState | null;
  selectedEdge: DodecahedralEdgeState | null;
  selectedObserver: boolean;
  community: CommunityTelemetry;
  profile: BirthProfile | null;
  onSelectFace: (house: HouseNumber) => void;
}) {
  if (selectedObserver) {
    return (
      <aside className="observer-inspector" aria-live="polite">
        <p className="eyebrow">YOU / Ø / natal anchor</p>
        <h3>{profile ? "You in the Field" : "Your Place Awaits"} <span>Ø</span></h3>
        <div className="inspector-reading" data-valve={profile ? "OPEN" : "MONITOR"}>
          <strong>{profile ? "PLACED" : "PENDING"}</strong>
          <span>DODECAHEDRAL CENTER</span>
        </div>
        <dl>
          {profile ? (
            <>
              <div><dt>Birth date</dt><dd>{profile.birthDate}</dd></div>
              <div><dt>Birth time</dt><dd>{profile.birthTime}</dd></div>
              <div><dt>Birth place</dt><dd>{profile.birthPlace}</dd></div>
            </>
          ) : (
            <>
              <div><dt>Birth date</dt><dd>Not provided</dd></div>
              <div><dt>Birth time</dt><dd>Not provided</dd></div>
              <div><dt>Birth place</dt><dd>Not provided</dd></div>
            </>
          )}
          <div><dt>Body link</dt><dd>Position 9 / Ø center</dd></div>
        </dl>
        <p className="observer-reason">
          {profile
            ? "Your birth coordinates anchor you at Ø. The twelve faces and thirty edges now move around a visible person—not an anonymous reading."
            : "Ø reserves the center for you. Add your birth coordinates in the You shelf to turn this anonymous field into your natal machine."}
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
          <div><dt>Endpoints</dt><dd>{HOUSE_ROMAN[selectedEdge.houseA.number]} / {HOUSE_ROMAN[selectedEdge.houseB.number]}</dd></div>
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
      <p className="eyebrow">House {HOUSE_ROMAN[selectedFace.house.number]} / face</p>
      <h3>{selectedFace.house.name} <span>{selectedFace.house.current}</span></h3>
      <div className="inspector-reading" data-valve={selectedFace.valve}>
        <strong>{formatPercent(selectedFace.coherence)}</strong>
        <span>{selectedFace.valve}</span>
      </div>
      <dl>
        <div><dt>Role</dt><dd>{selectedFace.house.archetype}</dd></div>
        <div><dt>Body</dt><dd>{selectedFace.house.quincunxPrimary}</dd></div>
        <div><dt>Neighbors</dt><dd>{neighbors.map((house) => HOUSE_ROMAN[house]).join(" · ")}</dd></div>
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
