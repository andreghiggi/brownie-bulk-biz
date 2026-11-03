import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({ meta: [{ title: "Admin | Brownie Duguga" }, { name: "robots", content: "noindex" }] }),
  component: Admin,
});

type Lead = Tables<"leads">;

function Login() {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    const { error, data } = mode === "in"
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/admin` } });
    if (error) setMsg(error.message);
    else if (mode === "up" && !data.session) setMsg("Confirme seu e-mail para entrar.");
  }
  return (
    <form onSubmit={submit} className="mx-auto mt-24 max-w-sm rounded-2xl bg-card p-8 shadow-xl">
      <h1 className="font-display text-2xl font-extrabold">{mode === "in" ? "Entrar no painel" : "Criar conta"}</h1>
      <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-mail" className="mt-6 w-full rounded-xl border border-input bg-background px-4 py-3" />
      <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Senha" className="mt-3 w-full rounded-xl border border-input bg-background px-4 py-3" />
      <button className="mt-5 w-full rounded-xl bg-primary py-3 font-bold text-primary-foreground">{mode === "in" ? "Entrar" : "Criar conta"}</button>
      {msg && <p className="mt-3 text-sm text-muted-foreground">{msg}</p>}
      <button type="button" onClick={() => setMode(mode === "in" ? "up" : "in")} className="mt-4 w-full text-sm underline">
        {mode === "in" ? "Primeiro acesso? Criar conta" : "Já tenho conta"}
      </button>
    </form>
  );
}

function Admin() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [q, setQ] = useState("");
  const [cidade, setCidade] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return;
    (async () => {
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", session.user.id);
      const ok = !!roles?.some((r) => r.role === "admin");
      setIsAdmin(ok);
      if (ok) {
        const { data } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
        setLeads(data ?? []);
      }
    })();
  }, [session]);

  const cidades = useMemo(() => [...new Set(leads.map((l) => l.cidade))].sort(), [leads]);
  const filtered = leads.filter((l) =>
    (!cidade || l.cidade === cidade) &&
    (!q || [l.nome, l.email, l.whatsapp, l.documento].some((v) => v.toLowerCase().includes(q.toLowerCase()))));

  function exportCsv() {
    const cols = ["created_at", "nome", "whatsapp", "email", "cidade", "tipo_documento", "documento", "consentimento"] as const;
    const esc = (v: unknown) => `"${String(v).replace(/"/g, '""')}"`;
    const csv = [cols.join(","), ...filtered.map((l) => cols.map((c) => esc(l[c])).join(","))].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob(["\ufeff" + csv], { type: "text/csv" }));
    a.download = "leads-duguga.csv";
    a.click();
  }

  if (session === undefined) return null;
  if (!session) return <div className="min-h-screen bg-background px-4"><Login /></div>;

  return (
    <div className="min-h-screen bg-background px-6 py-10 font-sans">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="font-display text-3xl font-extrabold">Leads <span className="text-accent">({filtered.length})</span></h1>
          <button onClick={() => supabase.auth.signOut()} className="text-sm underline">Sair</button>
        </div>
        {isAdmin === false ? (
          <p className="mt-8 text-muted-foreground">Sua conta não tem acesso de administrador.</p>
        ) : (
          <>
            <div className="mt-6 flex flex-wrap gap-3">
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar nome, e-mail, WhatsApp, documento" className="min-w-64 flex-1 rounded-xl border border-input bg-card px-4 py-2" />
              <select value={cidade} onChange={(e) => setCidade(e.target.value)} className="rounded-xl border border-input bg-card px-4 py-2">
                <option value="">Todas as cidades</option>
                {cidades.map((c) => <option key={c}>{c}</option>)}
              </select>
              <button onClick={exportCsv} className="rounded-xl bg-primary px-5 py-2 font-bold text-primary-foreground">Exportar CSV</button>
            </div>
            <div className="mt-6 overflow-x-auto rounded-2xl border border-border bg-card">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted font-mono text-xs uppercase"><tr>{["Data", "Nome", "WhatsApp", "E-mail", "Cidade", "Documento"].map((h) => <th key={h} className="px-4 py-3">{h}</th>)}</tr></thead>
                <tbody>
                  {filtered.map((l) => (
                    <tr key={l.id} className="border-t border-border">
                      <td className="px-4 py-3 whitespace-nowrap">{new Date(l.created_at).toLocaleString("pt-BR")}</td>
                      <td className="px-4 py-3">{l.nome}</td><td className="px-4 py-3">{l.whatsapp}</td>
                      <td className="px-4 py-3">{l.email}</td><td className="px-4 py-3">{l.cidade}</td>
                      <td className="px-4 py-3 font-mono">{l.tipo_documento} {l.documento}</td>
                    </tr>
                  ))}
                  {!filtered.length && <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">Nenhum lead encontrado.</td></tr>}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
