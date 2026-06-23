/** Cor de cada tema do currículo (espelha UNIT_META do backend). Usada nas cenas. */
const THEME_COLORS: Record<string, string> = {
  greetings: '#58CC02',
  numbers_colors: '#1CB0F6',
  family: '#CE82FF',
  food: '#FF9600',
  animals_nature: '#50C878',
  home_daily: '#FF4B4B',
  verbs_actions: '#FFC800',
  body_health: '#FF6B9D',
  work_school: '#00C4FF',
  time_weather: '#A78BFA',
  travel: '#2EC4B6',
  conversation: '#F4A261',
};

export function themeColor(theme: string): string {
  return THEME_COLORS[theme] ?? '#1CB0F6';
}
