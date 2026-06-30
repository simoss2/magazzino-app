# 🏭 Gestione Magazzino — Guida al deployment

App web per la gestione ordini tra ufficio (Simo) e magazzino (Ivan).

---

## Cosa ti serve (tutto gratis)

- Account **Supabase**: https://supabase.com
- Account **Resend**: https://resend.com
- Account **Vercel**: https://vercel.com
- Account **GitHub**: https://github.com

---

## STEP 1 — Supabase (database + storage)

1. Vai su https://supabase.com e crea un account
2. Clicca **New project** → dai un nome (es. "magazzino") → imposta una password sicura → scegli una regione europea
3. Aspetta che il progetto si avvii (circa 1 minuto)

### Crea le tabelle
4. Nel menu a sinistra clicca **SQL Editor** → **New query**
5. Copia e incolla tutto il contenuto del file `supabase/schema.sql`
6. Clicca **Run** (▶)

### Crea il bucket per i PDF
7. Nel menu a sinistra clicca **Storage** → **New bucket**
8. Nome: `documenti`  
9. Spunta **Public bucket** → clicca **Save**

### Crea i due utenti
10. Nel menu a sinistra clicca **Authentication** → **Users** → **Add user** → **Create new user**

**Utente 1 — Simo (admin):**
- Email: `simoneilaria05@gmail.com`
- Password: scegli tu
- Clicca **Create user**
- Poi clicca sull'utente appena creato → **Edit user** → nella sezione **User Metadata** incolla:
  ```json
  { "ruolo": "admin" }
  ```
- Clicca **Save**

**Utente 2 — Ivan (magazzino):**
- Email: `ivansalluzzo1968@gmail.com`
- Password: scegli tu
- Clicca **Create user**
- Poi clicca sull'utente → **Edit user** → **User Metadata**:
  ```json
  { "ruolo": "magazzino" }
  ```
- Clicca **Save**

### Copia le credenziali Supabase
11. Nel menu a sinistra clicca **Settings** → **API**
12. Copia questi tre valori (ti serviranno dopo):
    - `Project URL` → è il tuo `NEXT_PUBLIC_SUPABASE_URL`
    - `anon public` → è il tuo `NEXT_PUBLIC_SUPABASE_ANON_KEY`
    - `service_role` → è il tuo `SUPABASE_SERVICE_ROLE_KEY` (**non condividere mai questo!**)

---

## STEP 2 — Resend (email)

1. Vai su https://resend.com e crea un account
2. Clicca **API Keys** → **Create API Key** → nome "magazzino" → **Create**
3. Copia la chiave (inizia con `re_`) → è il tuo `RESEND_API_KEY`

> **Nota:** con l'account gratuito Resend puoi mandare email da `onboarding@resend.dev`.
> Se vuoi usare il tuo dominio, segui la guida di Resend per verificarlo.

---

## STEP 3 — GitHub (carica il codice)

1. Vai su https://github.com e crea un account (se non ce l'hai)
2. Clicca **+** → **New repository** → nome "magazzino-app" → **Create repository**
3. Segui le istruzioni per caricare questa cartella sul repository

---

## STEP 4 — Vercel (mette online l'app)

1. Vai su https://vercel.com e accedi con il tuo account GitHub
2. Clicca **Add New** → **Project**
3. Seleziona il repository `magazzino-app`
4. Clicca **Deploy** (lascia tutto di default)
5. Prima che finisca il deploy, vai su **Settings** → **Environment Variables** e aggiungi:

| Nome variabile | Valore |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | L'URL copiato da Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | La chiave anon copiata da Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | La service role key copiata da Supabase |
| `RESEND_API_KEY` | La chiave Resend |
| `EMAIL_FROM` | `Magazzino <onboarding@resend.dev>` |
| `EMAIL_ADMIN` | `simoneilaria05@gmail.com` |
| `EMAIL_MAGAZZINO` | `ivansalluzzo1968@gmail.com` |

6. Clicca **Save** → poi vai su **Deployments** → **Redeploy**
7. Dopo il deploy, Vercel ti dà un URL tipo `https://magazzino-app-xxx.vercel.app` — quello è il link dell'app!

---

## Come usare l'app

**Simo** accede con il suo link → `/login` → inserisce email e password admin → va su `/admin`

**Ivan** accede con il suo link → `/login` → inserisce email e password magazzino → va su `/magazzino`

> Consiglio: aggiungi l'app come preferito sul browser, o su telefono come "Aggiungi alla schermata Home"

---

## Sviluppo locale (opzionale)

```bash
# Copia il file delle variabili ambiente
cp .env.local.example .env.local
# Modifica .env.local con le tue credenziali

# Installa dipendenze
npm install

# Avvia in locale
npm run dev
# App disponibile su http://localhost:3000
```

---

## Struttura del progetto

```
src/
├── app/
│   ├── login/          # Pagina di login
│   ├── admin/          # Vista Simo (ordini, nuovo ordine, impostazioni)
│   ├── magazzino/      # Vista Ivan (lista ordini, aggiornamento stato)
│   └── api/            # Backend API
│       ├── ordini/     # CRUD ordini
│       ├── upload/     # Upload PDF
│       └── impostazioni/
├── lib/
│   ├── supabase-server.js
│   ├── supabase-client.js
│   └── email.js        # Invio email con Resend
└── middleware.js        # Protezione route e controllo ruoli
```
