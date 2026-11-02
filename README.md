# Patrizio Buonaiuto — sito e Sanity

Questo branch aggiunge il nuovo sito Next.js e il pannello Sanity, mantenendo integralmente le fonti Flask e il prototipo approvato. Nessuna modifica a main o alla produzione è necessaria per provarlo.

## Struttura

- `web/`: sito Next.js, italiano e inglese, sala immersiva, catalogo, schede e SEO.
- `studio/`: Sanity Studio indipendente. Progetto `abnzzs23`, dataset `production`.
- `migration/`: piano, inventario, estrazione ripetibile e importazione non distruttiva.
- `templates/`, `static/`, `app.py`: fonte storica conservata; `vercel.json` continua a servire Flask per i deployment ordinari del vecchio progetto.

Pannello: https://patriziobuonaiuto-abnzzs23.sanity.studio/ (accesso con l’account di Patrizio).

## Sviluppo

Usare Node 24 e `npm ci` dalla radice. Le dipendenze sono bloccate in `package-lock.json`.

```
cp web/.env.example web/.env.local
npm run dev
npm run dev:studio
```

Il sito legge normalmente i contenuti **pubblicati** da Sanity. Dopo Pubblica, le modifiche sono disponibili al rinnovo della cache (circa un minuto; aprire/ricaricare la pagina). `CONTENT_SOURCE=legacy` è soltanto un’opzione esplicita per consultare lo snapshot prima della migrazione, non un fallback automatico in caso di errore.

La biografia/CV si trova in “Pagine e biografia / CV”. Per la sala e il confronto usare “Contatti e selezioni home”. Le opere originali senza titolo e i dati incerti sono marcati da revisionare prima dell’indicizzazione. Nessun plugin AI, scheduling o servizio a pagamento è attivato.

## Verifiche

```
npm run check
npm run build:web
npm run build:studio
npm run typegen -w @patrizio/studio
node scripts/verify-content.mjs
```

La verifica HTTP usa `http://127.0.0.1:3000`; `VERIFY_URL` permette di controllare una diversa preview. Verifica 54 pagine, immagini, testo integrale della biografia, metadata, attribuzione delle copie, redirect, 404, sitemap e noindex.

## Importazione

Leggere `migration/PLAN.md` e `migration/reports/review.md`. Il caricamento iniziale è documentato in `migration/reports/import-result.json`. Non modifica né cancella contenuti editoriali già importati. Gli asset sono deduplicati da Sanity e gli ID ordinari restituiti dal servizio sono conservati nel manifesto locale.

Dopo `sanity login`, dalla cartella `studio/`:

```
npx sanity exec ../migration/scripts/import.ts --with-user-token
```

Il comando è in sola lettura. L’importazione reale richiede un’intenzione esplicita, impostando `SANITY_MIGRATION_APPLY=abnzzs23` per quella sola esecuzione. Conservare il manifesto locale e revisionare il resoconto prima di rilanciare.

## Preview e rilascio

Il progetto Vercel esistente serve ancora Flask dalla radice. Per la preview Next.js usare **solo override del singolo deployment**: root `web`, framework `nextjs`, install `cd .. && npm ci`, build `npm run build`, output `.next`, source files outside root abilitato. Non cambiare la root globale del progetto e non usare target production.

`SITE_URL` è il dominio canonico; impostarlo prima del rilascio definitivo. Preview e sviluppo sono noindex. Il rilascio richiede un successivo controllo editoriale, la scelta esplicita del passaggio in produzione e la verifica di tutti gli URL del vecchio sito.

L’anteprima delle bozze è predisposta ma richiede un token server-only `SANITY_API_READ_TOKEN` e la configurazione del Presentation Tool. Non inserire token in variabili `NEXT_PUBLIC_`. La pubblicazione ordinaria delle opere funziona senza questo token.
