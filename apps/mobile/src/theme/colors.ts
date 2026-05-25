// Legacy colour tokens. Prefer importing from `../theme` for new code —
// these remain so existing screens keep compiling while we re-skin.
// The values were re-pointed to the soft pastel watercolor palette so any
// remaining hard-coded uses already pick up the new mixed-theme look.
export const colors = {
  blue: '#7FA6C9',
  blueSoft: '#CFE0EE',
  pink: '#E8A6A0',
  pinkSoft: '#F6D9D2',
  white: '#FFFCF7',
  black: '#3F3A3A',
  textLight: '#3F3A3A',
  textDark: '#F4EFE9',
  neutral: '#FBF6F0',
  sage: '#A7BFA3',
  berry: '#B65F5A',
  warning: '#F0C979',
} as const;
