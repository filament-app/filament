-- API Keys
create table if not exists api_keys (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users not null,
  key_hash    text not null unique,
  key_prefix  text not null,
  name        text,
  created_at  timestamptz default now(),
  last_used   timestamptz,
  revoked     boolean default false
);

-- Enable RLS
alter table api_keys enable row level security;

create policy "Users can manage their own API keys"
  on api_keys for all
  using (auth.uid() = user_id);

-- Trace Logs
create table if not exists trace_logs (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid references auth.users not null,
  api_key_prefix   text,
  session_id       text,
  model_requested  text,
  model_used       text,
  tokens_in        integer,
  tokens_out       integer,
  latency_ms       integer,
  status           text,
  error            text,
  created_at       timestamptz default now()
);

alter table trace_logs enable row level security;

create policy "Users can read their own logs"
  on trace_logs for select
  using (auth.uid() = user_id);

create policy "Service role can insert logs"
  on trace_logs for insert
  with check (true);

-- Wired Tools
create table if not exists wired_tools (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users not null,
  name        text not null,
  endpoint    text not null,
  schema      jsonb,
  auth_header text,
  active      boolean default true,
  created_at  timestamptz default now()
);

alter table wired_tools enable row level security;

create policy "Users can manage their own tools"
  on wired_tools for all
  using (auth.uid() = user_id);

-- Sessions
create table if not exists sessions (
  id           text primary key,
  user_id      uuid references auth.users,
  active_model text default 'auto',
  context      jsonb default '[]'::jsonb,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

alter table sessions enable row level security;

create policy "Users can manage their own sessions"
  on sessions for all
  using (auth.uid() = user_id);

-- Indexes
create index if not exists idx_trace_logs_user_id on trace_logs(user_id);
create index if not exists idx_trace_logs_session_id on trace_logs(session_id);
create index if not exists idx_trace_logs_created_at on trace_logs(created_at desc);
create index if not exists idx_api_keys_user_id on api_keys(user_id);
create index if not exists idx_api_keys_prefix on api_keys(key_prefix);
