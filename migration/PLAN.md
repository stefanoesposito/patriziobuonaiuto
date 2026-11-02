# Patrizio Buonaiuto — piano di trasferimento

Stato: prima importazione completata dopo conferma in chat. Vedere `reports/import-result.json`.
Fonte: repository `stefanoesposito/patriziobuonaiuto`, commit `3fb43f9`.
Destinazione: progetto Sanity `abnzzs23`, dataset esistente `production`; solo funzioni Free.
Il nome del dataset non equivale alla pubblicazione del sito Vercel.

## Inventario e corrispondenza

- 8 pagine principali: home, biografia, portfolio, contatti in italiano e inglese.
- La pagina “Su di me” è il CV/percorso professionale, confermato dal proprietario.
- 33 voci visive del portfolio: 20 opere e 13 fotografie di lavorazione.
- Le 13 foto diventano tre progetti di lavorazione: preparazione tela (2), Palazzo Donn’Anna (6), Lattaia di Vermeer (5). Ogni fotografia rimane accessibile e in ordine.
- 68 file di immagini, incluse fotografie, varianti, loghi e icone: restano nel repository; le immagini editoriali usate dai contenuti verranno caricate come asset Sanity. Non si caricano font, icone decorative o duplicati non necessari.
- Confronto Klimt: mantenere Ritratto di Adele Bloch-Bauer I (1907) e il ritratto personalizzato corretto, con attribuzioni distinte.
- Il prototipo HTML e la sala approvata rimangono invariati nel percorso `/concept/immersive-gallery` sul branch originale.

Tipi Sanity: `artwork` per opere; `process` per sequenze; `page` per i sei contenuti testuali localizzati; `siteSettings` per contatti e selezioni della home. Le due pagine portfolio sono generate dalle opere.
Campi comuni delle opere: titolo/descrizione IT e EN, slug, categorie, immagine e alt, galleria, maestro di riferimento, tecnica e misure quando note, SEO e stato di revisione. Immagini con hotspot; testi lunghi in Portable Text.

## Estrazione, identità, importazione

`migration/scripts/inventory.py` estrae dati e controlla percorsi senza modificare le fonti. `migration/reports/inventory.json` registra riferimenti e impronte SHA-256 degli asset. `web/src/lib/legacy-content.json` è lo snapshot pubblico usato esclusivamente dalla prima preview.

L’importazione sarà prima simulata. Gli ID ordinari saranno assegnati da Sanity, con una chiave `legacyId` stabile per riconoscere le voci nei rilanci e un manifesto che conserva gli ID restituiti. I documenti singleton avranno ID espliciti. Prima asset, poi opere/processi/pagine, infine riferimenti nelle impostazioni. Nessuna cancellazione e nessuna sovrascrittura di modifiche editoriali esistenti.

L’importazione reale richiede la revisione di questo inventario e del resoconto della simulazione. I dati esistenti del dataset saranno letti prima di procedere.

## Decisioni editoriali

- Conservare integralmente i testi IT/EN della biografia e delle altre pagine.
- Per opere originali prive di titolo usare etichette descrittive numerate, senza inventare titoli, tecniche, misure, date o prezzi. Restano da revisionare prima dell’indicizzazione.
- Il riferimento a De Nittis è ricavato dal nome del file: da verificare prima dell’indicizzazione.
- Non trasferire come fatti SEO le curiosità del vecchio preloader; la fonte originale resta archiviata nel repository.
- Le descrizioni alternative generiche del portfolio richiedono revisione editoriale. Le immagini e la loro appartenenza non vengono eliminate.

## URL e messa online

Preservare `/it/`, `/en/`, `/it/su-di-me`, `/en/about-me`, `/it/portfolio`, `/en/portfolio`, `/it/contact`, `/en/contact`. Redirigere `/it/index` e `/en/index` alle home. Aggiungere pagine dedicate alle opere e ai processi. Canonical e sitemap usano solo il dominio pubblico definitivo; le preview restano noindex.

Verifiche: conteggi, tutte le immagini utilizzate, riferimenti, ordine delle sequenze, testi biografici esatti, link/redirect, HTML indicizzabile, metadata, sitemap e confronto Klimt; browser desktop/mobile e movimento ridotto.

Non modificare main, progetto Vercel globale, DNS, dominio o produzione. La nuova preview Next.js usa impostazioni di deployment circoscritte. Il passaggio definitivo avverrà separatamente dopo revisione.
