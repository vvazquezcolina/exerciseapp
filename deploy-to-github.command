#!/bin/bash

# Abrir Terminal visualmente
osascript -e 'tell application "Terminal" to activate'

# Cambiar al folder donde está el script
cd "$(dirname "$0")"

# Configura tu repo (CAMBIA ESTO con tu URL real)
REMOTE_URL="git@github.com:usuario/repositorio.git"
BRANCH="main"

# Inicializar si no existe .git
if [ ! -d ".git" ]; then
  git init
  git remote add origin "$REMOTE_URL"
fi

# Add, commit y push
git add .
git commit -m "Auto commit $(date)" || echo "Nada para commitear"
git branch -M "$BRANCH"
git push -u origin "$BRANCH"
