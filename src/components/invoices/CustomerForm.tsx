"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/** Admin: add a customer to invoice */
export function CustomerForm() {
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;
    setBusy(true);
    setErrors({});
    const res = await fetch("/api/admin/invoices/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: fd.name, email: fd.email, contactName: fd.contactName || undefined, address: fd.address || undefined }),
    });
    const json = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok || !json.ok) return setErrors(json.errors ?? { name: json.message ?? "Something went wrong." });
    form.reset();
    router.refresh();
  };
  const field = (name: string, label: string, type = "text") => (
    <div>
      <label htmlFor={`cu-${name}`} className="label">{label}</label>
      <input id={`cu-${name}`} name={name} type={type} className="field" />
      {errors[name] && <p className="error-text">{errors[name]}</p>}
    </div>
  );
  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-4 rounded-2xl border border-navy-950/10 bg-white p-5 sm:grid-cols-2">
      {field("name", "Organisation")}
      {field("contactName", "Contact name (optional)")}
      {field("email", "Email", "email")}
      {field("address", "Address (optional)")}
      <div className="sm:col-span-2">
        <button type="submit" disabled={busy} className="rounded-full bg-navy-950 px-5 py-2.5 text-sm font-semibold text-cream disabled:opacity-50">{busy ? "Adding…" : "Add customer"}</button>
      </div>
    </form>
  );
}
