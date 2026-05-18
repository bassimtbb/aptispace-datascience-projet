#!/bin/bash
# Shell Script for Automated Environment Setup on Linux (Ubuntu/Debian) using apt
set -e

echo "🚀 Démarrage de l'installation automatisée pour Linux..."

# 1. Mise à jour des paquets et outils de base
echo "🔄 Mise à jour du gestionnaire de paquets..."
sudo apt-get update -y
sudo apt-get install -y python3 python3-pip python3-venv wget curl tar xz-utils git

# Installation de Jupyter via pip
echo "🐍 Installation de Jupyter..."
python3 -m pip install --upgrade pip || true
python3 -m pip install --break-system-packages jupyter || python3 -m pip install jupyter || true


# 2. Installation de Go-Task
echo "⚙️ Installation de Go-Task..."
sudo sh -c "$(curl --location https://taskfile.dev/install.sh)" -- -d -b /usr/local/bin

# 3. Installation de Typst (compilation PDF ultra-rapide)
echo "⚡ Installation de Typst..."
TYPST_VERSION="0.11.0"
wget -O /tmp/typst.tar.xz "https://github.com/typst/typst/releases/download/v${TYPST_VERSION}/typst-x86_64-unknown-linux-musl.tar.xz"
tar -xf /tmp/typst.tar.xz -C /tmp/
sudo mv /tmp/typst-x86_64-unknown-linux-musl/typst /usr/local/bin/
rm -rf /tmp/typst.tar.xz /tmp/typst-x86_64-unknown-linux-musl
echo "✅ Typst installé avec succès !"

# 4. Installation de Quarto CLI
echo "✍️ Installation de Quarto CLI..."
QUARTO_VERSION="1.4.550"
wget -O /tmp/quarto.deb "https://github.com/quarto-dev/quarto-cli/releases/download/v${QUARTO_VERSION}/quarto-${QUARTO_VERSION}-linux-amd64.deb"
sudo dpkg -i /tmp/quarto.deb || sudo apt-get install -f -y
rm -f /tmp/quarto.deb
echo "✅ Quarto CLI installé avec succès !"

echo "✅ Installation Linux terminée avec succès !"
