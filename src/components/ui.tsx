import type { EvidenceStrength } from "@/types";

const toneClass: Record<string, string> = {
  default: "badge",
  success: "badge badge-success",
  warning: "badge badge-warning",
  danger: "badge badge-danger",
  info: "badge badge-info",
  strong: "badge badge-strong",
  mid: "badge badge-mid",
  weak: "badge badge-weak",
  missing: "badge badge-missing",
};

export function Badge({
  children,
  tone = "default",
}: {
  children: React.ReactNode;
  tone?: keyof typeof toneClass;
}) {
  return <span className={toneClass[tone]}>{children}</span>;
}

export function strengthTone(s: EvidenceStrength) {
  if (s === "强") return "strong" as const;
  if (s === "中") return "mid" as const;
  if (s === "弱") return "weak" as const;
  return "missing" as const;
}

export function Progress({
  value,
  label,
  right,
}: {
  value: number;
  label?: string;
  right?: string;
}) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className="progress-wrap">
      {(label || right) && (
        <div className="progress-meta">
          <span>{label}</span>
          <span>{right ?? `${clamped}`}</span>
        </div>
      )}
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${clamped}%` }} />
      </div>
    </div>
  );
}

export function PanelHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="panel-header">
      <h1>{title}</h1>
      {description ? <p>{description}</p> : null}
    </div>
  );
}
