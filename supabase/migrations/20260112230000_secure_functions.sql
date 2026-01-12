-- Secure functions by setting explicit search_path
-- Fixes "Function Search Path Mutable" warnings

ALTER FUNCTION public.generate_unique_referral_code() SET search_path = public;
ALTER FUNCTION public.set_referral_code() SET search_path = public;
