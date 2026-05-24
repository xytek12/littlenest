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
  dairy: 'Dairy',
  wheat: 'Wheat',
  soy: 'Soy',
  sesame: 'Sesame',
  nuts: 'Nuts',
  fish: 'Fish',
  shellfish: 'Shellfish',
};

export async function fetchAllergenReferenceItems(): Promise<AllergenReferenceItem[]> {
  if (!hasSupabaseEnv()) {
    return allergenReferenceItems;
  }

  const { data, error } = await supabase
    .from('allergen_reference_items')
    .select('id, section, display_name, source_label, source_url')
    .order('section', { ascending: true })
    .order('display_order', { ascending: true });

  if (error || !data?.length) {
    return allergenReferenceItems;
  }

  return data.map((item) => ({
    id: item.id,
    section: sectionLabels[item.section as AllergenSectionKey] ?? 'Nuts',
    name: item.display_name,
    testedCount: 0,
    sourceLabel: item.source_label,
    sourceUrl: item.source_url,
  }));
}
