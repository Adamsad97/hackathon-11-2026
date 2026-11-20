# Historique des Réflexions — Problématique 04 : Composition & Court-Circuit

## 1. Pistes Explorées et Impasse de l'Émulation Runtime

### Piste A : Écrire un helper générique `Pipe` en Go
* **Idée :** Écrire une fonction variadique Go simulant le pipe :
  ```go
  func Pipe(initial any, fns ...func(any) any) any { ... }
  ```
* **Pourquoi cette piste a été formellement rejetée :**
  1. **Effondrement des performances :** Chaque passage d'argument impose le *boxing* en `interface{}` sur le tas (*Heap*).
  2. **Assertions de type permanentes :** Chaque fonction doit extraire dynamiquement son entrée par `val.(float64)`. Si une assertion échoue à l'exécution, le programme *panic*.
  3. **Non-idiomatique en Go :** Go privilégie la clarté explicite du flux séquentiel plutôt que les indirections de haut niveau sans typage statique.

---

### Piste B : Chaînage par structures monadiques avec méthodes de chaînage (`.AndThen()`)
* **Idée :** Attacher des méthodes de type `result.AndThen(fn1).AndThen(fn2)`.
* **Pourquoi cette piste a été écartée :**
  En Go, les méthodes de structures ne peuvent pas déclarer de nouveaux paramètres de type génériques indépendants de la structure receveuse. Il est donc impossible d'exprimer proprement en Go une méthode `.AndThen[U](fn func(T) U) Result[U]`.

---

### Piste C : Déroulement Statique et IIFE de Court-Circuit (Retenue)
* **Idée :** Résoudre la composition **à la compilation** lors de la visite de l'arbre syntaxique :
  1. Le transpileur inspecte la liste ordonnée des étapes.
  2. Il émet une fonction fermée auto-invoquée `func() ResultType { ... }()`.
  3. Pour chaque étape :
     - Il appelle la fonction avec la valeur précédente déballée.
     - Si le résultat est un échec (`Tag == 0`), il émet un `return` anticipé immédiat.
* **Avantages déterminants :**
  * **Zéro runtime :** Aucune bibliothèque d'exécution supplémentaire n'est requise.
  * **Court-circuit instantané :** Dès le premier échec, le reste de la séquence est sauté sans aucune allocation.
  * **Optimisation par le compilateur Go :** Le compilateur Go intègre l'IIFE (*inlining*) et supprime tout coût d'appel de fonction.
