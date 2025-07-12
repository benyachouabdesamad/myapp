# Backend Flask - Détection de Tumeurs Cérébrales

## Installation

1. **Créer un environnement virtuel Python:**
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate     # Windows
```

2. **Installer les dépendances:**
```bash
pip install -r requirements.txt
```

3. **Placer votre modèle:**
   - Copiez votre fichier `brain_tumor_vgg16.keras` dans le dossier `backend/`
   - Le fichier doit être exactement nommé `brain_tumor_vgg16.keras`

## Structure attendue du modèle

Votre modèle doit:
- Accepter des images de taille 224x224x3 (format VGG16)
- Retourner une prédiction binaire (0 = No Tumor, 1 = Tumor)
- Être sauvegardé au format Keras (.keras ou .h5)

## Démarrage

```bash
python app.py
```

Le serveur démarre sur `http://localhost:5000`

## Endpoints API

### GET /api/health
Vérification de l'état du serveur et du modèle

### POST /api/model/load
Charge ou recharge le modèle

### POST /api/predict
Effectue une prédiction sur une image uploadée

**Paramètres:**
- `image`: Fichier image (PNG, JPG, JPEG)
- Taille max: 16MB

**Réponse:**
```json
{
  "success": true,
  "filename": "scan.jpg",
  "prediction": "Tumor",
  "confidence": 0.892,
  "processing_time": 1.23,
  "timestamp": "2024-01-15 14:30:25",
  "model_info": {
    "name": "VGG16 Brain Tumor Detection",
    "version": "1.0.0",
    "input_shape": "224x224x3"
  }
}
```

## Notes importantes

- Le modèle doit être entraîné pour accepter des images 224x224 pixels
- Les images sont automatiquement redimensionnées et normalisées
- Le serveur supporte CORS pour le frontend React
- Logs détaillés pour le debugging