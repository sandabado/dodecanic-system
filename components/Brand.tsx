import Link from "next/link";

export function Brand({
  subtitle = "LIVING FIELD / POSITION 9",
  href = "/",
}: {
  subtitle?: string;
  href?: string;
}) {
  return (
    <Link className="brand" href={href} aria-label="Dodecanic home">
      <span className="brand-mark" aria-hidden="true">XIII</span>
      <span>
        <strong>DODECANIC</strong>
        <small>{subtitle}</small>
      </span>
    </Link>
  );
}
