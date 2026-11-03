import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import hero from "@/assets/hero-brownie.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Brownie Duguga | Brownies no atacado para empresas" },
      { name: "description", content: "Fábrica de brownies com cacau de verdade. Venda Brownie Duguga no seu estabelecimento. Atendimento exclusivo para CNPJ com pedido mínimo." },
      { property: "og:title", content: "Brownie Duguga | Brownies no atacado" },
      { property: "og:description", content: "Revenda Brownie Duguga no seu mercadinho, conveniência, lanchonete ou farmácia." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const schema = z.object({
  nome: z.string().trim().min(2, "Informe seu nome").max(120),
  whatsapp: z.string().trim().refine((v) => { const d = v.replace(/\D/g, ""); return d.length >= 10 && d.length <= 13; }, "WhatsApp com DDD inválido"),
  email: z.string().trim().email("E-mail inválido").max(255),
  cidade: z.string().trim().min(2, "Informe a cidade").max(120),
  documento: z.string().trim().refine((v) => [11, 14].includes(v.replace(/\D/g, "").length), "CNPJ ou CPF inválido"),
});
type Form = z.infer<typeof schema>;
const empty: Form = { nome: "", whatsapp: "", email: "", cidade: "", documento: "" };

function maskPhone(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}
function maskDoc(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 14);
  if (d.length <= 11)
    return d.replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  return d.replace(/^(\d{2})(\d)/, "$1.$2").replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3").replace(/\.(\d{3})(\d)/, ".$1/$2").replace(/(\d{4})(\d)/, "$1-$2");
}

