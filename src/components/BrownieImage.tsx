type Props = { src?: string; alt: string; tone?: "dark" | "caramel" | "white" | "red"; className?: string };

/** Mostra a foto real quando `src` for informado; senão, uma ilustração de brownie em CSS. */
export function BrownieImage({ src, alt, tone = "dark", className = "" }: Props) {
  if (src) return <img src={src} alt={alt} loading="lazy" className={`h-full w-full object-cover ${className}`} />;
  const top = { dark: "bg-cocoa", caramel: "bg-accent", white: "bg-cream", red: "bg-berry" }[tone];
  return (
    <div role="img" aria-label={alt} className={`relative flex h-full w-full items-center justify-center bg-secondary ${className}`}>
      <div className="relative h-24 w-32 rotate-[-6deg] rounded-xl bg-primary shadow-xl">
        <div className={`absolute inset-x-0 top-0 h-6 rounded-t-xl ${top}`} />
        <div className="absolute inset-x-4 top-10 h-1 rounded bg-cocoa/40" />
        <div className="absolute inset-x-6 top-14 h-1 rounded bg-cocoa/30" />
      </div>
    </div>
  );
}
