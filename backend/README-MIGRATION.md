# Instructions de Migration

## Problème
La table `user` contient déjà des données, et TypeORM ne peut pas ajouter une colonne `userType` NOT NULL directement.

## Solution en 2 étapes

### Étape 1: Démarrer l'application (userType sera nullable temporairement)

L'entité a été modifiée pour permettre `userType` nullable. Vous pouvez maintenant démarrer l'application :

```bash
npm run start:dev
```

TypeORM créera la colonne `userType` comme nullable, ce qui permettra à l'application de démarrer.

### Étape 2: Exécuter le script de post-migration

Une fois l'application démarrée, exécutez le script SQL pour mettre à jour les données et rendre `userType` NOT NULL :

**Option A: Via psql**
```bash
psql -U postgres -d mecalens_db -f post-migration.sql
```

**Option B: Via psql interactif**
```bash
psql -U postgres -d mecalens_db
```
Puis :
```sql
\i post-migration.sql
```

**Option C: Script complet (migration initiale)**
Si vous n'avez pas encore exécuté la migration initiale :
```bash
psql -U postgres -d mecalens_db -f migration-fix.sql
```

### Option Alternative: Supprimer et recréer la table (⚠️ PERDREZ LES DONNÉES)

Si vous n'avez pas de données importantes à conserver :

```sql
DROP TABLE IF EXISTS "user" CASCADE;
```

Puis relancez l'application, TypeORM recréera la table automatiquement avec la bonne structure.

## Vérification

Après la migration, vérifiez que tout est correct :

```sql
SELECT id, email, "userType" FROM "user";
```

Tous les utilisateurs devraient avoir un `userType` défini (soit 'handicap', soit 'accompagnant').

