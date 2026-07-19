"use client";

import { useState, type CSSProperties } from "react";
import { DataProvenanceBadge } from "@/components/DataProvenanceBadge";
import { DATA_PROVENANCE } from "@/lib/data-provenance";
import { HOUSE_SPECTRUM, HOUSE_SPECTRUM_ORDER } from "@/lib/house-spectrum";
import type { HouseNumber } from "@/types/houses";

type SpectrumStyle = CSSProperties & { "--house-color": string };

export function HouseSpectrum({ variant = "full" }: { variant?: "full" | "profile" }) {
  const [selectedHouse, setSelectedHouse] = useState<HouseNumber>(5);
  const selected = HOUSE_SPECTRUM[selectedHouse];

  return (
    <section className={`house-spectrum house-spectrum-${variant}`} aria-label="Twelve-House color and resonance spectrum">
      <header className="house-spectrum-header">
        <div>
          <p className="eyebrow">Master correspondence system</p>
          <DataProvenanceBadge status={DATA_PROVENANCE.housesSymbolic} />
          <h2>{variant === "profile" ? "Your twelve House frequencies" : "The spectrum of the twelve Houses"}</h2>
        </div>
        <p>
          One shared language for every face, reading, wheel, and House surface. Select a House to read its color, light, sound, form, and musical correspondence.
        </p>
      </header>

      <div className="house-spectrum-ribbon" aria-label="Select a House frequency">
        {HOUSE_SPECTRUM_ORDER.map((house) => (
          <button
            type="button"
            key={house.house}
            data-selected={house.house === selectedHouse}
            style={{ "--house-color": house.colorHex } as SpectrumStyle}
            onClick={() => setSelectedHouse(house.house)}
            aria-label={`House ${house.roman}, ${house.name}, ${house.colorName}`}
          >
            <span>{house.roman}</span>
            <strong>{house.name}</strong>
          </button>
        ))}
      </div>

      <div className="house-spectrum-focus" style={{ "--house-color": selected.colorHex } as SpectrumStyle}>
        <div className="house-spectrum-sigil" aria-hidden="true">
          <span>{selected.cymaticMark}</span>
          <strong>{selected.roman}</strong>
        </div>
        <div className="house-spectrum-identity">
          <span>House {selected.roman} · harmonic {selected.harmonic.toString().padStart(2, "0")}</span>
          <h3>{selected.name}</h3>
          <p>{selected.colorName} <code>{selected.colorHex}</code></p>
        </div>
        <dl className="house-spectrum-metrics">
          <div><dt>Visible light</dt><dd>{selected.wavelengthNm} nm</dd></div>
          <div><dt>Light frequency</dt><dd>{selected.lightFrequencyThz} THz</dd></div>
          <div><dt>Sound</dt><dd>{selected.soundFrequencyHz} Hz</dd></div>
          <div><dt>Note</dt><dd>{selected.note}</dd></div>
          <div><dt>Mode</dt><dd>{selected.mode}</dd></div>
          <div><dt>Geometry</dt><dd>{selected.geometry}</dd></div>
        </dl>
      </div>

      <p className="house-spectrum-boundary">
        Light values describe visible wavelengths. Sound, mode, geometry, and cymatic marks form the authored Dodecanic correspondence system—not a literal sound-to-light conversion.
      </p>
    </section>
  );
}
