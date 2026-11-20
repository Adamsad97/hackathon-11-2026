# Problématique 04 — Élimination du Runtime et Court-Circuit Monadique

## 1. Énoncé du Problème
Les architectures fonctionnelles modernes et le framework **DuploJS** s'appuient massivement sur des combinateurs monadiques tels que `DCommon.pipe` et `DEither.rightPipe`.
Ces opérateurs permettent d'enchaîner une série de transformations de manière déclarative :
```typescript
const result = DEither.rightPipe(
    initialValue,
    step1,
    step2,
    step3
);
```
La sémantique monadique exige un **court-circuit immédiat** : si une étape intermédiaire retourne un échec (`Left`), les étapes suivantes ne doivent jamais être appelées, et l'erreur doit être retournée immédiatement.

En Go, il n'existe pas de combinateur variadique d'ordre supérieur natif supportant le court-circuit typé.
Le défi d'ingénierie consiste à :
1. Traduire ces enchaînements en Go **sans créer de bibliothèque runtime dynamique** imposant des interfaces vides `interface{}` et de la réflexion.
2. Garantir le court-circuit à coût zéro sans créer d'allocations de fermetures (*closures*) intermédiaires.

---

## 2. Synthèse de la Stratégie Adoptée
* **Déroulement Statique à la Compilation (Inlining de Variables) :**  
  Pour les `pipe` purs, le transpileur élimine l'appel de fonction d'ordre supérieur et génère des variables locales séquentielles (`Generated_1`, `Generated_2`), exécutant un appel direct.
* **Fonctions Auto-Invoquées (IIFE Go) pour le Court-Circuit :**  
  Pour `rightPipe`, le corps est encapsulé dans une fonction anonyme appelée immédiatement :
  ```go
  result := func() ResultUnion {
      if step1.Tag == 0 { return step1 } // Court-circuit anticipé
      if step2.Tag == 0 { return step2 }
      return step3
  }()
  ```
  Le compilateur Go optimise cette forme (*inlining*) et transforme le code en de simples sauts d'instructions machine conditionnels (*JMP/CMP*).

---

## 3. Documents Inclus
* [`historique-reflexions.md`](./historique-reflexions.md) : Pourquoi l'émulation d'un runtime d'ordre supérieur en Go est un anti-pattern.
* [`exemples/duplojs.ts`](./exemples/duplojs.ts) : Pipeline monadique DuploJS avec plusieurs causes d'échec.
* [`exemples/go_equivalent.go`](./exemples/go_equivalent.go) : Exemple Go idiomatique déroulé avec court-circuit $O(1)$.
