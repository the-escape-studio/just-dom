# Agent skills (`npx skills`)

Questa cartella contiene **Agent Skills** compatibili con la CLI [`skills`](https://vercel.com/docs/agent-resources/skills) (`npx skills add …`).

## `just-dom`

Guida per libreria **just-dom**, CLI **create-just-dom**, **`jd.config`** e plugin **`@just-dom/*`**.

### Installazione da GitHub

```bash
npx skills add the-escape-studio/just-dom
```

Per installare solo questa skill se il repository conterrà più skill in futuro:

```bash
npx skills add the-escape-studio/just-dom --skill just-dom
```

Elencare le skill nel repo senza installare:

```bash
npx skills add the-escape-studio/just-dom --list
```

Percorso diretto alla cartella della skill (fork o branch):

```bash
npx skills add https://github.com/the-escape-studio/just-dom/tree/main/skills/just-dom
```

### Installazione da clone locale

Dalla root del monorepo:

```bash
npx skills add ./skills/just-dom
```

### Sviluppo nel monorepo

Il file canonico è **`skills/just-dom/SKILL.md`**. In questo repo, **`.cursor/skills/just-dom`** è un symlink a `../../skills/just-dom` così Cursor e la CLI condividono lo stesso contenuto. Su **Windows**, abilita symlink in Git (`git config core.symlinks true`) oppure modifica solo `skills/just-dom/` se il link non funziona.

Requisiti dello standard: il campo **`name`** nel frontmatter di `SKILL.md` deve coincidere con il nome della cartella (`just-dom`).
