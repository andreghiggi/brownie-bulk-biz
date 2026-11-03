import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { maskDoc, maskPhone, onlyDigits, tipoDocumento } from "@/lib/documento";

const schema = z.object({
  nome: z.string().trim().max(120).refine((v) => v.split(/\s+/).filter(Boolean).length >= 2, "Informe nome e sobrenome"),
  whatsapp: z.string().refine((v) => [10, 11].includes(onlyDigits(v).length), "WhatsApp com DDD inválido"),
  email: z.string().trim().email("E-mail inválido").max(255),
  cidade: z.string().trim().min(2, "Informe a cidade").max(120),
  documento: z.string().refine((v) => tipoDocumento(v) !== null, "CNPJ ou CPF inválido"),
  consentimento: z.boolean().refine((v) => v, "É necessário autorizar o contato"),
});
type FormData = z.infer<typeof schema>;

const WHATSAPP = (import.meta.env['VITE_WHATSAPP_COMERCIAL'] as string | undefined) ?? "";

export function LeadForm() {
  const [done, setDone] = useState<(FormData & { tipo: string }) | null>(null);
  const [serverError, setServerError] = useState("");
  const { register, handleSubmit, setValue, watch, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { nome: "", whatsapp: "", email: "", cidade: "", documento: "", consentimento: false },
  });
  const doc = watch("documento");
  const tipo = tipoDocumento(doc ?? "");

  async function onSubmit(data: FormData) {
    setServerError("");
    const t = tipoDocumento(data.documento)!;
    const { error } = await supabase.from("leads").insert({
      nome: data.nome.trim(),
      whatsapp: data.whatsapp,
      email: data.email.trim(),
      cidade: data.cidade.trim(),
      documento: onlyDigits(data.documento),
      tipo_documento: t,
      consentimento: data.consentimento,
    });
    if (error) {
      setServerError(error.message.includes("DUPLICATE_24H")
        ? "Já recebemos um cadastro com este documento nas últimas 24h. Nossa equipe entrará em contato."
        : "Não foi possível enviar. Tente novamente.");
      return;
    }
    setDone({ ...data, tipo: t });
    reset();
  }

  if (done) {
    const text = `Olá! Quero revender Brownie Duguga.\nNome: ${done.nome}\nWhatsApp: ${done.whatsapp}\nE-mail: ${done.email}\nCidade: ${done.cidade}\n${done.tipo}: ${done.documento}`;
    return (
      <div className="rounded-3xl bg-card p-7 text-card-foreground shadow-2xl md:p-9">
        <p className="font-mono text-xs uppercase tracking-widest text-accent">Cadastro recebido</p>
        <h2 className="mt-2 font-display text-3xl font-extrabold">Obrigado, {done.nome.split(" ")[0]}!</h2>
        <p className="mt-2 text-muted-foreground">Nossa equipe comercial vai falar com você em breve.</p>
        <dl className="mt-6 grid gap-2 rounded-2xl bg-muted p-5 text-sm">
          {[["WhatsApp", done.whatsapp], ["E-mail", done.email], ["Cidade", done.cidade], [done.tipo, done.documento]].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4"><dt className="text-muted-foreground">{k}</dt><dd className="font-semibold">{v}</dd></div>
          ))}
        </dl>
        {WHATSAPP && (
          <a href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`} target="_blank" rel="noreferrer"
            className="mt-6 block rounded-xl bg-primary py-4 text-center font-bold text-primary-foreground hover:bg-primary/90">
            Agilizar pelo WhatsApp
          </a>
        )}
        <button onClick={() => setDone(null)} className="mt-4 w-full text-sm font-semibold text-muted-foreground underline">Enviar outro cadastro</button>
      </div>
    );
  }

  const input = "mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30";
  const Err = ({ m }: { m?: string | undefined }) => (m ? <span className="mt-1 block text-xs text-destructive">{m}</span> : null);

  return (
    <form id="cadastro" onSubmit={handleSubmit(onSubmit)} noValidate className="scroll-mt-28 rounded-3xl bg-card p-6 text-card-foreground shadow-2xl md:p-8">
      <p className="font-mono text-xs uppercase tracking-widest text-accent">Cadastro de revendedor</p>
      <h2 className="mt-2 font-display text-2xl font-extrabold md:text-3xl">Receba a tabela de atacado</h2>
      <div className="mt-6 grid gap-4">
        <label><span className="text-sm font-semibold">Nome e sobrenome</span>
          <input {...register("nome")} placeholder="Maria Silva" className={input} autoComplete="name" /><Err m={errors.nome?.message} /></label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label><span className="text-sm font-semibold">WhatsApp com DDD</span>
            <input {...register("whatsapp")} onChange={(e) => setValue("whatsapp", maskPhone(e.target.value), { shouldValidate: !!errors.whatsapp })} type="tel" placeholder="(54) 99999-9999" className={input} /><Err m={errors.whatsapp?.message} /></label>
          <label><span className="text-sm font-semibold">Cidade</span>
            <input {...register("cidade")} placeholder="Sua cidade" className={input} /><Err m={errors.cidade?.message} /></label>
        </div>
        <label><span className="text-sm font-semibold">E-mail</span>
          <input {...register("email")} type="email" placeholder="voce@empresa.com.br" className={input} autoComplete="email" /><Err m={errors.email?.message} /></label>
        <label><span className="flex justify-between text-sm font-semibold">CNPJ / CPF
          {tipo && <span className="font-mono text-xs text-success">✓ {tipo} válido</span>}</span>
          <input {...register("documento")} onChange={(e) => setValue("documento", maskDoc(e.target.value), { shouldValidate: !!errors.documento })} inputMode="numeric" placeholder="00.000.000/0000-00" className={input} /><Err m={errors.documento?.message} /></label>
        <label className="flex items-start gap-3 text-sm text-muted-foreground">
          <input type="checkbox" {...register("consentimento")} className="mt-1 h-4 w-4 accent-primary" />
          <span>Autorizo a Brownie Duguga a entrar em contato por WhatsApp e e-mail, conforme a LGPD.</span>
        </label>
        <Err m={errors.consentimento?.message} />
      </div>
      <button disabled={isSubmitting} className="mt-6 w-full rounded-xl bg-primary py-4 font-bold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60">
        {isSubmitting ? "Enviando..." : "Quero revender Brownie Duguga"}
      </button>
      {serverError && <p className="mt-3 text-center text-sm text-destructive">{serverError}</p>}
    </form>
  );
}
