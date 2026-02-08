-- Script à exécuter APRÈS que l'application ait démarré avec userType nullable
-- Ce script rend userType NOT NULL après avoir mis à jour toutes les données

-- Mettre à jour tous les utilisateurs qui n'ont pas de userType
UPDATE "user" SET "userType" = 'handicap' WHERE "userType" IS NULL;

-- Rendre la colonne NOT NULL
ALTER TABLE "user" ALTER COLUMN "userType" SET NOT NULL;

-- Vérifier que tout est correct
SELECT id, email, "userType" FROM "user";

