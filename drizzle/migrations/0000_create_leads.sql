CREATE TABLE public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  whatsapp text NOT NULL,
  email text NOT NULL,
  cidade text NOT NULL,
  documento text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.leads TO anon, authenticated;
GRANT ALL ON public.leads TO service_role;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit lead" ON public.leads FOR INSERT TO anon, authenticated WITH CHECK (
  char_length(nome) BETWEEN 2 AND 120 AND char_length(whatsapp) BETWEEN 10 AND 20
  AND char_length(email) BETWEEN 5 AND 255 AND char_length(cidade) BETWEEN 2 AND 120
  AND char_length(documento) BETWEEN 11 AND 18
);