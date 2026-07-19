import type { DataProvenanceDefinition } from "@/lib/data-provenance";

export function DataProvenanceBadge({
  status,
  compact = false,
}: {
  status: DataProvenanceDefinition;
  compact?: boolean;
}) {
  return (
    <span
      className={`data-provenance${compact ? " is-compact" : ""}`}
      data-kind={status.kind}
      title={status.disclosure}
    >
      <i aria-hidden="true" />
      {status.label}
    </span>
  );
}
