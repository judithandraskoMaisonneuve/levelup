# 🐈 LevelUp : Gamifiez votre bien-être émotionnel!

(https://github.com/user-attachments/assets/5dd2e678-c94b-44f7-93e1-041bcdc9ade0)

## 🌟 Aperçu du Projet

**LevelUp** est une application développée dans le cadre de notre cours *Veille Technologique - Développement d'application* (Techniques Informatique).

Notre objectif était de résoudre le problème de la constance dans le suivi d'humeur en créant une expérience **ludique, engageante et socialement motivante.**

### Caractéristiques Clés

* **Suivi Gamifié de l'Humeur :** Enregistrez votre humeur rapidement, débloquez des badges et grimpez les ligues.
* **Journal Personnel Intégré :** Espace sécurisé pour l'introspection.
* **Classements et Badges :** Motive la cohérence et récompense les jalons de bien-être.

## 🛠️ Stack Technique & Infrastructure

L'application est construite autour de l'infrastructure Google **Firebase** et utilise la gestion de code source via **GitHub**.

| Composant | Technologie | Rôle |
| :--- | :--- | :--- |
| **Application (Frontend)** | [Ex: React / Vue.js / JavaScript] | Interface utilisateur (navigateur web compatible). |
| **Base de Données** | **Firestore (NoSQL)** | Stockage des données (utilisateurs, classements, badges). |
| **Authentification** | **Firebase Authentication** | Gestion sécurisée des comptes utilisateurs (email/mot de passe, etc.). |
| **Stockage Fichiers** | **Firebase Storage** | Utilisé pour les images de profil et autres médias utilisateurs. |
| **Gestion de Code** | **GitHub** | Dépôt privé pour la collaboration de l'équipe (branchement, PR). |

> **Note sur le déploiement :** LevelUp utilise Firebase comme backend principal (Firestore, Auth, Storage). Cependant, nous n'avons pas utilisé Firebase Hosting, ni mis en place de CI/CD. L'application s'exécute actuellement en mode de **développement local** uniquement.

## 🚀 Lancement Local (Pour les examinateurs techniques)

Pour accéder à l'application et examiner le code :

### Prérequis Nécessaires

Assurez-vous d'avoir installé les éléments suivants :

* **Node.js** : Pour l'exécution locale de l'application et la gestion des dépendances.
* **Firebase SDK** : Intégré au projet pour interagir avec les services Firebase.
* **Un navigateur web compatible** (Chrome, Firefox, Edge, Safari, dernières versions).
* **Un compte utilisateur** est requis pour les fonctionnalités complètes.

### Procédure de Démarrage (Développement)

1.  **Cloner le dépôt :**
    ```bash
    git clone [https://github.com/judithandraskoMaisonneuve/levelup.git](https://github.com/judithandraskoMaisonneuve/levelup.git)
    cd levelup
    ```

2.  **Installer les dépendances :**
    ```bash
    npm install 
    # ou yarn install
    ```

3.  **Configuration des Variables :**
    Les configurations Firebase et les clés sensibles sont gérées via un fichier `.env`. Ce fichier n'est pas inclus publiquement, mais son contenu type est :
    ```
    REACT_APP_FIREBASE_API_KEY=votre_cle_api
    REACT_APP_FIREBASE_AUTH_DOMAIN=votre_domaine
    # ... autres configurations Firebase
    ```

4.  **Lancer le serveur de développement :**
    Puisque nous n'utilisons pas d'hébergement public, l'application doit être lancée en mode développement pour être accessible.
    ```bash
    npm run dev 
    # ou la commande spécifique à votre projet pour le mode dev
    ```
    Le serveur se lancera et l'application sera accessible localement (généralement sur `http://localhost:3000` ou similaire).

### 🔍 Vérification (API/Backend)

Pour tester directement l'API (Firestore) et confirmer que le backend local fonctionne :
* Utiliser un client REST (comme Postman) pour tester les points d'accès de l'API.
* Vérifier les logs du serveur après le lancement pour s'assurer qu'il n'y a pas d'erreurs.

## 👥 Équipe et Collaboration

Ce projet a été réalisé en équipe. Notre flux de travail sur GitHub impliquait des branches spécifiques et des *Pull Requests (PR)* avec révision avant la fusion sur la branche `main`.

