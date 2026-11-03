import { createFileRoute } from "@tanstack/react-router";
import { LeadForm } from "@/components/LeadForm";
import { BrownieImage } from "@/components/BrownieImage";
import { whatsappLink } from "@/lib/whatsapp";
import { getRequestOrigin } from "@/lib/origin.functions";
import hero from "@/assets/hero-brownie.jpg";

export const Route = createFileRoute("/")({
  loader: async () => ({ origin: await getRequestOrigin() }),
  head: ({ loaderData }) => {
    const desc = "Brownie Duguga | 🤎Feito com cacau 100% | 📍Janga, Paulista - PE | 📦 Envios para todo estado de Pernambuco";
    const img = `${loaderData?.origin ?? ""}/og-brownie.jpg`;
    return {
      meta: [
        { title: "Brownie Duguga | Revenda brownies no seu negócio" },
        { name: "description", content: desc },
        { property: "og:title", content: "Brownie Duguga" },
        { property: "og:description", content: desc },
        { property: "og:type", content: "website" },
        { property: "og:image", content: img },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:image", content: img },
      ],
    };
  },
  component: Index,
});

const nav = [["Para quem", "#segmentos"], ["Produtos", "#produtos"], ["Como funciona", "#como-funciona"], ["Dúvidas", "#duvidas"]];
const segmentos = [
  ["Mercadinhos", "Giro rápido no caixa e na gôndola."],
  ["Lojas de conveniência", "Compra por impulso, margem alta."],
  ["Lanchonetes", "A sobremesa pronta do seu cardápio."],
  ["Cafeterias", "O par perfeito para o café."],
  ["Farmácias", "Item de checkout que vende sozinho."],
  ["Empórios e padarias", "Qualidade que fideliza o cliente."],
];
const produtos: { nome: string; desc: string; tone: "dark" | "caramel" | "white" | "red" }[] = [
  { nome: "Tradicional", desc: "Cacau intenso, casquinha crocante e miolo úmido.", tone: "dark" },
  { nome: "Doce de leite", desc: "Recheio cremoso de doce de leite.", tone: "caramel" },
  { nome: "Ninho", desc: "Cobertura cremosa de leite Ninho.", tone: "white" },
  { nome: "Frutas vermelhas", desc: "Toque ácido que equilibra o chocolate.", tone: "red" },
];
const passos = [
  ["Cadastre seu CNPJ", "Preencha o formulário e receba a tabela de atacado."],
  ["Fale com o comercial", "Tiramos dúvidas e montamos o mix ideal."],
  ["Faça o pedido mínimo", "Escolha sabores e quantidades por lote."],
  ["Receba e venda", "Embalados individualmente, prontos para a vitrine."],
];
const faq = [
  ["Vocês vendem para pessoa física?", "Não. Atendemos exclusivamente empresas com CNPJ, com pedido mínimo por lote."],
  ["Qual é o pedido mínimo?", "O pedido mínimo é informado pela nossa equipe comercial junto com a tabela de atacado."],
  ["Os brownies vêm embalados?", "Sim, cada unidade vem embalada individualmente, pronta para revenda."],
  ["Como faço para começar?", "Preencha o cadastro no topo da página. Nossa equipe entra em contato pelo WhatsApp."],
];

