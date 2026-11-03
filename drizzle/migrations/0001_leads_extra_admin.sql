ALTER TABLE public.leads ADD COLUMN tipo_documento text NOT NULL DEFAULT 'CNPJ';
ALTER TABLE public.leads ADD COLUMN consentimento boolean NOT NULL DEFAULT false;
CREATE INDEX leads_documento_idx ON public.leads (documento, created_at DESC);

CREATE OR REPLACE FUNCTION public.leads_block_duplicate()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.leads WHERE documento = NEW.documento AND created_at > now() - interval '24 hours') THEN
    RAISE EXCEPTION 'DUPLICATE_24H';
  END IF;
  IF NEW.tipo_documento NOT IN ('CNPJ','CPF') THEN RAISE EXCEPTION 'INVALID_TIPO'; END IF;
  IF NOT NEW.consentimento THEN RAISE EXCEPTION 'NO_CONSENT'; END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER leads_block_duplicate BEFORE INSERT ON public.leads FOR EACH ROW EXECUTE FUNCTION public.leads_block_duplicate();

CREATE TYPE public.app_role AS ENUM ('admin');
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

GRANT SELECT ON public.leads TO authenticated;
CREATE POLICY "Admins read leads" ON public.leads FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.first_user_admin()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER on_auth_user_first_admin AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.first_user_admin();