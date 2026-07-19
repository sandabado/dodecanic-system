import type { CSSProperties } from "react";
import { DataProvenanceBadge } from "@/components/DataProvenanceBadge";
import { HouseSpectrum } from "@/components/houses/HouseSpectrum";
import type { BirthProfile } from "@/lib/birth-profile";
import { DATA_PROVENANCE } from "@/lib/data-provenance";
import { HOUSE_SPECTRUM_CONIC, HOUSE_SPECTRUM_ORDER } from "@/lib/house-spectrum";

type HouseWheelStyle = CSSProperties & {
  "--house-index"?: number;
  "--house-color"?: string;
  "--house-spectrum"?: string;
};

export function NatalProfilePanel({
  profile,
  onEditProfile,
}: {
  profile: BirthProfile | null;
  onEditProfile: () => void;
}) {
  return (
    <section className="natal-profile-panel" aria-label="Your natal profile and chart">
      <header className="natal-profile-hero">
        <div>
          <p className="eyebrow">You / fixed origin</p>
          <DataProvenanceBadge status={profile ? DATA_PROVENANCE.originSupplied : DATA_PROVENANCE.originPending} />
          <h2>You are inside the machine.</h2>
          <p>
            Your verified birth chart will become the permanent blueprint. The exact sky at each visit becomes the moving layer read against it.
          </p>
        </div>
        <div className="natal-person-mark" aria-label="You are the natal anchor">
          <span>YOU</span>
          <strong>Ø</strong>
          <small>Natal anchor</small>
        </div>
      </header>

      <div className="natal-birth-grid" aria-label="Birth profile">
        <div><span>Birth date</span><strong>{profile?.birthDate || "Not provided"}</strong></div>
        <div><span>Exact time</span><strong>{profile?.birthTime || "Not provided"}</strong></div>
        <div><span>Birth place</span><strong>{profile?.birthPlace || "Not provided"}</strong></div>
        <button type="button" onClick={onEditProfile}>
          {profile ? "Edit origin" : "Add birth details"} <span aria-hidden="true">↗</span>
        </button>
      </div>

      <div className="natal-engine-banner" role="status">
        <span className="natal-engine-light" aria-hidden="true" />
        <div>
          <strong>Natal engine · not connected</strong>
          <p>
            Swiss Ephemeris, place coordinates, and historical timezone resolution must return verified data before this surface displays placements. Nothing is guessed.
          </p>
        </div>
      </div>

      <section className="natal-wheel-section" aria-label="Natal chart wheel awaiting calculation">
        <div
          className="natal-wheel"
          data-state="pending"
          style={{ "--house-spectrum": HOUSE_SPECTRUM_CONIC } as HouseWheelStyle}
        >
          <ol className="natal-wheel-houses" aria-label="Twelve natal houses">
            {HOUSE_SPECTRUM_ORDER.map((house, index) => (
              <li
                key={house.house}
                style={{ "--house-index": index, "--house-color": house.colorHex } as HouseWheelStyle}
                title={`House ${house.roman} · ${house.name} · ${house.colorName}`}
              >
                {house.roman}
              </li>
            ))}
          </ol>
          <div className="natal-wheel-center">
            <span>YOU</span>
            <strong>Ø</strong>
            <small>Fixed origin</small>
          </div>
        </div>

        <div className="natal-wheel-copy">
          <p className="eyebrow">Natal blueprint</p>
          <h3>Twelve Houses around one exact origin.</h3>
          <p>
            Verified planets, angles, cusps, and aspects will occupy this wheel. Live transits will then activate the same House system without overwriting your natal foundation.
          </p>
          <ol className="chart-data-flow">
            <li><span>01</span><strong>Resolve origin</strong><small>place · timezone · UTC</small></li>
            <li><span>02</span><strong>Calculate natal</strong><small>planets · angles · Houses</small></li>
            <li><span>03</span><strong>Compare now</strong><small>transits · aspects · activation</small></li>
          </ol>
        </div>
      </section>

      <div className="natal-layer-grid" aria-label="Chart intelligence layers">
        <article>
          <span>Fixed layer</span>
          <h3>Natal blueprint</h3>
          <p>Calculated once from verified birth coordinates and retained as the user’s chart of record.</p>
        </article>
        <article>
          <span>Moving layer</span>
          <h3>Current sky</h3>
          <p>Recalculated at the exact UTC moment the person enters or refreshes the living field.</p>
        </article>
        <article>
          <span>Meaning layer</span>
          <h3>Dodecanic reading</h3>
          <p>Transit-to-natal relationships activate Houses, colors, currents, and the reflective interpretation.</p>
        </article>
      </div>

      <HouseSpectrum variant="profile" />

      <p className="natal-data-boundary">
        Birth details currently remain in this browser session. No astrological placement appears until the calculation pipeline verifies it.
      </p>
    </section>
  );
}
