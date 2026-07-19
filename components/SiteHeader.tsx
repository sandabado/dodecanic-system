/* eslint-disable @next/next/no-html-link-for-pages -- native anchors intentionally perform full-page field navigation */
import type { ReactNode } from "react";

interface SiteHeaderProps {
  activeView: "observer" | "quincunx";
  utility?: ReactNode;
}

export function SiteHeader({ activeView, utility }: SiteHeaderProps) {
  return (
    <header className={`topbar${utility ? " has-utility" : ""}`}>
      <a className="brand" href="/" aria-label="Dodecanic AI home">
        <span className="brand-mark" aria-hidden="true">XIII</span>
        <span>
          <strong>DODECANIC</strong>
          <small>OBSERVER / POSITION 9</small>
        </span>
      </a>
      {utility && <div className="topbar-utility">{utility}</div>}
      <div className="topbar-actions">
        <nav className="system-nav" aria-label="System views">
          <a className={activeView === "observer" ? "is-active" : ""} href="/">Portal</a>
          <a className={activeView === "quincunx" ? "is-active" : ""} href="/quincunx">Field</a>
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
