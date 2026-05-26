# L'identita' del DOM come primitiva per `@just-dom/signals`

## Sintesi

`appendChild` non clona un nodo DOM esistente. Se il nodo e' gia' presente nel documento, il browser lo sposta dal parent attuale al nuovo parent.

Per `just-dom`, questo comportamento non e' un dettaglio: puo' diventare un vantaggio architetturale. La libreria lavora gia' con nodi DOM reali, senza virtual DOM. Questo significa che `@just-dom/signals` puo' costruire primitive reactive attorno all'identita' stabile dei nodi: creare i nodi una volta, mantenere listener, ref e stato locale del DOM, poi aggiornarli o spostarli in modo mirato quando cambiano i signal.

Oggi il package signals fornisce gia' le fondamenta reactive:

- `createSignal`
- `computed`
- `effect`
- `effect(el, fn)` con cleanup legato al ciclo di vita del nodo
- `reactive(signal)` per creare un `Text` node vivo

Quello che manca e' il livello DOM-aware sopra queste primitive: conditional rendering, switch keyed, liste keyed e portal. Queste primitive permetterebbero agli utenti di beneficiare dello spostamento dei nodi in modo intenzionale, invece di scrivere a mano blocchi imperativi con `effect`.

## Perche' e' importante

In molte librerie UI, un cambio di stato produce una nuova descrizione dell'interfaccia. Il runtime confronta la descrizione nuova con quella vecchia e riconcilia le differenze.

`just-dom` ha un'opportunita' diversa: il valore restituito da un componente e' gia' il nodo DOM reale.

Quindi l'identita' del nodo puo' diventare un asset del runtime.

Quando un nodo esistente viene spostato con `appendChild`, il browser conserva:

- event listener
- callback ref e object ref
- valore degli input, focus e selection quando applicabile
- posizione di scroll
- stato salvato direttamente sul nodo
- effects legati al nodo
- identita' di tutto il sottoalbero DOM

Il modello diventa:

> Costruisci il DOM una volta quando possibile. Sposta i nodi esistenti quando cambia la struttura. Aggiorna solo testo, attributi e stili che dipendono dai signal.

## Stato attuale

L'implementazione attuale va gia' in questa direzione.

`reactive(signal)` crea un `Text` node e mantiene sincronizzato il suo `nodeValue`:

```ts
DOM.p({}, ["Count: ", reactive(count)])
```

Questo e' gia' identity-based. Il `Text` node restituito puo' essere passato ovunque `just-dom` accetti un child DOM.

`effect(el, fn)` permette di legare mutazioni DOM al ciclo di vita di un elemento:

```ts
DOM.div({
  ref: (el) => {
    effect(el, () => {
      el.className = active() ? "active" : ""
    })
  },
})
```

La documentazione mostra anche un conditional rendering manuale:

```ts
let panel: HTMLElement | null = null

DOM.section({
  ref: (el) => {
    effect(el, () => {
      const next = show()
        ? DOM.div({}, ["Panel is visible"])
        : null

      panel?.remove()
      panel = next
      if (next) el.appendChild(next)
    })
  },
})
```

Questo funziona, ma l'utente deve gestire manualmente creazione, rimozione e cleanup. E' un buon proof of concept, non ancora un layer ergonomico completo.

## Cosa manca

### 1. Conditional rendering come primitiva

L'utente non dovrebbe dover scrivere un `effect` manuale per un semplice show/hide.

Possibile API:

```ts
when(visible, () => DOM.div({}, ["Visible"]))
```

Oppure:

```ts
when(visible, {
  then: () => Panel(),
  else: () => EmptyState(),
})
```

Comportamento atteso:

- creare i branch in modo lazy
- inserire o rimuovere solo la porzione controllata
- non toccare i sibling statici
- permettere eventualmente il caching del branch
- disporre gli effetti quando un branch viene davvero eliminato

Domanda di design:

- `when` deve ricreare il branch ogni volta o conservarlo di default?

Per `just-dom`, il caching e' interessante perche' preserva l'identita' del DOM. Pero' la ricreazione puo' essere piu' prevedibile. Una soluzione pulita e' renderlo esplicito:

```ts
when(visible, () => Panel(), { cache: true })
```

### 2. Switch keyed / cached views

Tab, viste locali e piccoli state machine possono beneficiare direttamente dello spostamento dei nodi.

Possibile API:

```ts
switchNode(tab, {
  home: () => HomeView(),
  settings: () => SettingsView(),
  profile: () => ProfileView(),
})
```

Comportamento atteso:

- creare ogni view in modo lazy alla prima apparizione della chiave
- mantenere una cache per chiave
- spostare la view attiva dentro la regione di mount
- preservare lo stato locale del DOM quando si cambia view e poi si torna indietro

Questo e' uno dei casi in cui `appendChild` mostra meglio il suo valore. Un pannello impostazioni con input puo' sparire e poi tornare senza perdere valori inseriti dall'utente.

### 3. Liste keyed

