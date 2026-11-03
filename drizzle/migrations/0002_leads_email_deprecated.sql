ALTER TABLE public.leads ALTER COLUMN email SET DEFAULT '';
DROP POLICY "Anyone can submit lead" ON public.leads;
CREATE POLICY "Anyone can submit lead" ON public.leads FOR INSERT TO anon, authenticated WITH CHECK (
  char_length(nome) BETWEEN 2 AND 120 AND char_length(whatsapp) BETWEEN 10 AND 20
  AND (email = '' OR char_length(email) BETWEEN 5 AND 255) AND char_length(cidade) BETWEEN 2 AND 120
  AND char_length(documento) BETWEEN 11 AND 18
);
COMMENT ON COLUMN public.leads.email IS 'DEPRECATED: no longer collected by the lead form; kept for historical rows';