-- ============================================================
-- SCHEMA MAGAZZINO APP
-- Esegui questo script su Supabase → SQL Editor → New query
-- ============================================================

-- Tabella corrieri
CREATE TABLE IF NOT EXISTS corrieri (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO corrieri (nome) VALUES
  ('GLS'),
  ('Arco Spedizioni')
ON CONFLICT (nome) DO NOTHING;

-- Tabella portali di acquisto
CREATE TABLE IF NOT EXISTS portali (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO portali (nome) VALUES
  ('Leroy Merlin'),
  ('Amazon')
ON CONFLICT (nome) DO NOTHING;

-- Tabella ordini
CREATE TABLE IF NOT EXISTS ordini (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  numero_ordine BIGSERIAL UNIQUE,
  nome_cliente TEXT NOT NULL,
  cognome_cliente TEXT NOT NULL,
  telefono_cliente TEXT,
  portale TEXT,
  corriere TEXT,
  materiale TEXT NOT NULL,
  note TEXT,
  stato TEXT NOT NULL DEFAULT 'in_elaborazione'
    CHECK (stato IN ('in_elaborazione', 'pronto_oggi', 'spedito')),
  bolla_url TEXT,
  distinta_url TEXT,
  dettagli_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Aggiorna updated_at automaticamente
CREATE OR REPLACE FUNCTION aggiorna_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_ordini_updated_at
  BEFORE UPDATE ON ordini
  FOR EACH ROW EXECUTE FUNCTION aggiorna_updated_at();

-- Tabella impostazioni (per email configurabili)
CREATE TABLE IF NOT EXISTS impostazioni (
  chiave TEXT PRIMARY KEY,
  valore TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Valori di default delle impostazioni
INSERT INTO impostazioni (chiave, valore) VALUES
  ('email_admin', 'simoneilaria05@gmail.com'),
  ('email_magazzino', 'ivansalluzzo1968@gmail.com')
ON CONFLICT (chiave) DO NOTHING;

-- ============================================================
-- STORAGE: crea il bucket "documenti" manualmente su Supabase
-- Storage → New bucket → Nome: "documenti" → Public: ON
-- ============================================================

-- RLS: disabilita per semplicità (l'accesso è controllato dal server)
ALTER TABLE ordini DISABLE ROW LEVEL SECURITY;
ALTER TABLE impostazioni DISABLE ROW LEVEL SECURITY;
ALTER TABLE portali DISABLE ROW LEVEL SECURITY;
ALTER TABLE corrieri DISABLE ROW LEVEL SECURITY;
