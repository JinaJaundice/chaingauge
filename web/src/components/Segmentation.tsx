import { SlidersHorizontal } from "lucide-react";
import {
  CUSTOMER_META,
  PRODUCT_META,
  type CustomerProfile,
  type ProductProfile,
  type Profile,
} from "../lib/model";

// The deployment-profile control. Changing the product or customer re-weights
// the model, which re-scores and re-ranks every chain. This is what makes the
// ratings product-aware rather than one-size-fits-all.

export function Segmentation({
  profile,
  setProfile,
  compact = false,
}: {
  profile: Profile;
  setProfile: (p: Profile) => void;
  compact?: boolean;
}) {
  return (
    <div className={`panel flex flex-wrap items-center gap-x-5 gap-y-2 rounded-md px-4 ${compact ? "py-2" : "py-3"}`}>
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-faint">
        <SlidersHorizontal className="size-3.5" />
        Deployment profile
      </div>
      <Field
        label="Product"
        value={profile.product}
        onChange={(v) => setProfile({ ...profile, product: v as ProductProfile })}
        options={Object.entries(PRODUCT_META).map(([id, m]) => [id, m.label])}
      />
      <Field
        label="Customer"
        value={profile.customer}
        onChange={(v) => setProfile({ ...profile, customer: v as CustomerProfile })}
        options={Object.entries(CUSTOMER_META).map(([id, m]) => [id, m.label])}
      />
      {!compact && (
        <span className="sans max-w-md text-xs text-faint">
          {PRODUCT_META[profile.product].blurb}
        </span>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: [string, string][];
}) {
  return (
    <label className="flex items-center gap-2">
      <span className="text-[11px] uppercase tracking-wide text-muted">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="panel-2 mono cursor-pointer rounded border px-2 py-1 text-xs text-ink outline-none focus-visible:border-[var(--accent)]"
      >
        {options.map(([id, lbl]) => (
          <option key={id} value={id} className="bg-[var(--panel)] text-ink">
            {lbl}
          </option>
        ))}
      </select>
    </label>
  );
}
