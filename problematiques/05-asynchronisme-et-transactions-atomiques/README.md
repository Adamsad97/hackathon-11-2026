# Problématique 05 — Transactions Asynchrones et Évaluation Paresseuse

## 1. Énoncé du Problème
Dans l'architecture de micro-services ou d'APIs transactionnelles avec **DuploJS**, les opérations combinent :
1. L'asynchronisme (`Promise<T>`, `async / await`).
2. L'évaluation différée/paresseuse via des thunks ou getters : `() => calculate(...)`.
3. L'agrégation atomique tout-ou-rien (`DEither.asyncGroup`) : un ensemble de tâches doit réussir collectivement pour produire un tuple complet de résultats `[Res1, Res2, ... ResN]`. Si une seule tâche échoue, la transaction est instantanément annulée et l'erreur est propagée sans exécuter les calculs restants.

Les défis d'ingénierie majeurs :
* **Asynchronisme vs Modèle Go :** Go ne possède pas de boucle d'événements (*Event Loop*) basée sur des promesses. Faut-il engendrer des goroutines et des canaux pour du code séquentiel pur ?
* **Conteneur polymorphe :** Dans un groupement de $N$ éléments, le résultat est souvent un tuple fixe (ex: `[3]float64`). Or Go interdit formellement d'utiliser `append` sur un tableau fixe.
* **Troncature du compilateur TypeScript :** Sur des signatures imbriquées profondes (promesses + Either + tuples), le `TypeChecker` tronque par défaut les nœuds syntaxiques en `"..."`, faisant planter le transpileur (`NOT FOUND NODE: TypeReference`).

---

## 2. Synthèse de la Stratégie Adoptée
* **Aplatissement Sémantique de l'Asynchronisme :** Pour du code sans concurrence I/O réelle, le transpileur applique la règle formelle `Promise<T> ➔ T` et `await expr ➔ expr`. Les fonctions `async` deviennent des fonctions Go synchrones pures ultra-rapides.
* **Résolution de la Troncature (`NoTruncation`) :** Injection du flag `NodeBuilderFlags.NoTruncation` sur le compilateur TypeScript, garantissant l'accès à l'arbre complet des types.
* **Moteur Polymorphe de Conteneur dans `asyncGroup` :**
  - Si le type cible est un tableau fixe (`[N]T`), il alloue sur la pile : `var values [N]T` (**zéro allocation de tas, zéro GC**), itère avec index et affecte `values[index] = res.V1.Value`.
  - Si le type cible est une slice dynamique, il utilise `make([]T, 0, len)` et `append`.
* **Évaluation Paresseuse & Court-Circuit $O(1)$ :** Chaque getter est invoqué au moment de son tour de boucle. Si son retour a `Tag == 0` (échec), la fonction retourne immédiatement, évitant l'exécution inutile des calculs suivants.

---

## 3. Documents Inclus
* [`historique-reflexions.md`](./historique-reflexions.md) : Analyse des erreurs de compilation Go et justifications de l'allocation stack.
* [`exemples/duplojs.ts`](./exemples/duplojs.ts) : Transaction asynchrone DuploJS avec court-circuit sur division par zéro.
* [`exemples/go_equivalent.go`](./exemples/go_equivalent.go) : Exemple Go idiomatique équivalent avec allocation sur pile et court-circuit immédiat.
