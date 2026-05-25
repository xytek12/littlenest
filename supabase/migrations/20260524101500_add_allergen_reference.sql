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
  ('eggs', 'egg', 'Egg', 10, 'FDA', 'https://www.fda.gov/food/food-labeling-nutrition/food-allergies'),
  ('dairy', 'milk', 'Milk', 20, 'FDA', 'https://www.fda.gov/food/food-labeling-nutrition/food-allergies'),
  ('dairy', 'yogurt', 'Yogurt', 30, 'FDA', 'https://www.fda.gov/food/food-labeling-nutrition/food-allergies'),
  ('dairy', 'cheese', 'Cheese', 40, 'FDA', 'https://www.fda.gov/food/food-labeling-nutrition/food-allergies'),
  ('wheat', 'wheat-cereal', 'Wheat cereal', 50, 'FDA', 'https://www.fda.gov/food/food-labeling-nutrition/food-allergies'),
  ('wheat', 'pasta', 'Pasta', 60, 'FDA', 'https://www.fda.gov/food/food-labeling-nutrition/food-allergies'),
  ('soy', 'tofu', 'Tofu', 70, 'FDA', 'https://www.fda.gov/food/food-labeling-nutrition/food-allergies'),
  ('soy', 'soy-yogurt', 'Soy yogurt', 80, 'FDA', 'https://www.fda.gov/food/food-labeling-nutrition/food-allergies'),
  ('sesame', 'tahini', 'Tahini', 90, 'FDA', 'https://www.fda.gov/food/food-labeling-nutrition/food-allergies'),
  ('sesame', 'sesame-seed', 'Sesame seed', 100, 'FDA', 'https://www.fda.gov/food/food-labeling-nutrition/food-allergies'),
  ('nuts', 'peanut', 'Peanut', 110, 'FDA', 'https://www.fda.gov/food/food-labeling-nutrition/food-allergies'),
  ('nuts', 'almond', 'Almond', 120, 'FDA', 'https://www.fda.gov/food/food-labeling-nutrition/food-allergies'),
  ('nuts', 'cashew', 'Cashew', 130, 'FDA', 'https://www.fda.gov/food/food-labeling-nutrition/food-allergies'),
  ('nuts', 'hazelnut', 'Hazelnut', 140, 'FDA', 'https://www.fda.gov/food/food-labeling-nutrition/food-allergies'),
  ('nuts', 'pecan', 'Pecan', 150, 'FDA', 'https://www.fda.gov/food/food-labeling-nutrition/food-allergies'),
  ('nuts', 'pistachio', 'Pistachio', 160, 'FDA', 'https://www.fda.gov/food/food-labeling-nutrition/food-allergies'),
  ('nuts', 'walnut', 'Walnut', 170, 'FDA', 'https://www.fda.gov/food/food-labeling-nutrition/food-allergies'),
  ('fish', 'salmon', 'Salmon', 180, 'FDA', 'https://www.fda.gov/food/food-labeling-nutrition/food-allergies'),
  ('fish', 'cod', 'Cod', 190, 'FDA', 'https://www.fda.gov/food/food-labeling-nutrition/food-allergies'),
  ('fish', 'tuna', 'Tuna', 200, 'FDA', 'https://www.fda.gov/food/food-labeling-nutrition/food-allergies'),
  ('fish', 'trout', 'Trout', 210, 'FDA', 'https://www.fda.gov/food/food-labeling-nutrition/food-allergies'),
  ('shellfish', 'shrimp', 'Shrimp', 220, 'FDA', 'https://www.fda.gov/food/food-labeling-nutrition/food-allergies'),
  ('shellfish', 'crab', 'Crab', 230, 'FDA', 'https://www.fda.gov/food/food-labeling-nutrition/food-allergies'),
  ('shellfish', 'lobster', 'Lobster', 240, 'FDA', 'https://www.fda.gov/food/food-labeling-nutrition/food-allergies'),
  ('shellfish', 'clam', 'Clam', 250, 'FDA', 'https://www.fda.gov/food/food-labeling-nutrition/food-allergies'),
  ('shellfish', 'scallop', 'Scallop', 260, 'FDA', 'https://www.fda.gov/food/food-labeling-nutrition/food-allergies');

grant select on table public.allergen_reference_items to authenticated, service_role;

alter table public.allergen_reference_items enable row level security;

create policy "allergen reference read authenticated"
on public.allergen_reference_items
for select
to authenticated
using (true);

create index allergen_reference_section_order_idx
on public.allergen_reference_items(section, display_order);
