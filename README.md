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

