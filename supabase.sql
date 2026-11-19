create table if not exists products (
  id text primary key,
  cat text not null,
  name text not null,
  price integer not null default 0,
  descr text default '',
  img text default '',
  created_at timestamptz default now()
);
create table if not exists settings (
  key text primary key,
  value jsonb not null
);

alter table products enable row level security;
alter table settings enable row level security;

create policy "lecture publique produits" on products for select using (true);
create policy "lecture publique reglages" on settings for select using (true);

create policy "ecriture proprietaire produits" on products for all to authenticated using (true) with check (true);
create policy "ecriture proprietaire reglages" on settings for all to authenticated using (true) with check (true);
