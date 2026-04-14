-- ============================================
-- FAMILY CHALLENGE — DATABASE SETUP
-- ============================================
-- Run this entire file in your Supabase SQL Editor
-- (Dashboard → SQL Editor → New Query → Paste → Run)
-- ============================================

-- 1. FAMILIES
create table if not exists families (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  invite_code text unique not null,
  family_streak int default 0,
  created_at timestamptz default now()
);

-- 2. PROFILES
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  family_id uuid references families(id) not null,
  name text not null,
  role text not null check (role in ('parent', 'teen', 'kid')),
  age int,
  avatar_color text default '#0066FF',
  level int default 1,
  xp int default 0,
  xp_to_next int default 100,
  coins int default 0,
  streak int default 0,
  shield_used boolean default false,
  shield_resets_at timestamptz,
  completed_total int default 0,
  created_at timestamptz default now()
);

-- 3. CHALLENGES
create table if not exists challenges (
  id uuid primary key default gen_random_uuid(),
  family_id uuid references families(id) not null,
  title text not null,
  description text,
  type text not null check (type in ('home', 'growth', 'personal')),
  difficulty text not null check (difficulty in ('Easy', 'Medium', 'Hard', 'Epic')),
  coins int not null default 10,
  xp int not null default 13,
  status text not null default 'active'
    check (status in ('active', 'negotiate', 'pending_approval', 'completed', 'declined')),
  from_user uuid references profiles(id) not null,
  to_user uuid references profiles(id) not null,
  due_date text,
  recurring boolean default false,
  recurrence_rule text,
  visible_to_kids boolean default true,
  is_suggestion boolean default false,
  needs_parent_approval boolean default false,
  counter_offer text,
  decline_reason text,
  completed_at timestamptz,
  photo_proof_url text,
  created_at timestamptz default now()
);

-- 4. REWARDS
create table if not exists rewards (
  id uuid primary key default gen_random_uuid(),
  family_id uuid references families(id) not null,
  name text not null,
  description text,
  cost int not null,
  category text default 'privilege'
    check (category in ('privilege', 'money', 'experience', 'parent', 'custom')),
  is_active boolean default true,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

-- 5. REDEMPTIONS
create table if not exists redemptions (
  id uuid primary key default gen_random_uuid(),
  reward_id uuid references rewards(id) not null,
  redeemed_by uuid references profiles(id) not null,
  family_id uuid references families(id) not null,
  coins_spent int not null,
  status text default 'pending' check (status in ('pending', 'approved', 'fulfilled')),
  created_at timestamptz default now()
);

-- 6. FEED EVENTS
create table if not exists feed_events (
  id uuid primary key default gen_random_uuid(),
  family_id uuid references families(id) not null,
  user_id uuid references profiles(id) not null,
  event_type text not null
    check (event_type in ('complete', 'levelup', 'streak', 'redeem',
                          'suggest', 'shoutout', 'accept', 'counter', 'decline')),
  target_text text,
  target_user uuid references profiles(id),
  coins_amount int,
  metadata jsonb,
  created_at timestamptz default now()
);

-- 7. FEED REACTIONS
create table if not exists feed_reactions (
  id uuid primary key default gen_random_uuid(),
  feed_event_id uuid references feed_events(id) on delete cascade not null,
  user_id uuid references profiles(id) not null,
  reaction_type text default 'heart',
  created_at timestamptz default now(),
  unique(feed_event_id, user_id, reaction_type)
);

-- 8. LOOT DROPS
create table if not exists loot_drops (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) not null,
  challenge_id uuid references challenges(id),
  coins_awarded int not null,
  claimed boolean default false,
  expires_at timestamptz not null,
  created_at timestamptz default now()
);

-- 9. ACHIEVEMENTS
create table if not exists user_achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) not null,
  achievement_key text not null,
  earned_at timestamptz default now(),
  unique(user_id, achievement_key)
);


-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

alter table families enable row level security;
alter table profiles enable row level security;
alter table challenges enable row level security;
alter table rewards enable row level security;
alter table redemptions enable row level security;
alter table feed_events enable row level security;
alter table feed_reactions enable row level security;
alter table loot_drops enable row level security;
alter table user_achievements enable row level security;

