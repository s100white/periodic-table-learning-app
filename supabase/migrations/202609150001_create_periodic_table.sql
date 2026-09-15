create table if not exists public.elements (
  id integer primary key,
  atomic_number smallint not null unique check (atomic_number between 1 and 118),
  symbol text not null unique,
  name_ko text not null,
  name_en text not null,
  atomic_mass double precision,
  category text not null,
  period smallint not null check (period between 1 and 7),
  "group" smallint check ("group" between 1 and 18),
  block text not null,
  state_at_room_temp text not null,
  electron_configuration text,
  electronegativity double precision,
  oxidation_states text[] not null default '{}',
  atomic_radius double precision,
  first_ionization_energy double precision,
  melting_point double precision,
  boiling_point double precision,
  density double precision,
  summary text not null,
  chemical_characteristics text not null,
  series text not null default 'main',
  lanthanoid_position smallint,
  actinoid_position smallint,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.element_examples (
  id bigint generated always as identity primary key,
  element_id integer not null references public.elements(id) on delete cascade,
  title text not null,
  description text not null,
  context text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (element_id, title)
);

create table if not exists public.element_comparison_notes (
  id bigint generated always as identity primary key,
  element_a_symbol text not null references public.elements(symbol) on delete cascade,
  element_b_symbol text not null references public.elements(symbol) on delete cascade,
  topic text not null,
  note text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (element_a_symbol, element_b_symbol, topic),
  check (element_a_symbol <> element_b_symbol)
);

alter table public.elements enable row level security;
alter table public.element_examples enable row level security;
alter table public.element_comparison_notes enable row level security;

grant usage on schema public to anon, authenticated;
grant select on public.elements to anon, authenticated;
grant select on public.element_examples to anon, authenticated;
grant select on public.element_comparison_notes to anon, authenticated;

drop policy if exists "public read elements" on public.elements;
create policy "public read elements" on public.elements
  for select to anon, authenticated using (true);

drop policy if exists "public read examples" on public.element_examples;
create policy "public read examples" on public.element_examples
  for select to anon, authenticated using (true);

drop policy if exists "public read comparison notes" on public.element_comparison_notes;
create policy "public read comparison notes" on public.element_comparison_notes
  for select to anon, authenticated using (true);
