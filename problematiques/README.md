# Découpage et Analyse des Problématiques de Transpilation TypeScript ➔ Go
**Projet :** Transpileur Haute Performance pour le Framework DuploJS  
**Hackathon DuploJS 2026**

---

## 1. Introduction & Démarche d'Ingénierie

L'objectif fondamental de ce projet est de transcompiler automatiquement du code TypeScript utilisant les abstractions monadiques de **DuploJS** (`DEither`, `DArray`, `DCommon`) vers du code **Go natif**, afin d'atteindre des performances d'exécution maximales (binaire compilé machine, zéro VM, zéro ramasse-miettes).

Conformément aux consignes de travail, **les exercices fournis ne sont pas traités comme des fins en soi, mais comme des échantillons révélateurs de problématiques d'ingénierie générales.** 

Chaque dossier ci-dessous détaille une problématique transversale majeure avec son historique de réflexion, ses choix d'architecture et des exemples retravaillés manuellement.

---

## 2. Sommaire des Problématiques Traitées

Le projet a été découpé en **5 problématiques fondamentales** :

| N° | Dossier | Problématique Centrale | Concepts Clés & Stratégies |
| :---: | :--- | :--- | :--- |
| **01** | [`01-unions-et-discrimination/`](./01-unions-et-discrimination/) | **Représentation des Unions & Discrimination Statique** | `UnionN` étiquetée sur la pile, dédoublonnage canonique, test `Tag` $O(1)$ sans `reflect`. |
| **02** | [`02-retours-multiples-et-placevalue/`](./02-retours-multiples-et-placevalue/) | **Retours Multiples Hétérogènes & Inférence Contextuelle** | Adaptateur universel `placeValue`, réconciliation statique de $N$ retours sans annotation explicite. |
| **03** | [`03-dualite-memoire-tableaux-fixes-et-slices/`](./03-dualite-memoire-tableaux-fixes-et-slices/) | **Dualité Mémoire Tableaux Fixes `[N]T` vs Slices `[]T`** | Slicing zéro-copie (`[:]`), passage par valeur sur la pile, zéro allocation sur le tas (*Heap*). |
| **04** | [`04-composition-fonctionnelle-et-court-circuit/`](./04-composition-fonctionnelle-et-court-circuit/) | **Élimination du Runtime & Court-Circuit Monadique** | Inlining statique des pipelines (`pipe`, `rightPipe`), IIFE Go auto-invoquées pour court-circuit anticipé. |
| **05** | [`05-asynchronisme-et-transactions-atomiques/`](./05-asynchronisme-et-transactions-atomiques/) | **Transactions Asynchrones & Évaluation Paresseuse** | Aplatissement `Promise<T> ➔ T`, conteneurs polymorphes, levée de la troncature (`NoTruncation`). |

---

## 3. Structure de Chaque Dossier de Problématique

Chaque sous-dossier respecte rigoureusement la structure demandée :
1. **`README.md`** : Court résumé exécutif posant le problème et la solution retenue.
2. **`historique-reflexions.md`** : Analyse critique chronologique (pistes explorées, impasses de l'approche initiale V1, justifications de l'architecture V2).
3. **`exemples/`** :
   - `duplojs.ts` : Code DuploJS pur, propre et retravaillé manuellement.
   - `go_equivalent.go` : Code Go idiomatique équivalent, sans bruit de mangling, compilable et optimisé.

---

## 4. Résultats Empiriques & Benchmarks (Bonus)

Toutes les stratégies ont été validées empiriquement par un protocole de mesure de haute précision comparant le runtime Node.js/V8 (exécutant DuploJS) au binaire natif Go généré :

| Problématique | Projet Référence | DuploJS (Node.js) | Binaire Go Natif | Facteur d'Accélération |
| :--- | :---: | :---: | :---: | :---: |
| **01. Unions & Discrimination** | Projet 01 | 1531.7 ms | 22.1 ms | **~69x plus rapide** |
| **02. Retours Multiples (placeValue)** | Projet 04 | 1311.8 ms | 36.9 ms | **~35x plus rapide** |
| **03. Dualité Tableaux Fixes / Slices** | Projet 05 | 1692.6 ms | 35.3 ms | **~48x plus rapide** |
| **04. Composition & Court-Circuit** | Projet 07 | 2052.0 ms | 19.0 ms | **~108x plus rapide** |
| **05. Transaction Asynchrone** | Projet 10 | 1896.1 ms | 17.2 ms | **~110x plus rapide** |

*Pour rejouer le benchmark en direct dans le terminal :*
```powershell
powershell -ExecutionPolicy Bypass -File soutenance/benchmark.ps1
```
