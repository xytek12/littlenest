create schema if not exists private;

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth, private
as $$
begin
  insert into public.profiles (id, email, is_admin)
  values (new.id, coalesce(new.email, ''), false)
  on conflict (id) do update
  set email = excluded.email;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function private.handle_new_user();

create index children_owner_id_idx on public.children(owner_id);
create index growth_entries_owner_id_idx on public.growth_entries(owner_id);
create index tracking_logs_owner_id_idx on public.tracking_logs(owner_id);
create index food_tests_owner_id_idx on public.food_tests(owner_id);
create index ai_requests_family_id_idx on public.ai_requests(family_id);
create index ai_requests_child_id_idx on public.ai_requests(child_id);
create index ai_responses_owner_id_idx on public.ai_responses(owner_id);
create index ai_feedback_owner_id_idx on public.ai_feedback(owner_id);
create index local_reminder_settings_family_id_idx on public.local_reminder_settings(family_id);
create index local_reminder_settings_child_id_idx on public.local_reminder_settings(child_id);
create index local_reminder_settings_owner_id_idx on public.local_reminder_settings(owner_id);
