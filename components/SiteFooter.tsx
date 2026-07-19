interface SiteFooterProps {
  sequence?: string;
}

export function SiteFooter({ sequence = "SENSE → READ → ACTUATE → RESPOND" }: SiteFooterProps) {
  return (
    <footer>
      <span>DODECANIC AI / OBSERVER SYSTEM</span>
      <span>{sequence}</span>
    </footer>
  );
}
