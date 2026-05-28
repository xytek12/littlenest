// Growth is no longer a tab — it lives as a SectionCard on Home with its own
// composer popup. The Growth route is still registered in RootNavigator so
// nested navigation to GrowthHistory continues to work.
export const visibleTabs = ['Recipes', 'Home', 'AI', 'Settings'] as const;
