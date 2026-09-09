-- MyHR schema (docs/PRODUCT.md §5). 재실행 = 전체 리셋.
drop view if exists current_attributes;
drop table if exists relationships;
drop table if exists attributes;
drop table if exists notes;
drop table if exists people;

-- 본인은 id='me' 행. 별도 me 표 없음.
create table if not exists people (
  id text primary key,
  name text not null,
  photo_url text,
  tags text[] not null default '{}',
  one_liner text,
  updated_at timestamptz default now()
);

create table if not exists notes (
  id serial primary key,
  person_id text references people(id) on delete cascade,
  raw_text text not null,
  source text not null check (source in ('seed', 'kakao_screenshot', 'text', 'voice')),
  created_at timestamptz default now()
);

-- 한 줄 = 사실 하나. 컬럼을 늘리지 않고 행을 늘린다.
create table if not exists attributes (
  id serial primary key,
  person_id text references people(id) on delete cascade,
  key text not null,
  value text not null,
  source int references notes(id)
);
create index if not exists attributes_key_value_idx on attributes (key, value);
create index if not exists attributes_person_key_idx on attributes (person_id, key);

create table if not exists relationships (
  id serial primary key,
  from_id text references people(id) on delete cascade,
  to_id text references people(id) on delete cascade,
  label text not null,
  source text
);

-- (person_id, key)별 최신 행 = 현재 값. 번복(plays_soccer true→false)은 새 행으로.
create view current_attributes as
  select distinct on (person_id, key) id, person_id, key, value, source
  from attributes
  order by person_id, key, id desc;
