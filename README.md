# LOG2990

Projet de base à utiliser pour démarrer le développement de votre application.

# Important

Les commandes commençant par `npm` devront être exécutées dans les dossiers `client` et `server`. Les scripts non-standard doivent être lancés en faisant `npm run myScript`.

## Installation des dépendances de l'application

-   Installer `npm`. `npm` vient avec `Node` que vous pouvez télecharger [ici](https://nodejs.org/en/download/)

-   Lancer `npm install`. Il se peut que cette commande prenne du temps la première fois qu'elle est lancée. Ceci génère un fichier `package-lock.json` avec les verisons exactes de chaque dépendance.
-   Les fois suivants, lancer `npm ci` pour installer les versions exactes des dépendances du projet. Ceci est possiblement seulement si le fichier `package-lock.json` existe.

## Développement de l'application

Pour lancer l'application, il suffit d'exécuter: `npm start`. Vous devez lancer cette commande dans le dossier `client` et `server`

#### Client :
Une page menant vers `http://localhost:4200/` s'ouvrira automatiquement.

#### Serveur :
Votre serveur est accessible sur `http://localhost:3000`. Par défaut, votre client fait une requête `GET` vers le serveur pour obtenir un message.

L'application se relancera automatiquement si vous modifiez le code source de celle-ci.

## Génération de composants du client

Pour créer de nouveaux composants, nous vous recommandons l'utilisation d'angular CLI. Il suffit d'exécuter `ng generate component component-name` pour créer un nouveau composant.

Il est aussi possible de générer des directives, pipes, services, guards, interfaces, enums, muodules, classes, avec cette commande `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Exécution des tests unitaires

-   Exécuter `npm run test` pour lancer les tests unitaires.

-   Exécuter `npm run coverage` pour générer un rapport de couverture de code.

## Exécution de TSLint

-   Exécuter `npm run lint` pour lancer TSLint.

Les règles pour le linter sont disponibles dans le fichier `tslint.json` du dossier `/common`. Toute modification de ces règles doit être approuvé par un chargé de laboratoire.


## Aide supplémentaire

Pour obtenir de l'aide supplémentaire sur Angular CLI, utilisez `ng help` ou [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

Pour la documentation d'Angular, vous pouvez la trouver [ici](https://angular.io/docs)

Pour la documentation d'Express, vous pouvez la trouver [ici](https://expressjs.com/en/4x/api.html)

Pour obtenir de l'aide supplémentaire sur les tests avec Angular, utilisez [Angular Testing](https://angular.io/guide/testing)

# Standards de programmations

Cette section présente les différents standards de programmations que vous devez respecter lors de la réalisation de ce projet et qui seront utilisés pour la correction de l'assurance qualité de votre projet.

Référez vous au fichier `tslint.json` dans le dossier `common` pour les règles spécifiques.

## Format

Une accolade fermante occupe sa propre ligne de code, sauf dans le cas d'une if/else, où l'accolade fermante du if se trouve sur la ligne du else.

Une ligne de code devrait normalement avoir entre 45 et 80 caractères.

Une ligne de code ne devrait JAMAIS dépasser les 140 caractères.

## Conventions de nommage

Utilisez le ALL_CAPS pour les constantes.

Utilisez le PascalCase pour les noms de types et les valeurs d'énumérations.

Utilisez le camelCase pour les noms de fonctions, de propriétés et de variables.

Utilisez le kebab-case pour les noms de balises des composants Angular.

Évitez les abbréviations dans les noms de variables ou de fonctions.

Un tableau/list/dictionnaire devrait avoir un nom indiquant qu'il contient plusieurs objets, par exemple "Cars".

On évite de mettre le type de l'objet dans le noms, par exemple on préfère "Cars" à "ListOfCars" lorsqu'on déclare une liste.

Un objet ne devrait pas avoir un nom qui porte à croire qu'il s'agit d'un tableau.

Vous devez coder dans une langue et une seule. Nous vous recommandons d'écrire votre code en anglais, mais vous êtes libres de coder en français.

## Autres standards

N'utilisez jamais var. Utilisez let et const.

N'utilisez jamais any, que ce soit implicitement ou explicitement.

Évitez le mot-clé function si possibles, utilisez les fonctions anonymes: `() => {...}`.

Déclarez tous les types de retour des fonctions (incluant void).

Évitez les fonctions qui ont plus d'une responsabilité.

N'utilisez pas de nombres magiques. Utilisez des constantes bien nommées.

N'utilisez pas de chaînes de caractères magiques. Créez vos propres constantes avec des noms explicites.

Une fonction devrait éviter d'avoir plus de 3 paramètres.

**Évitez la duplication de code.**

Séparez votre code Typescript du CSS et du HTML. Générez vos component avec Angular CLI qui le fait pour vous.

## Git

Une seule fonctionnalité par branche.

Une branche fonctionnalité devrait se nommer `feature/nom-du-feature`.

Une branche correction de bogue devrait se nommer `hotfix/nom-du-bug`.

Les messages de commit doivent être concis et significatifs. Ne mettez pas des messages trop long ou trop courts. On devrait être capable de comprendre ce que le commit fait sans lire les changements.

Vous devez garder le même courriel, peu importe l'ordinateur que vous utilisez. Il ne devrait donc pas y avoir plus de 6 contributeurs dans votre repo. Un script d'extraction des métriques dans Git vous est fourni sur Moodle.

Si vous n'êtes pas familiers avec Git et le fonctionnement des branches, nous vous recommandons fortement d'explorer [ce guide intéractif](https://onlywei.github.io/explain-git-with-d3/).

## Lectures suggérées

[AntiPatterns](https://sourcemaking.com/antipatterns) (plus spécifiquement [Software Development AntiPatterns](https://sourcemaking.com/antipatterns/software-development-antipatterns))

[Building your first Angular App](https://scrimba.com/g/gyourfirstangularapp)


## Serveur

Votre serveur expose 2 routes :

`/api/index` renvoie un message défini selon l'interface `message` dans `common/message.ts`

`/api/date` renvoie la l'heure et la date d'aujourd'hui en faisant un appel à une API externe (worldclockapi)
