CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $func$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, role, is_active)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    CASE WHEN NEW.email IN ('alexandre.letendre@radio-canada.ca', 'letendralex@gmail.com') THEN 'manager' ELSE 'staff' END,
    CASE WHEN NEW.email IN ('alexandre.letendre@radio-canada.ca', 'letendralex@gmail.com') THEN true ELSE false END
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$func$;

UPDATE public.profiles
SET role = 'manager', is_active = true
WHERE email = 'letendralex@gmail.com';
