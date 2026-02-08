# Script PowerShell pour exécuter la migration SQL
# Exécutez ce script: .\run-migration.ps1

$env:PGPASSWORD = "root"
psql -U postgres -d mecalens_db -f migration-fix.sql

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Migration réussie!" -ForegroundColor Green
} else {
    Write-Host "❌ Erreur lors de la migration" -ForegroundColor Red
}

