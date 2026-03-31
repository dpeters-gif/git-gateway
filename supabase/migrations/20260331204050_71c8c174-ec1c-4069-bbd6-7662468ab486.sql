
-- Seed Badges (12 total: 9 standard + 3 streak milestones)
INSERT INTO public.badges (name, description, icon, category, criteria_type, criteria_value) VALUES
  ('first_quest', 'Erste Quest abgeschlossen', 'check-circle', 'milestone', 'tasks_completed', 1),
  ('week_warrior', '7-Tage-Streak', 'flame', 'streak', 'streak_days', 7),
  ('month_master', '30-Tage-Streak', 'flame', 'streak', 'streak_days', 30),
  ('level_5', 'Level 5 erreicht', 'star', 'level', 'level_reached', 5),
  ('level_10', 'Level 10 erreicht', 'star', 'level', 'level_reached', 10),
  ('century_xp', '100 XP gesammelt', 'zap', 'xp', 'total_xp', 100),
  ('thousand_xp', '1000 XP gesammelt', 'zap', 'xp', 'total_xp', 1000),
  ('team_player', '5 Challenges beigetragen', 'users', 'social', 'challenges_contributed', 5),
  ('quest_creator', '10 Aufgaben erstellt', 'plus-circle', 'participation', 'tasks_created', 10),
  ('fortnight_hero', '14-Tage-Streak', 'flame', 'streak', 'streak_days', 14),
  ('halfway_hero', '50-Tage-Streak', 'flame', 'streak', 'streak_days', 50),
  ('century_streak', '100-Tage-Streak', 'crown', 'streak', 'streak_days', 100);

-- Seed Avatar Items (14 starter items)
INSERT INTO public.avatar_items (name, description, category, icon, required_level, gold_price) VALUES
  ('Rotes T-Shirt', 'Ein klassisches rotes T-Shirt', 'top', 'shirt', 1, NULL),
  ('Blaues T-Shirt', 'Ein cooles blaues T-Shirt', 'top', 'shirt', 1, NULL),
  ('Grünes T-Shirt', 'Ein frisches grünes T-Shirt', 'top', 'shirt', 1, NULL),
  ('Jeans', 'Klassische blaue Jeans', 'bottom', 'scissors', 1, NULL),
  ('Sportschuhe', 'Bequeme Sportschuhe', 'shoes', 'footprints', 1, NULL),
  ('Sonnenbrille', 'Coole Sonnenbrille', 'accessory', 'glasses', 2, 5),
  ('Baseballcap', 'Sportliche Baseballcap', 'hat', 'hard-hat', 2, 5),
  ('Goldkette', 'Glänzende Goldkette', 'accessory', 'link', 3, 10),
  ('Zauberhut', 'Mystischer Zauberhut', 'hat', 'wand', 5, 20),
  ('Superheldenumhang', 'Fliege durch die Lüfte!', 'accessory', 'shield', 5, 25),
  ('Krone', 'Königliche Krone', 'hat', 'crown', 7, 30),
  ('Drachenflügel', 'Mächtige Drachenflügel', 'accessory', 'wind', 10, 50),
  ('Regenbogenhaare', 'Bunte Regenbogenhaare', 'hair', 'palette', 3, 15),
  ('Ninja-Maske', 'Geheimnisvolle Ninja-Maske', 'accessory', 'eye-off', 4, 15);

-- Enable Realtime on key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.shopping_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
