create extension if not exists postgis;

create table places (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text not null,
  location geography(Point, 4326) not null,
  category text not null check (category in ('cafe', 'restaurant', 'dessert')),
  discount_content text not null,
  auth_condition text,
  expired_at date,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz default now()
);

create index places_location_idx on places using gist(location);
create index places_status_idx on places (status);

create or replace function get_places_nearby(
  lat float, lng float, radius_meters float default 3000
)
returns setof places as $$
  select * from places
  where status = 'approved'
  and ST_DWithin(location, ST_MakePoint(lng, lat)::geography, radius_meters)
  order by ST_Distance(location, ST_MakePoint(lng, lat)::geography);
$$ language sql stable;
