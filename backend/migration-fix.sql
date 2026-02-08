-- Script de migration pour ajouter userType aux utilisateurs existants
-- Exécutez ce script dans votre base de données PostgreSQL avant de relancer l'application
-- Commande: psql -U postgres -d mecalens_db -f migration-fix.sql

-- Étape 1: Créer les types enum si nécessaire
DO $$ BEGIN
    CREATE TYPE "user_usertype_enum" AS ENUM('handicap', 'accompagnant');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "user_handicaptype_enum" AS ENUM('moteur', 'visuel', 'auditif', 'cognitif');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "user_accompagnanttype_enum" AS ENUM('famille', 'aide_soignant', 'benevole', 'chauffeur_solidaire');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Étape 2: Vérifier si la colonne userType existe et la gérer
DO $$ 
BEGIN
    -- Si la colonne n'existe pas, l'ajouter comme VARCHAR nullable
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user' AND column_name = 'userType') THEN
        ALTER TABLE "user" ADD COLUMN "userType" VARCHAR;
    END IF;
    
    -- Mettre à jour les utilisateurs existants avec une valeur par défaut
    UPDATE "user" SET "userType" = 'handicap' WHERE "userType" IS NULL;
    
    -- Si la colonne est VARCHAR, la convertir en enum
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user' AND column_name = 'userType' AND data_type = 'character varying') THEN
        ALTER TABLE "user" ALTER COLUMN "userType" TYPE "user_usertype_enum" USING "userType"::"user_usertype_enum";
    END IF;
    
    -- Rendre la colonne NOT NULL (si elle ne l'est pas déjà)
    BEGIN
        ALTER TABLE "user" ALTER COLUMN "userType" SET NOT NULL;
    EXCEPTION
        WHEN OTHERS THEN
            -- La colonne est peut-être déjà NOT NULL, on continue
            NULL;
    END;
END $$;

-- Étape 6: Ajouter les autres colonnes si elles n'existent pas
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "firstName" VARCHAR;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "lastName" VARCHAR;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "phoneNumber" VARCHAR;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "handicapType" "user_handicaptype_enum";
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "accompagnantType" "user_accompagnanttype_enum";
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "isVerified" BOOLEAN DEFAULT false;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "verificationCode" VARCHAR;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "resetPasswordCode" VARCHAR;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "resetPasswordExpires" TIMESTAMP;

