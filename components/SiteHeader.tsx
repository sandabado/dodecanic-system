import Link from "next/link";
import type { ReactNode } from "react";
import { Brand } from "./Brand";

interface SiteHeaderProps {
  utility?: ReactNode;
}

export function SiteHeader({ utility }: SiteHeaderProps) {
  return (
    <header className={`topbar${utility ? " has-utility" : ""}`}>
      <Brand />
      {utility && <div className="topbar-utility">{utility}</div>}
      <div className="topbar-actions">
        <nav className="system-nav" aria-label="Primary navigation">
          <Link href="/">Origin</Link>
          <span aria-current="page">Field</span>
        </nav>
      </div>
    </header>
  );
}