function LeadForm() {
  const [form, setForm] = useState<Form>(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "error">("idle");

  const set = (k: keyof Form, v: string) => setForm((f) => ({ ...f, [k]: k === "whatsapp" ? maskPhone(v) : k === "documento" ? maskDoc(v) : v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const r = schema.safeParse(form);
    if (!r.success) {
      const errs: typeof errors = {};
      r.error.issues.forEach((i) => (errs[i.path[0] as keyof Form] = i.message));
      setErrors(errs);
      return;
    }
    setErrors({});
    setStatus("sending");
    const { error } = await supabase.from("leads").insert(r.data);
    setStatus(error ? "error" : "ok");
    if (!error) setForm(empty);
  }

  if (status === "ok")
    return (
      <div className="rounded-2xl bg-card p-8 text-center shadow-2xl">
        <p className="font-display text-3xl text-primary">Recebemos seu cadastro!</p>
        <p className="mt-3 text-muted-foreground">Nossa equipe comercial vai entrar em contato pelo WhatsApp em breve.</p>
        <button onClick={() => setStatus("idle")} className="mt-6 text-sm font-semibold text-primary underline">Enviar outro cadastro</button>
      </div>
    );

  const fields: { k: keyof Form; label: string; type?: string; ph: string }[] = [
    { k: "nome", label: "Nome", ph: "Seu nome completo" },
    { k: "whatsapp", label: "WhatsApp (com DDD)", type: "tel", ph: "(81) 99999-9999" },
    { k: "email", label: "E-mail", type: "email", ph: "voce@empresa.com.br" },
    { k: "cidade", label: "Cidade", ph: "Ex.: Recife - PE" },
    { k: "documento", label: "CNPJ / CPF", ph: "00.000.000/0000-00" },
  ];

  return (
    <form onSubmit={submit} className="rounded-2xl bg-card p-6 shadow-2xl md:p-8" noValidate>
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">Seja um revendedor</p>
      <h2 className="mt-2 font-display text-2xl text-card-foreground md:text-3xl">Solicite a tabela de atacado</h2>
      <div className="mt-6 grid gap-4">
        {fields.map((f) => (
          <label key={f.k} className="block">
            <span className="text-sm font-semibold text-card-foreground">{f.label}</span>
            <input
              type={f.type ?? "text"}
              value={form[f.k]}
              onChange={(e) => set(f.k, e.target.value)}
              placeholder={f.ph}
              className="mt-1 w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30"
            />
            {errors[f.k] && <span className="mt-1 block text-xs text-destructive">{errors[f.k]}</span>}
          </label>
        ))}
      </div>
      <button disabled={status === "sending"} className="mt-6 w-full rounded-lg bg-primary py-4 font-bold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60">
        {status === "sending" ? "Enviando..." : "Quero revender Brownie Duguga"}
      </button>
      {status === "error" && <p className="mt-3 text-center text-sm text-destructive">Não foi possível enviar. Tente novamente.</p>}
      <p className="mt-4 text-center text-xs text-muted-foreground">Atendimento exclusivo para empresas · Pedido mínimo</p>
    </form>
  );
}

function Index() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <section className="relative overflow-hidden bg-cocoa text-cocoa-foreground">
        <img src={hero} alt="Brownies Duguga" width={1280} height={1280} className="absolute inset-0 h-full w-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-r from-cocoa via-cocoa/85 to-cocoa/30" />
        <header className="relative mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
          <span className="font-display text-2xl font-bold">Brownie <span className="text-accent">Duguga</span></span>
          <a href="https://www.instagram.com/brownieduguga/" target="_blank" rel="noreferrer" className="text-sm font-semibold opacity-80 hover:opacity-100">@brownieduguga</a>
        </header>
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 pb-20 pt-8 md:grid-cols-2 md:pt-16">
          <div>
            <span className="inline-block rounded-full border border-accent/50 px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] text-accent">Fábrica · Venda para CNPJ</span>
            <h1 className="mt-6 font-display text-5xl leading-[1.05] md:text-7xl">O brownie que <em className="text-accent">vende sozinho</em> no seu balcão.</h1>
            <p className="mt-6 max-w-md text-lg opacity-80">Cacau de verdade, recheio Duguga e padrão de qualidade em cada unidade. Leve para o seu estabelecimento com condições de atacado.</p>
            <div className="mt-8 flex gap-8 text-sm">
              <div><p className="font-display text-3xl text-accent">100%</p><p className="opacity-70">cacau de verdade</p></div>
              <div><p className="font-display text-3xl text-accent">B2B</p><p className="opacity-70">preço de fábrica</p></div>
            </div>
          </div>
          <LeadForm />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-24">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">Como funciona</p>
        <h2 className="mt-3 max-w-2xl font-display text-4xl md:text-5xl">Somos fábrica. Você revende, a gente garante a qualidade.</h2>
        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {[
            ["01", "Cadastre sua empresa", "Preencha o formulário com seu CNPJ e receba nossa tabela de atacado."],
            ["02", "Faça seu pedido mínimo", "Escolha os sabores e quantidades ideais para o seu ponto de venda."],
            ["03", "Venda e lucre", "Brownies embalados individualmente, prontos para a vitrine."],
          ].map(([n, t, d]) => (
            <div key={n} className="border-t-2 border-primary pt-6">
              <p className="font-display text-5xl text-accent">{n}</p>
              <h3 className="mt-4 text-xl font-bold">{t}</h3>
              <p className="mt-2 text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-secondary py-24">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="font-display text-4xl md:text-5xl">Ideal para</h2>
          <div className="mt-10 flex flex-wrap gap-3">
            {["Mercadinhos", "Mercearias", "Lojas de conveniência", "Lanchonetes", "Farmácias", "Padarias", "Cafeterias", "Empórios"].map((x) => (
              <span key={x} className="rounded-full bg-card px-6 py-3 font-semibold text-secondary-foreground shadow-sm">{x}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-24 text-center">
        <h2 className="font-display text-4xl md:text-6xl">Pronto para ter Duguga na sua vitrine?</h2>
        <a href="#top" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="mt-10 inline-block rounded-lg bg-primary px-10 py-4 font-bold text-primary-foreground hover:bg-primary/90">Quero ser revendedor</a>
      </section>

      <footer className="bg-cocoa py-10 text-center text-sm text-cocoa-foreground/70">
        <p className="font-display text-xl text-cocoa-foreground">Brownie Duguga</p>
        <p className="mt-2">Fábrica em Paulista - PE · Vendas exclusivas para empresas</p>
      </footer>
    </div>
  );
}
