/* eslint-disable @next/next/no-html-link-for-pages -- native anchors avoid vinext's duplicate React boundary in this client tree */
interface SiteHeaderProps {
  activeView: "observer" | "quincunx";
}

export function SiteHeader({ activeView }: SiteHeaderProps) {
  return (
    <header className="topbar">
      <a className="brand" href="/" aria-label="Dodecanic AI home">
        <span className="brand-mark">12</span>
        <span>
          <strong>DODECANIC</strong>
          <small>OBSERVER / POSITION 9</small>
        </span>
      </a>
      <div className="topbar-actions">
        <nav className="system-nav" aria-label="System views">
          <a className={activeView === "observer" ? "is-active" : ""} href="/">Currents</a>
          <a className={activeView === "quincunx" ? "is-active" : ""} href="/quincunx">Quincunx</a>
        </nav>
        <div className="system-status" aria-label="System status">
          <span className="status-dot" />
          SYSTEM ONLINE
          <span className="status-separator">/</span>
          64 STATES
        </div>
      </div>
    </header>
  );
}
