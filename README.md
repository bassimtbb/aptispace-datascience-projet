# Projet Data Science — Prédiction de la Consommation Automobile

[![CI](https://github.com/aptitek/aptispace-datascience-projet/actions/workflows/ci.yml/badge.svg)](https://github.com/aptitek/aptispace-datascience-projet/actions/workflows/ci.yml)

Analyse complète de l'efficacité énergétique de 398 véhicules (dataset Auto MPG), du traitement des données brutes jusqu'au déploiement d'un prédicteur ML interactif. Le pipeline couvre l'acquisition, le wrangling, la visualisation, l'EDA, la modélisation (Random Forest, R² = 0.91) et la communication des résultats via un rapport Quarto et un dashboard React.

---

## Livrables

Les rapports compilés sont publiés automatiquement à chaque push via GitHub Actions.

| Format | Description | Lien |
| :--- | :--- | :--- |
| PDF | Rapport complet mis en page via Typst | [Télécharger](../../releases/download/latest/rapport.pdf) |
| HTML interactif | Rapport avec visualisations Observable JS | [Télécharger](../../releases/download/latest/rapport.html) |
| Markdown | Version de lecture rapide pour GitHub | [Consulter](../../releases/download/latest/README.md) |
| Sources Python | Scripts extraits de tous les notebooks | [Télécharger (.zip)](../../releases/download/latest/sources.zip) |
| Logs | Journaux de compilation et d'exécution | [Télécharger (.zip)](../../releases/download/latest/logs.zip) |

---

## Structure du projet

```
├── .github/workflows/      # Pipelines CI (compilation & release automatiques)
├── data/
│   ├── raw/                # Données brutes (Automobile.csv)
│   └── processed/          # Données nettoyées
├── notebooks/              # Pipeline analytique (fichiers .ipynb)
│   ├── 01_acquisition.ipynb
│   ├── 02_wrangling.ipynb
│   ├── 03_visualisation.ipynb
│   ├── 04_eda.ipynb
│   ├── 05_modelisation.ipynb
│   ├── 06_evaluation.ipynb
│   └── 07_communication.ipynb
├── report/
│   ├── rapport.qmd         # Rapport maître Quarto
│   └── slides.qmd          # Slides de soutenance RevealJS
├── dashboard/
│   ├── frontend/           # Application React (Vite + Recharts)
│   └── backend/            # API FastAPI (prédiction ML)
├── build/                  # Artefacts générés (exclus de Git)
└── tools/                  # Utilitaires de compilation
```

---

## Lancer le dashboard

Le dashboard (React + FastAPI) se lance via Docker Compose :

```bash
docker-compose up --build
```

| Service | URL | Description |
| :--- | :--- | :--- |
| React | [localhost:3000](http://localhost:3000) | Dashboard interactif |
| FastAPI | [localhost:8000/docs](http://localhost:8000/docs) | API de prédiction ML |
| Quarto | [localhost:4815/report/rapport.html](http://localhost:4815/report/rapport.html) | Rapport avec rechargement automatique |

**Pages disponibles :**

- `/` — 4 KPIs dynamiques + 4 graphiques (évolution MPG, scatter HP/MPG, MPG par origine, distribution cylindres)
- `/predict` — 7 sliders paramétrables → prédiction MPG en temps réel + top 3 variables influentes
- `/data` — Table de 398 véhicules, triable et recherchable

---

## Compilation locale

**Prérequis :** [Python 3.12](https://www.python.org/), [Quarto CLI](https://quarto.org/docs/get-started/), [Go-Task](https://taskfile.dev/installation/)

```bash
pip install -r requirements.txt
```

| Commande | Action |
| :--- | :--- |
| `task render` | Compile l'intégralité du pipeline et des rapports |
| `task preview` | Prévisualise le rapport avec rechargement automatique |
| `task clean` | Supprime les fichiers temporaires et compilations locales |

---

## Équipe

| Nom | 
| :--- |
| **Bassim TABBEB** |
| **Mathis PENAGOS** |
