import {
  allergenReferenceItems,
  type AllergenReferenceItem,
} from '../data/allergenReference';
import { hasSupabaseEnv, supabase } from './supabase';

type AllergenSectionKey =
  | 'eggs'
  | 'dairy'
  | 'wheat'
  | 'soy'
  | 'sesame'
  | 'nuts'
  | 'fish'
  | 'shellfish';

const sectionLabels: Record<AllergenSectionKey, AllergenReferenceItem['section']> = {
  eggs: 'Eggs',
  dairy: 'Milk / Dairy',
  wheat: 'Wheat',
  soy: 'Soy',
  sesame: 'Sesame',
  nuts: 'Peanut & Tree Nuts',
  fish: 'Fish',
  shellfish: 'Shellfish',
};

export async function fetchAllergenReferenceItems(): Promise<AllergenReferenceItem[]> {
  if (!hasSupabaseEnv()) {
    return allergenReferenceItems;
  }

  const { data, error } = await supabase
    .from('allergen_reference_items')
    .select('id, section, item_slug, display_name, source_label, source_url, display_order')
    .order('display_order', { ascending: true });

  if (error || !data?.length) {
    return allergenReferenceItems;
  }

  return data.map((item) => ({
    id: item.item_slug ?? item.id,
    section: sectionLabels[item.section as AllergenSectionKey] ?? 'Peanut & Tree Nuts',
    name: item.display_name,
    testedCount: 0,
    sourceLabel: item.source_label,
    sourceUrl: item.source_url,
  }));
}
