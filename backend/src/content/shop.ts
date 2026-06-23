import type { ShopItemType } from '../../../shared/types.js';

export interface ShopItemSeed {
  name: string;
  description: string;
  icon: string; // nome de ícone lucide-react
  type: ShopItemType;
  gem_cost: number;
  avatar_id?: number;
}

export const SHOP_ITEMS: ShopItemSeed[] = [
  // Proteção de ofensiva
  { name: 'Streak Freeze', description: 'Protege sua ofensiva por um dia perdido.', icon: 'Snowflake', type: 'streak_freeze', gem_cost: 200 },
  { name: 'Streak Freeze Duplo', description: 'Dois congelamentos de uma vez.', icon: 'Snowflake', type: 'streak_freeze', gem_cost: 350 },
  { name: 'Escudo de Ofensiva', description: 'Cinco congelamentos para a temporada inteira.', icon: 'Shield', type: 'streak_freeze', gem_cost: 900 },

  // Aceleradores de XP (essenciais para subir no ranking)
  { name: 'Turbo de XP (15 min)', description: 'Dobra o XP ganho por 15 minutos.', icon: 'Zap', type: 'xp_boost', gem_cost: 250 },
  { name: 'Mega Turbo de XP (1 h)', description: 'Dobra o XP por uma hora inteira — dispare no ranking.', icon: 'Rocket', type: 'xp_boost', gem_cost: 600 },

  // Avatares (cosméticos)
  { name: 'Avatar: Fantasma', description: 'Um avatar furtivo para o seu perfil.', icon: 'Ghost', type: 'avatar', gem_cost: 300, avatar_id: 2 },
  { name: 'Avatar: Gato', description: 'Para os amantes de gatos e código.', icon: 'Cat', type: 'avatar', gem_cost: 300, avatar_id: 3 },
  { name: 'Avatar: Coruja', description: 'Sabedoria de quem estuda de madrugada.', icon: 'Bird', type: 'avatar', gem_cost: 300, avatar_id: 4 },
  { name: 'Avatar: Foguete', description: 'Para quem está decolando na carreira.', icon: 'Rocket', type: 'avatar', gem_cost: 400, avatar_id: 5 },
  { name: 'Avatar: Caveira Hacker', description: 'Estilo hacker raiz.', icon: 'Skull', type: 'avatar', gem_cost: 500, avatar_id: 7 },
  { name: 'Avatar: Coroa', description: 'Para quem domina o ranking.', icon: 'Crown', type: 'avatar', gem_cost: 800, avatar_id: 6 },

  // Temas
  { name: 'Tema Escuro Pro', description: 'Modo escuro premium.', icon: 'Moon', type: 'theme', gem_cost: 400 },
  { name: 'Tema Terminal', description: 'Visual de terminal verde para devs raiz.', icon: 'Terminal', type: 'theme', gem_cost: 800 },
];
