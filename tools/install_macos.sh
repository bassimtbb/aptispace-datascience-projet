#!/bin/bash
# Shell Script for Automated Environment Setup on macOS using Homebrew
set -e

echo "🚀 Démarrage de l'installation automatisée pour macOS..."

# 1. Vérification et installation de Homebrew
if ! command -v brew &> /dev/null; then
    echo "ℹ️ Homebrew n'est pas détecté. Installation de Homebrew en cours..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    
    # Charger Homebrew dans le PATH de la session actuelle pour Apple Silicon et Intel
    if [ -f /opt/homebrew/bin/brew ]; then
        eval "$(/opt/homebrew/bin/brew shellenv)"
    elif [ -f /usr/local/bin/brew ]; then
        eval "$(/usr/local/bin/brew shellenv)"
    fi
else
    echo "✅ Homebrew est déjà installé."
fi

# 2. Installation des outils
echo "📦 Installation des outils système..."

# Python 3
echo "🐍 Installation de Python 3.12..."
brew install python@3.12

# Installation de Jupyter via pip
echo "🐍 Installation de Jupyter..."
python3 -m pip install --upgrade pip || true
python3 -m pip install jupyter || true

# Git
echo "🐍 Installation de Git..."
brew install git

# Quarto CLI
echo "✍️ Installation de Quarto CLI..."
brew install --cask quarto

# Typst (PDF Engine)
echo "⚡ Installation de Typst..."
brew install typst

# Go-Task (Taskfile orchestrator)
echo "⚙️ Installation de Go-Task..."
brew install go-task

echo "✅ Installation macOS terminée avec succès !"
echo "⚠️ IMPORTANT : Veuillez ouvrir un nouveau terminal pour appliquer les modifications."
