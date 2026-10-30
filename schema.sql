CREATE TABLE IF NOT EXISTS allergy_data (
  key text PRIMARY KEY,
  data jsonb NOT NULL,
  revision integer NOT NULL DEFAULT 1
);