La mancanza piu' importante e' probabilmente una primitiva per liste keyed.

Possibile API:

```ts
each(todos, (todo) => todo.id, (todo) => TodoItem(todo))
```

Dove `todos` e' un signal:

```ts
const [todos, setTodos] = createSignal([
  { id: "a", label: "Write docs" },
  { id: "b", label: "Ship package" },
])
```

Comportamento atteso:

- mantenere una `Map<key, node>`
- creare un nodo solo per nuove chiavi
- spostare i nodi esistenti nel nuovo ordine con operazioni DOM native
- rimuovere i nodi le cui chiavi sono sparite
- preservare stato locale e identita' dei singoli item durante i reorder

Questo darebbe a `just-dom` una storia efficiente per rendering keyed senza introdurre virtual DOM.

Idea interna semplificata:

```ts
const nodes = new Map<Key, Node>()

for (const item of items()) {
  const key = getKey(item)
  let node = nodes.get(key)

  if (!node) {
    node = render(item)
    nodes.set(key, node)
  }

  parent.appendChild(node)
}
```

Dato che appendere un child esistente lo sposta, un loop semplice puo' diventare un'operazione di reorder. L'implementazione reale richiede anchor e cleanup, ma l'idea centrale e' questa.

### 4. Range ancorati

Per implementare bene `when`, `switchNode` ed `each`, serve un piccolo concetto interno di range DOM.

Un range puo' essere rappresentato con comment anchor:

```ts
const start = document.createComment("jd:start")
const end = document.createComment("jd:end")
```

La primitiva puo' restituire un `DocumentFragment` che contiene gli anchor. Gli update successivi inseriscono, rimuovono o spostano nodi tra quegli anchor.

Vantaggi:

- i sibling statici non vengono toccati
- piu' nodi possono appartenere a una singola regione reactive
- conditional e liste possono essere annidati
- il cleanup ha un confine chiaro

Possibili helper interni:

```ts
type DomRange = {
  start: Comment
  end: Comment
}

function createRange(): DocumentFragment
function insertBeforeEnd(range: DomRange, node: Node): void
function clearRange(range: DomRange): void
function nodesInRange(range: DomRange): Node[]
```

Questo non deve necessariamente diventare API pubblica nella prima fase.

### 5. Lifecycle piu' intenzionale

Il cleanup attuale e' basato su `isConnected`.

E' una buona base, ma ha un limite: un nodo puo' essere temporaneamente disconnesso mentre viene spostato, messo in cache o parcheggiato. Se un signal cambia in quella finestra, un effect puo' interpretare il nodo come rimosso definitivamente e disporre se stesso.

Per l'uso base va bene. Per cached views e liste keyed, il runtime deve distinguere meglio tra:

- non ancora montato
- montato
- temporaneamente detached ma ancora posseduto da una primitiva reactive
- definitivamente disposed

Una possibile direzione:

```ts
const dispose = effect(el, fn, {
  owner: range,
})
```

Oppure un owner interno:

```ts
type Owner = {
  disposed: boolean
  dispose(): void
}
```

In questo modo primitive come `each` e `switchNode` possono disporre esplicitamente i nodi quando una chiave sparisce o un branch viene scartato, invece di dipendere solo dalla connessione al documento.

### 6. Attributi e stili reactive

Oggi attributi e stili reactive si fanno con `effect(el, fn)`. E' flessibile, ma verboso.

Esempio attuale:

```ts
DOM.button({
  ref: (el) => {
    effect(el, () => {
      el.disabled = loading()
      el.className = active() ? "active" : ""
    })
  },
})
```

Possibile ergonomia futura:

```ts
DOM.button({
  disabled: loading,
  className: computed(() => active() ? "active" : ""),
}, [
  reactive(label),
])
```

Questa parte e' potente, ma tocca il percorso di creazione degli elementi nel core o in una factory arricchita dai plugin. Probabilmente e' meglio affrontarla dopo aver stabilizzato le primitive DOM range.

## API proposta

Una prima superficie pubblica potrebbe essere:

```ts
reactive(signal)
when(condition, render, options?)
switchNode(keySignal, views, options?)
each(listSignal, keyFn, renderItem, options?)
```

Con tipi indicativi:

```ts
type Signal<T> = () => T

type WhenOptions = {
  cache?: boolean
}

type SwitchOptions = {
  cache?: boolean
}

type EachOptions = {
  disposeRemoved?: boolean
}
```

Naming ancora aperto:

- `when` vs `show`
- `switchNode` vs `match` vs `choose`
- `each` vs `list` vs `repeat`

Preferenza proposta:

- `when` per branch condizionali
- `switchNode` per selezione keyed, perche' `switch` e' riservato
- `each` per liste keyed

Sono nomi diretti e familiari per chi ha gia' usato librerie reactive.

## Esperienza utente desiderata