function Index() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-cocoa-foreground/10 bg-cocoa/90 text-cocoa-foreground backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <a href="#" className="font-display text-2xl font-extrabold tracking-tight">Brownie<span className="text-accent"> Duguga</span></a>
          <nav className="hidden gap-8 text-sm font-medium md:flex">
            {nav.map(([l, h]) => <a key={h} href={h} className="opacity-80 hover:opacity-100">{l}</a>)}
          </nav>
          <a href="#cadastro" className="rounded-full bg-accent px-5 py-2 text-sm font-bold text-accent-foreground hover:bg-accent/90">Quero revender</a>
        </div>
      </header>

      <section className="relative overflow-hidden bg-cocoa pt-24 text-cocoa-foreground">
        <img src={hero} alt="" width={1280} height={1280} className="absolute inset-0 h-full w-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-r from-cocoa via-cocoa/90 to-cocoa/40" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 py-16 md:grid-cols-[1.1fr_1fr] md:py-24">
          <div>
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-accent">Fábrica · Atacado para CNPJ</span>
            <h1 className="mt-5 font-display text-5xl font-extrabold leading-[0.98] tracking-tight md:text-7xl">O brownie que <span className="text-accent">vende sozinho</span> no seu balcão.</h1>
            <p className="mt-6 max-w-md text-lg opacity-80">Cacau de verdade, recheio Duguga e padrão de qualidade em cada unidade. Leve para o seu estabelecimento com preço de fábrica.</p>
            <div className="mt-10 flex gap-10">
              {[["100%", "cacau de verdade"], ["B2B", "preço de fábrica"], ["1 a 1", "embalagem individual"]].map(([n, l]) => (
                <div key={l}><p className="font-display text-3xl font-extrabold text-accent">{n}</p><p className="text-sm opacity-70">{l}</p></div>
              ))}
            </div>
          </div>
          <LeadForm />
        </div>
      </section>

      <div className="overflow-hidden bg-accent py-4 text-accent-foreground">
        <p className="text-center font-mono text-sm font-medium uppercase tracking-widest">Somente pessoa jurídica • Pedido mínimo por lote • Produção artesanal em escala</p>
      </div>

      <section id="segmentos" className="mx-auto max-w-6xl scroll-mt-24 px-6 py-24">
        <p className="font-mono text-xs uppercase tracking-widest text-accent">Para quem vendemos</p>
        <h2 className="mt-3 max-w-2xl font-display text-4xl font-extrabold md:text-5xl">Feito para quem vende.</h2>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {segmentos.map(([t, d]) => (
            <div key={t} className="rounded-2xl border border-border bg-card p-6 transition hover:-translate-y-1 hover:shadow-lg">
              <h3 className="font-display text-xl font-bold">{t}</h3><p className="mt-2 text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="produtos" className="scroll-mt-24 bg-secondary py-24">
        <div className="mx-auto max-w-6xl px-6">
          <p className="font-mono text-xs uppercase tracking-widest text-accent">Linha de produtos</p>
          <h2 className="mt-3 font-display text-4xl font-extrabold md:text-5xl">Quatro sabores. Zero encalhe.</h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {produtos.map((p) => (
              <article key={p.nome} className="overflow-hidden rounded-2xl bg-card shadow-sm">
                <div className="aspect-square"><BrownieImage alt={`Brownie ${p.nome}`} tone={p.tone} /></div>
                <div className="p-5"><h3 className="font-display text-xl font-bold">{p.nome}</h3><p className="mt-1 text-sm text-muted-foreground">{p.desc}</p></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="como-funciona" className="mx-auto max-w-6xl scroll-mt-24 px-6 py-24">
        <p className="font-mono text-xs uppercase tracking-widest text-accent">Como funciona</p>
        <h2 className="mt-3 max-w-2xl font-display text-4xl font-extrabold md:text-5xl">Somos fábrica. Você revende.</h2>
        <div className="mt-12 grid gap-8 md:grid-cols-4">
          {passos.map(([t, d], i) => (
            <div key={t} className="border-t-2 border-primary pt-6">
              <p className="font-mono text-sm text-accent">0{i + 1}</p>
              <h3 className="mt-3 font-display text-xl font-bold">{t}</h3><p className="mt-2 text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-cocoa py-24 text-cocoa-foreground">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 md:grid-cols-2">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-accent">Diferenciais</p>
            <h2 className="mt-3 font-display text-4xl font-extrabold md:text-5xl">Qualidade de confeitaria, escala de fábrica.</h2>
            <ul className="mt-8 grid gap-4">
              {["Cacau de verdade, sem atalhos", "Padrão idêntico em cada unidade", "Embalagem individual com validade", "Atendimento comercial dedicado"].map((x) => (
                <li key={x} className="flex gap-3"><span className="text-accent">●</span>{x}</li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col justify-center rounded-3xl bg-accent p-10 text-accent-foreground">
            <h3 className="font-display text-3xl font-extrabold">Tenha Duguga na sua vitrine.</h3>
            <p className="mt-3 opacity-80">Cadastre seu CNPJ e receba a tabela de atacado.</p>
            <a href="#cadastro" className="mt-8 inline-block self-start rounded-xl bg-cocoa px-8 py-4 font-bold text-cocoa-foreground">Quero revender</a>
          </div>
        </div>
      </section>

      <section id="duvidas" className="mx-auto max-w-3xl scroll-mt-24 px-6 py-24">
        <p className="font-mono text-xs uppercase tracking-widest text-accent">Dúvidas frequentes</p>
        <h2 className="mt-3 font-display text-4xl font-extrabold">Perguntas comuns</h2>
        <div className="mt-10 divide-y divide-border border-y border-border">
          {faq.map(([q, a]) => (
            <details key={q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between font-display text-lg font-bold">{q}<span className="text-accent transition group-open:rotate-45">+</span></summary>
              <p className="mt-3 text-muted-foreground">{a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="bg-secondary py-20 text-center">
        <h2 className="mx-auto max-w-3xl px-6 font-display text-4xl font-extrabold md:text-6xl">Pronto para vender o brownie que todo mundo pede?</h2>
        <a href="#cadastro" className="mt-10 inline-block rounded-xl bg-primary px-10 py-4 font-bold text-primary-foreground hover:bg-primary/90">Fazer meu cadastro</a>
      </section>

      <a href={whatsappLink()} target="_blank" rel="noreferrer" aria-label="Falar no WhatsApp"
        className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-success px-5 py-3 font-bold text-primary-foreground shadow-2xl hover:opacity-90">
        WhatsApp
      </a>

      <footer className="bg-cocoa py-10 text-cocoa-foreground">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 text-sm md:flex-row">
          <p className="font-display text-xl font-extrabold">Brownie<span className="text-accent"> Duguga</span></p>
          <p className="opacity-70">Vendas exclusivas para empresas (CNPJ)</p>
          <a href={whatsappLink()} target="_blank" rel="noreferrer" className="font-semibold hover:text-accent">(81) 9603-5471</a>
          <a href="https://www.instagram.com/brownieduguga/" target="_blank" rel="noreferrer" className="font-semibold hover:text-accent">@brownieduguga</a>
        </div>
      </footer>
    </div>
  );
}
