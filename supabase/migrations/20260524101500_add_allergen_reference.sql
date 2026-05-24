create table public.allergen_reference_items (
  id uuid primary key default gen_random_uuid(),
  section text not null check (section in ('eggs', 'dairy', 'wheat', 'soy', 'sesame', 'nuts', 'fish', 'shellfish')),
  item_slug text not null,
  display_name text not null,
  display_order integer not null default 0,
  source_label text not null,
  source_url text not null,
  created_at timestamptz not null default now(),
  unique (section, item_slug)
);

insert into public.allergen_reference_items (section, item_slug, display_name, display_order, source_label, source_url)
values
  ('eggs', 'egg', 'Egg', 10, 'NHS', 'https://www.nhs.uk/baby/weaning-and-feeding/food-allergies-in-babies-and-young-children/'),
  ('dairy', 'yogurt', 'Yogurt', 20, 'NHS', 'https://www.nhs.uk/baby/weaning-and-feeding/food-allergies-in-babies-and-young-children/'),
  ('dairy', 'cheese', 'Cheese', 30, 'NHS', 'https://www.nhs.uk/baby/weaning-and-feeding/food-allergies-in-babies-and-young-children/'),
  ('wheat', 'wheat-cereal', 'Wheat cereal', 40, 'NHS', 'https://www.nhs.uk/baby/weaning-and-feeding/food-allergies-in-babies-and-young-children/'),
  ('soy', 'tofu', 'Tofu', 50, 'NHS', 'https://www.nhs.uk/baby/weaning-and-feeding/food-allergies-in-babies-and-young-children/'),
  ('sesame', 'tahini', 'Tahini', 60, 'NHS', 'https://www.nhs.uk/baby/weaning-and-feeding/food-allergies-in-babies-and-young-children/'),
  ('nuts', 'peanut', 'Peanut', 70, 'HealthyChildren.org', 'https://www.healthychildren.org/English/healthy-living/nutrition/Pages/Starting-Solid-Foods.aspx'),
  ('nuts', 'almond', 'Almond', 80, 'HealthyChildren.org', 'https://www.healthychildren.org/English/healthy-living/nutrition/Pages/Starting-Solid-Foods.aspx'),
  ('nuts', 'cashew', 'Cashew', 90, 'HealthyChildren.org', 'https://www.healthychildren.org/English/healthy-living/nutrition/Pages/Starting-Solid-Foods.aspx'),
  ('nuts', 'walnut', 'Walnut', 100, 'HealthyChildren.org', 'https://www.healthychildren.org/English/healthy-living/nutrition/Pages/Starting-Solid-Foods.aspx'),
  ('fish', 'salmon', 'Salmon', 110, 'HealthyChildren.org', 'https://www.healthychildren.org/English/healthy-living/nutrition/Pages/Starting-Solid-Foods.aspx'),
  ('fish', 'cod', 'Cod', 120, 'HealthyChildren.org', 'https://www.healthychildren.org/English/healthy-living/nutrition/Pages/Starting-Solid-Foods.aspx'),
  ('fish', 'sardine', 'Sardine', 130, 'HealthyChildren.org', 'https://www.healthychildren.org/English/healthy-living/nutrition/Pages/Starting-Solid-Foods.aspx'),
  ('shellfish', 'shrimp', 'Shrimp', 140, 'NHS', 'https://www.nhs.uk/baby/weaning-and-feeding/food-allergies-in-babies-and-young-children/'),
  ('shellfish', 'crab', 'Crab', 150, 'NHS', 'https://www.nhs.uk/baby/weaning-and-feeding/food-allergies-in-babies-and-young-children/'),
  ('shellfish', 'lobster', 'Lobster', 160, 'NHS', 'https://www.nhs.uk/baby/weaning-and-feeding/food-allergies-in-babies-and-young-children/');

grant select on table public.allergen_reference_items to authenticated, service_role;

alter table public.allergen_reference_items enable row level security;

create policy "allergen reference read authenticated"
on public.allergen_reference_items
for select
to authenticated
using (true);

create index allergen_reference_section_order_idx
on public.allergen_reference_items(section, display_order);
