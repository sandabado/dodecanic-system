import type { CSSProperties } from "react";
import type { BirthProfile } from "@/lib/birth-profile";

const BIG_THREE = ["Sun", "Moon", "Ascendant"] as const;
const ANGLES = ["Descendant", "Midheaven", "Imum Coeli"] as const;
const PLANETS = [
  "Sun",
  "Moon",
  "Mercury",
  "Venus",
  "Mars",
  "Jupiter",
  "Saturn",
  "Uranus",
  "Neptune",
  "Pluto",
] as const;
const POINTS = ["North Node", "South Node", "Chiron", "Black Moon Lilith", "Part of Fortune"] as const;
const HOUSES = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"] as const;

function PendingValue({ label }: { label: string }) {
  return (
    <li>
      <span>{label}</span>
      <strong aria-label={`${label} pending calculation`}>—</strong>
    </li>
  );
}

export function NatalProfilePanel({
  profile,
  onEditProfile,
}: {
  profile: BirthProfile | null;
  onEditProfile: () => void;
}) {
  const inputStatus = profile ? "Input complete" : "Birth details needed";

  return (
    <section className="natal-profile-panel" aria-label="Your natal profile and chart">
      <header className="natal-profile-hero">
        <div>
          <p className="eyebrow">You / natal coordinates</p>
          <h2>You are inside the machine.</h2>
          <p>
            Your birth coordinates become the fixed center. Every house, planet, angle, and aspect will be calculated around you.
          </p>
        </div>
        <div className="natal-person-mark" aria-label="You are the natal anchor">
          <span>YOU</span>
          <strong>Ø</strong>
          <small>Natal anchor</small>
        </div>
      </header>

      <div className="natal-birth-grid" aria-label="Birth profile">
        <div>
          <span>Birth date</span>
          <strong>{profile?.birthDate || "Not provided"}</strong>
        </div>
        <div>
          <span>Local birth time</span>
          <strong>{profile?.birthTime || "Not provided"}</strong>
        </div>
        <div>
          <span>Birth place</span>
          <strong>{profile?.birthPlace || "Not provided"}</strong>
        </div>
        <button type="button" onClick={onEditProfile}>
          {profile ? "Edit coordinates" : "Add birth details"} <span aria-hidden="true">↗</span>
        </button>
      </div>

      <div className="natal-engine-banner" role="status">
        <span className="natal-engine-light" aria-hidden="true" />
        <div>
          <strong>Astrology engine · connection pending</strong>
          <p>
            The chart remains intentionally blank until Swiss Ephemeris, place coordinates, and timezone resolution are connected. No placements are being guessed.
          </p>
        </div>
      </div>

      <section className="natal-wheel-section" aria-label="Natal chart wheel awaiting calculation">
        <div className="natal-wheel" data-state="pending">
          <ol className="natal-wheel-houses" aria-label="Twelve natal houses">
            {HOUSES.map((house, index) => (
              <li
                key={house}
                style={{ "--house-index": index } as CSSProperties}
              >
                {house}
              </li>
            ))}
          </ol>
          <div className="natal-wheel-center">
            <span>YOU</span>
            <strong>Ø</strong>
            <small>Natal center</small>
          </div>
        </div>
        <div className="natal-wheel-copy">
          <p className="eyebrow">Your chart surface</p>
          <h3>Twelve houses. One visible center.</h3>
          <p>
            The wheel is ready to place verified planets, angles, cusps, and aspect lines around your natal anchor. Its tracks stay empty while calculation is offline.
          </p>
          <ul>
            <li><span className="natal-wheel-key is-center" /> You / Ø natal anchor</li>
            <li><span className="natal-wheel-key is-house" /> Twelve house sectors</li>
            <li><span className="natal-wheel-key is-pending" /> Planet + aspect tracks pending</li>
          </ul>
        </div>
      </section>

      <div className="natal-chart-grid">
        <article className="natal-card natal-card-big-three">
          <header>
            <span>01</span>
            <h3>Big Three + angles</h3>
          </header>
          <div className="natal-split-list">
            <div>
              <h4>Big Three</h4>
              <ul>{BIG_THREE.map((label) => <PendingValue key={label} label={label} />)}</ul>
            </div>
            <div>
              <h4>Chart angles</h4>
              <ul>{ANGLES.map((label) => <PendingValue key={label} label={label} />)}</ul>
            </div>
          </div>
        </article>

        <article className="natal-card">
          <header>
            <span>02</span>
            <h3>Chart frame</h3>
          </header>
          <dl className="natal-frame-list">
            <div><dt>UTC birth time</dt><dd>Pending timezone</dd></div>
            <div><dt>Coordinates</dt><dd>Pending geocoding</dd></div>
            <div><dt>Zodiac</dt><dd>Pending configuration</dd></div>
            <div><dt>House system</dt><dd>Pending configuration</dd></div>
          </dl>
        </article>

        <article className="natal-card natal-card-wide">
          <header>
            <span>03</span>
            <h3>Planetary placements</h3>
            <small>Sign · degree · house · motion</small>
          </header>
          <ul className="natal-placement-list">
            {PLANETS.map((label) => <PendingValue key={label} label={label} />)}
          </ul>
          <div className="natal-secondary-points">
            <h4>Nodes + calculated points</h4>
            <ul>{POINTS.map((label) => <PendingValue key={label} label={label} />)}</ul>
          </div>
        </article>

        <article className="natal-card natal-card-wide">
          <header>
            <span>04</span>
            <h3>Twelve house cusps</h3>
            <small>Sign · exact degree</small>
          </header>
          <ol className="natal-house-list">
            {HOUSES.map((house) => (
              <li key={house}>
                <span>{house}</span>
                <strong>—</strong>
                <small>cusp pending</small>
              </li>
            ))}
          </ol>
        </article>

        <article className="natal-card">
          <header>
            <span>05</span>
            <h3>Aspect matrix</h3>
          </header>
          <div className="natal-empty-state">
            <strong>No aspects calculated yet</strong>
            <p>Major aspects, exact orbs, applying/separating motion, and chart patterns will appear after the engine returns verified longitudes.</p>
          </div>
        </article>

        <article className="natal-card">
          <header>
            <span>06</span>
            <h3>Engine status</h3>
          </header>
          <ul className="natal-status-list">
            <li data-state={profile ? "ready" : "pending"}><span>Birth profile</span><strong>{inputStatus}</strong></li>
            <li data-state="pending"><span>Place + timezone</span><strong>Pending connection</strong></li>
            <li data-state="pending"><span>Swiss Ephemeris</span><strong>Pending credentials</strong></li>
            <li data-state="pending"><span>Chart persistence</span><strong>Pending Supabase</strong></li>
          </ul>
        </article>

        <article className="natal-card natal-card-wide natal-synthesis-card">
          <header>
            <span>07</span>
            <h3>Reading synthesis</h3>
            <small>Verified chart interpretation</small>
          </header>
          <div className="natal-synthesis-grid">
            {[
              ["Identity", "Big Three, chart ruler, and dominant signatures"],
              ["Core themes", "Repeated signs, houses, elements, and modalities"],
              ["Strengths", "Supportive dignities, aspects, and pattern resources"],
              ["Tensions", "Growth edges, hard aspects, and opposing drives"],
              ["Timing", "Verified cycles and active transits when enabled"],
            ].map(([title, description]) => (
              <div key={title}>
                <span>{title}</span>
                <strong>Pending verified chart</strong>
                <p>{description}</p>
              </div>
            ))}
          </div>
        </article>
      </div>

      <p className="natal-data-boundary">
        Pending means uncalculated. This view never invents a sign, degree, house, or aspect while the chart engine is offline.
      </p>
    </section>
  );
}
