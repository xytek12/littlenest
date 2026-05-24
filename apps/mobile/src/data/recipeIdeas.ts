export type CuratedRecipeIdea = {
  id: string;
  title: string;
  summary: string;
  tag: string;
  imageUrl: string;
  source: { title: string; url: string };
};

const recipeIdeas: CuratedRecipeIdea[] = [
  {
    id: 'avocado-banana',
    title: 'Avocado + banana mash',
    summary: 'Soft first texture, healthy fats, and easy spoon feeding.',
    tag: '8 months',
    imageUrl:
      'https://images.unsplash.com/photo-1603046891744-76e6300f89ea?auto=format&fit=crop&w=1200&q=80',
    source: {
      title: 'Healthy Little Foodies',
      url: 'https://www.healthylittlefoodies.com/banana-avocado-baby-puree/',
    },
  },
  {
    id: 'oatmeal-berries',
    title: 'Apple oat pancakes',
    summary: 'Soft oat pancakes with fruit flavor for older babies.',
    tag: 'Iron-rich',
    imageUrl:
      'https://images.unsplash.com/photo-1517673400267-0251440c45dc?auto=format&fit=crop&w=1200&q=80',
    source: {
      title: 'Healthy Little Foodies',
      url: 'https://www.healthylittlefoodies.com/apple-oat-pancakes/',
    },
  },
  {
    id: 'sweet-potato-chicken',
    title: 'Sweet potato + chicken',
    summary: 'Protein, gentle texture, and a strong lunch option.',
    tag: '12 months',
    imageUrl:
      'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=80',
    source: {
      title: 'Baby Foode',
      url: 'https://babyfoode.com/blog/chicken-sweet-potato-baby-food-puree/',
    },
  },
  {
    id: 'salmon-patties',
    title: 'Soft salmon patties',
    summary: 'Omega-3 fats with finger-food practice for older babies.',
    tag: 'Finger food',
    imageUrl:
      'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=1200&q=80',
    source: {
      title: 'MJ and Hungryman',
      url: 'https://www.mjandhungryman.com/salmon-patties-for-babies/',
    },
  },
];

export function getDailyRecipeIdeas(date = new Date()) {
  const dayKey = Number(date.toISOString().slice(8, 10)) || 1;
  const startIndex = dayKey % recipeIdeas.length;

  return [0, 1, 2].map((offset) => recipeIdeas[(startIndex + offset) % recipeIdeas.length]);
}
