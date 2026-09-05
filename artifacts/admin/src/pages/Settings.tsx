import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listSettingsAdmin, updateSettingAdmin } from "@workspace/api-client-react";
import Layout from "@/components/Layout";

interface FieldDef {
  key: string;
  label: string;
  isSecret: boolean;
  placeholder: string;
}

const ADMOB_FIELDS: FieldDef[] = [
  { key: "ADMOB_APP_ID_IOS", label: "AdMob App ID (iOS)", isSecret: false, placeholder: "ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX" },
  { key: "ADMOB_APP_ID_ANDROID", label: "AdMob App ID (Android)", isSecret: false, placeholder: "ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX" },
  { key: "ADMOB_BANNER_UNIT_ID_IOS", label: "Banner ad unit ID (iOS)", isSecret: false, placeholder: "ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX" },
  { key: "ADMOB_BANNER_UNIT_ID_ANDROID", label: "Banner ad unit ID (Android)", isSecret: false, placeholder: "ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX" },
  { key: "ADMOB_INTERSTITIAL_UNIT_ID_IOS", label: "Interstitial ad unit ID (iOS)", isSecret: false, placeholder: "ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX" },
  { key: "ADMOB_INTERSTITIAL_UNIT_ID_ANDROID", label: "Interstitial ad unit ID (Android)", isSecret: false, placeholder: "ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX" },
  { key: "ADMOB_REWARDED_UNIT_ID_IOS", label: "Rewarded ad unit ID (iOS)", isSecret: false, placeholder: "ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX" },
  { key: "ADMOB_REWARDED_UNIT_ID_ANDROID", label: "Rewarded ad unit ID (Android)", isSecret: false, placeholder: "ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX" },
];

const API_KEY_FIELDS: FieldDef[] = [
  { key: "AI_ADVISOR_API_KEY", label: "AI advisor API key", isSecret: true, placeholder: "sk-..." },
];

function Section({ title, description, fields, values, onChange, onSave, savingKey }: {
  title: string;
  description: string;
  fields: FieldDef[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
  onSave: (field: FieldDef) => void;
  savingKey: string | null;
}) {
  return (
    <div className="bg-[var(--ink-900)] border border-[var(--ink-700)] rounded-[var(--radius-lg)] p-6 mb-6">
      <h2 className="font-semibold mb-1">{title}</h2>
      <p className="text-sm text-[var(--ink-400)] mb-5">{description}</p>
      <div className="space-y-4">
        {fields.map((field) => (
          <div key={field.key} className="flex items-end gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1.5 text-[var(--ink-200)]">{field.label}</label>
              <input
                type={field.isSecret ? "password" : "text"}
                placeholder={field.placeholder}
                value={values[field.key] ?? ""}
                onChange={(e) => onChange(field.key, e.target.value)}
                className="w-full rounded-[var(--radius-sm)] bg-[var(--ink-800)] border border-[var(--ink-600)] px-3 py-2 text-sm mono placeholder:text-[var(--ink-400)] focus:border-[var(--amber-500)]"
              />
            </div>
            <button
              onClick={() => onSave(field)}
              disabled={savingKey === field.key}
              className="rounded-[var(--radius-sm)] border border-[var(--ink-600)] px-4 py-2 text-sm text-[var(--ink-200)] hover:border-[var(--amber-500)] hover:text-[var(--paper)] transition-colors disabled:opacity-50 shrink-0"
            >
              {savingKey === field.key ? "Saving…" : "Save"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Settings() {
  const queryClient = useQueryClient();
  const { data } = useQuery({ queryKey: ["admin-settings"], queryFn: listSettingsAdmin });
  const [values, setValues] = useState<Record<string, string>>({});
  const [savingKey, setSavingKey] = useState<string | null>(null);

  useEffect(() => {
    if (data) {
      setValues(Object.fromEntries(data.map((s) => [s.key, s.value])));
    }
  }, [data]);

  const save = useMutation({
    mutationFn: ({ key, value, isSecret }: { key: string; value: string; isSecret: boolean }) =>
      updateSettingAdmin(key, value, isSecret),
    onMutate: (v) => setSavingKey(v.key),
    onSettled: () => setSavingKey(null),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-settings"] }),
  });

  function handleChange(key: string, value: string) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function handleSave(field: FieldDef) {
    save.mutate({ key: field.key, value: values[field.key] ?? "", isSecret: field.isSecret });
  }

  return (
    <Layout>
      <h1 className="text-xl font-semibold mb-1">Settings &amp; API keys</h1>
      <p className="text-sm text-[var(--ink-400)] mb-6">
        These are stored in the database and read by the app at runtime — no redeploy needed after a change.
      </p>

      <Section
        title="AdMob"
        description="Ad unit IDs used by the mobile app. Leave a field blank to disable that ad placement."
        fields={ADMOB_FIELDS}
        values={values}
        onChange={handleChange}
        onSave={handleSave}
        savingKey={savingKey}
      />

      <Section
        title="API keys"
        description="Secret keys used by the backend. Never exposed to the mobile app directly."
        fields={API_KEY_FIELDS}
        values={values}
        onChange={handleChange}
        onSave={handleSave}
        savingKey={savingKey}
      />
    </Layout>
  );
}
