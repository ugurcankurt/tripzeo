-- Update handle_new_user to respect role in metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone, role)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'phone',
    -- Try to cast role from metadata, default to 'user' if null.
    -- Note: If 'role' is present but invalid enum value, this will raise an error, which is good for debugging.
    COALESCE((new.raw_user_meta_data ->> 'role')::user_role, 'user')
  );
  RETURN new;
END;
$$;
