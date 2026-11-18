# Projet 07

## Problématique

### Enchaîner des opérations dépendantes

Dans `index.ts`, `DEither.rightPipe` reçoit le résultat de `add`, puis transmet sa valeur à `divide`. Cette seconde opération peut aussi échouer. Comment enchaîner des opérations qui dépendent les unes des autres, en interrompant la suite dès qu’une étape produit un échec et en conservant cet échec dans le résultat final ?

## Solution

### Enchaîner des opérations dépendantes

```go
pipe := shard_dependencies.EitherRightPipe
input := add((float64)(1), (float64)(2))
next := func(value float64) (any) {
	return divide(value, (float64)(0))
}
result := pipe(input, next)
```

La fonction appelée et chacun de ses arguments sont d’abord évalués dans leur ordre d’apparition, puis stockés dans des variables temporaires. `DEither.rightPipe` devient `EitherRightPipe`. L’appel n’a lieu qu’après ces évaluations.

```go
func EitherRightPipe(input any, pipes ...any) (any) {
	if EitherIsLeft(input) {
		return input
	}
	acc := eitherContent(input)
	for _, pipe := range pipes {
		acc = Apply(pipe, eitherContent(acc))
		if EitherIsLeft(acc) {
			return acc
		}
	}
	if EitherIsRight(acc) {
		return acc
	}
	return EitherSuccessOf[any](acc)
}
```

Un échec déjà présent est renvoyé immédiatement. Sinon, `eitherContent` extrait la valeur d’un `Right` et laisse une valeur ordinaire inchangée. Chaque fonction suivante reçoit donc le résultat de l’étape précédente. Dès qu’une étape produit un `Left`, la boucle s’interrompt et cet échec est le résultat final. Une valeur finale qui n’est pas encore un `Right` est enveloppée avec `EitherSuccessOf`. Ici, `add` produit un succès `3`, puis `divide` reçoit ce `3` et le diviseur `0` : le résultat conservé est l’échec `division-by-zero`. `Apply` n’appelle la fonction qu’avec les paramètres qu’elle déclare, donc une étape Go peut avoir moins de paramètres que le callback JavaScript.