-- Helper: get current user's family_id
create or replace function get_my_family_id()
returns uuid
language sql
security definer
stable
as $$
  select family_id from profiles where id = auth.uid()
$$;

-- FAMILIES: users can read their own family
create policy "read own family" on families
  for select using (id = get_my_family_id());

-- FAMILIES: anyone can insert (creating a new family during signup)
create policy "create family" on families
  for insert with check (true);

-- PROFILES: users can read their family members
create policy "read family members" on profiles
  for select using (family_id = get_my_family_id());

-- PROFILES: users can update their own profile
create policy "update own profile" on profiles
  for update using (id = auth.uid());

-- PROFILES: users can insert their own profile
create policy "insert own profile" on profiles
  for insert with check (id = auth.uid());

-- CHALLENGES: family members can read challenges (with visibility filter)
create policy "read family challenges" on challenges
  for select using (
    family_id = get_my_family_id()
    and (
      visible_to_kids = true
      or to_user = auth.uid()
      or from_user = auth.uid()
      or (select role from profiles where id = auth.uid()) = 'parent'
    )
  );

-- CHALLENGES: family members can create challenges within their family
create policy "create challenges" on challenges
  for insert with check (
    family_id = get_my_family_id()
    and from_user = auth.uid()
  );

-- CHALLENGES: involved users or parents can update challenges
create policy "update challenges" on challenges
  for update using (
    family_id = get_my_family_id()
    and (
      to_user = auth.uid()
      or from_user = auth.uid()
      or (select role from profiles where id = auth.uid()) = 'parent'
    )
  );

-- REWARDS: family members can read (with parent-only filter)
create policy "read family rewards" on rewards
  for select using (
    family_id = get_my_family_id()
    and (
      category != 'parent'
      or (select role from profiles where id = auth.uid()) = 'parent'
    )
  );

-- REWARDS: parents can create rewards
create policy "create rewards" on rewards
  for insert with check (
    family_id = get_my_family_id()
    and (select role from profiles where id = auth.uid()) = 'parent'
  );

-- REWARDS: parents can update rewards
create policy "update rewards" on rewards
  for update using (
    family_id = get_my_family_id()
    and (select role from profiles where id = auth.uid()) = 'parent'
  );

-- REDEMPTIONS: family members can read their family's redemptions
create policy "read redemptions" on redemptions
  for select using (family_id = get_my_family_id());

-- REDEMPTIONS: users can create their own redemptions
create policy "create redemptions" on redemptions
  for insert with check (redeemed_by = auth.uid());

-- FEED: family members can read their feed
create policy "read feed" on feed_events
  for select using (family_id = get_my_family_id());

-- FEED: family members can insert feed events
create policy "create feed events" on feed_events
  for insert with check (
    family_id = get_my_family_id()
    and user_id = auth.uid()
  );

-- FEED REACTIONS: family members can read reactions
create policy "read reactions" on feed_reactions
  for select using (
    feed_event_id in (select id from feed_events where family_id = get_my_family_id())
  );

-- FEED REACTIONS: users can insert their own reactions
create policy "create reactions" on feed_reactions
  for insert with check (user_id = auth.uid());

-- LOOT DROPS: users can read their own
create policy "read own loot" on loot_drops
  for select using (user_id = auth.uid());

-- LOOT DROPS: system can insert (via service role)
create policy "create loot" on loot_drops
  for insert with check (user_id = auth.uid());

-- ACHIEVEMENTS: users can read their own
create policy "read own achievements" on user_achievements
  for select using (user_id = auth.uid());

-- ACHIEVEMENTS: system can insert
create policy "create achievements" on user_achievements
  for insert with check (user_id = auth.uid());


-- ============================================
-- INDEXES (for performance)
-- ============================================

create index if not exists idx_profiles_family on profiles(family_id);
create index if not exists idx_challenges_to_user on challenges(to_user, status);
create index if not exists idx_challenges_family on challenges(family_id, status);
create index if not exists idx_feed_family on feed_events(family_id, created_at desc);
create index if not exists idx_rewards_family on rewards(family_id, is_active);


-- ============================================
-- REALTIME (enable for live updates)
-- ============================================

alter publication supabase_realtime add table feed_events;
alter publication supabase_realtime add table challenges;
alter publication supabase_realtime add table profiles;