```ts
import DOM, { createRoot } from "just-dom"
import { createSignal, reactive, switchNode, each } from "@just-dom/signals"

const [tab, setTab] = createSignal<"home" | "settings">("home")
const [todos, setTodos] = createSignal([
  { id: "a", label: "Write docs" },
  { id: "b", label: "Ship package" },
])

const app = DOM.main({}, [
  DOM.nav({}, [
    DOM.button({ onclick: () => setTab("home") }, ["Home"]),
    DOM.button({ onclick: () => setTab("settings") }, ["Settings"]),
  ]),

  switchNode(tab, {
    home: () => DOM.section({}, [
      DOM.h1({}, ["Todos"]),
      DOM.ul({}, [
        each(todos, (todo) => todo.id, (todo) =>
          DOM.li({}, [todo.label])
        ),
      ]),
    ]),

    settings: () => DOM.section({}, [
      DOM.h1({}, ["Settings"]),
      DOM.label({}, [
        "Project name",
        DOM.input({ value: "just-dom" }),
      ]),
    ]),
  }),
])

createRoot("app", app)
```

In questo esempio, passando da `settings` a `home` e poi tornando a `settings`, il valore dell'input potrebbe restare intatto perche' la sezione settings viene conservata e spostata, non ricreata.

## Strategia di implementazione

### Fase 1: helper interno per DOM range

Creare e testare un piccolo modulo interno per range ancorati.

Dovrebbe supportare:

- creazione di coppie di anchor
- inserimento di un nodo
- inserimento di piu' nodi
- pulizia di un range
- rimozione di un range
- spostamento di un nodo esistente dentro un range

Test importanti:

- i sibling statici restano invariati
- i range annidati funzionano
- spostare nodi esistenti non li clona
- i `DocumentFragment` vengono svuotati dopo l'inserimento, come da comportamento browser

### Fase 2: `when`

Implementare la primitiva condizionale piu' semplice.

Versione iniziale:

```ts
when(condition, render)
```

Decisioni da prendere:

- caching di default o ricreazione di default?
- supportare subito `else`?
- `render` deve essere solo lazy o puo' accettare anche un nodo esistente?

Suggerimento iniziale:

- render lazy
- niente cache di default
- supporto a `else` subito dopo

Motivo: e' il comportamento piu' semplice da spiegare. Il caching puo' essere aggiunto come opzione esplicita.

### Fase 3: `switchNode`

Implementare selezione di branch per chiave.

Default suggerito:

- cache dei branch attiva di default

Motivo: il senso principale di `switchNode` e' preservare identita' e stato tra cambi di branch.

### Fase 4: `each`

Implementare liste keyed.

Prima versione con render che restituisce un singolo nodo:

```ts
each(items, key, item => DOM.li({}, [item.label]))
```

In seguito si puo' supportare anche item multi-nodo tramite fragment/range.

Test importanti:

- aggiunta item
- rimozione item
- reorder
- identita' dei nodi preservata dopo reorder
- effects degli item rimossi disposti correttamente
- nessun rerender per chiavi rimaste uguali

### Fase 5: ownership lifecycle

Dopo cached views e liste keyed, rivedere il lifecycle.

Obiettivo: cleanup esplicito tramite owner, invece di affidarsi solo a `isConnected`.

## Rischi e domande aperte

### Timing del cleanup

`isConnected` e' semplice, ma non abbastanza espressivo per tutti i casi di movimento. I nodi in cache possono essere intenzionalmente disconnessi. Il runtime deve evitare di disporre effects per nodi temporaneamente parcheggiati.

### I fragment non sono container stabili

Un `DocumentFragment` viene svuotato quando viene appeso. Questo e' utile, ma significa che non puo' essere usato come wrapper persistente. Le regioni reactive persistenti hanno bisogno di anchor nel DOM reale.

### Componenti multi-nodo

Oggi un componente just-dom di solito restituisce un `HTMLElement`. Pero' esistono i fragment, e le primitive reactive potrebbero dover gestire piu' sibling. I range ancorati lo rendono possibile, ma l'API deve restare semplice.

### Confine tra core e plugin

Gli attributi reactive sarebbero molto ergonomici, ma probabilmente richiedono integrazione piu' profonda con `createElement` o con una factory arricchita dal plugin. La prima iterazione dovrebbe evitare di cambiare la semantica del core.

### Naming

I nomi sono importanti perche' definiscono come gli utenti penseranno la libreria. L'API dovrebbe comunicare identita' del DOM reale, non sembrare una copia di un virtual DOM.

## Raccomandazione

Il prossimo passo migliore non e' "aggiungere piu' signals" in astratto. E' aggiungere un piccolo layer di identita' DOM:

1. range ancorati interni
2. `when`
3. `switchNode`
4. `each`

Questo darebbe a `@just-dom/signals` una direzione molto chiara:

> Signals fine-grained per il DOM reale, con nodi stabili che si aggiornano e si spostano invece di essere ricreati.

E' una direzione forte per `just-dom`, perche' nasce direttamente dalla filosofia del core. Il browser fornisce gia' lo spostamento dei nodi. Il plugin puo' trasformare quel comportamento in una developer experience intenzionale.
