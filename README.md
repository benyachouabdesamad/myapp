# 🏥 Application de Détection de Tumeurs Cérébrales

Application complète utilisant l'intelligence artificielle pour détecter les tumeurs cérébrales sur images IRM.

## 🚀 Démarrage Rapide avec Docker

### Prérequis
- Docker et Docker Compose installés
- Votre modèle `brain_tumor_vgg16.h5` entraîné

### Installation

1. **Cloner le projet**
```bash
git clone <votre-repo>
cd brain-tumor-detection
```

2. **Placer votre modèle**
```bash
# Copiez votre modèle dans le dossier backend
cp /chemin/vers/votre/brain_tumor_vgg16.h5 backend/
```

3. **Démarrer l'application**
```bash
# Rendre le script exécutable
chmod +x scripts/start.sh

# Démarrer
./scripts/start.sh
```

4. **Accéder à l'application**
- Frontend: http://localhost:3000
- API Backend: http://localhost:5000
- Health Check: http://localhost:5000/api/health

## 🛠️ Commandes Docker

### Démarrage
```bash
# Démarrage complet
docker-compose up -d

# Avec reconstruction des images
docker-compose up --build -d
```

### Gestion
```bash
# Voir les logs
docker-compose logs -f

# Logs d'un service spécifique
docker-compose logs -f backend
docker-compose logs -f frontend

# Redémarrer un service
docker-compose restart backend

# Arrêter
docker-compose down
```

### Debug
```bash
# Accéder au conteneur backend
docker-compose exec backend bash

# Accéder au conteneur frontend
docker-compose exec frontend sh

# Vérifier l'état des conteneurs
docker-compose ps
```

## 📁 Structure du Projet

```
brain-tumor-detection/
├── backend/                 # Backend Flask
│   ├── app.py              # Application principale
│   ├── requirements.txt    # Dépendances Python
│   ├── Dockerfile         # Image Docker backend
│   ├── uploads/           # Dossier uploads (volume)
│   └── brain_tumor_vgg16.h5  # Votre modèle (à ajouter)
├── src/                    # Frontend React
│   ├── App.tsx            # Composant principal
│   └── ...
├── scripts/               # Scripts utilitaires
│   ├── start.sh          # Démarrage automatique
│   └── stop.sh           # Arrêt automatique
├── docker-compose.yml    # Configuration Docker Compose
├── Dockerfile.frontend   # Image Docker frontend
└── nginx.conf           # Configuration Nginx
```

## 🔧 Configuration

### Variables d'environnement

**Backend (Flask)**
- `FLASK_ENV`: Environnement (production/development)
- `FLASK_DEBUG`: Mode debug (0/1)

**Frontend (React)**
- `REACT_APP_API_URL`: URL de l'API backend

### Ports
- Frontend: 3000
- Backend: 5000

## 📊 API Endpoints

### GET /api/health
Vérification de l'état du serveur et du modèle

**Réponse:**
```json
{
  "status": "OK",
  "message": "API de détection de tumeurs cérébrales",
  "model_loaded": true,
  "model_path": "brain_tumor_vgg16.h5"
}
```

### POST /api/predict
Prédiction sur une image IRM

**Paramètres:**
- `image`: Fichier image (PNG, JPG, JPEG, max 16MB)

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

## 🔒 Sécurité

- Validation des types de fichiers
- Limitation de taille des uploads (16MB)
- Sanitisation des noms de fichiers
- CORS configuré pour le frontend
- Isolation des conteneurs Docker

## 🚨 Dépannage

### Le modèle ne se charge pas
```bash
# Vérifier que le fichier existe
ls -la backend/brain_tumor_vgg16.h5

# Vérifier les logs du backend
docker-compose logs backend
```

### Erreur de connexion frontend/backend
```bash
# Vérifier que les conteneurs communiquent
docker-compose exec frontend ping backend

# Vérifier la configuration réseau
docker network ls
```

### Problèmes de permissions
```bash
# Donner les bonnes permissions au dossier uploads
chmod 755 backend/uploads
```

## 📈 Monitoring

### Health Checks
```bash
# Vérifier l'état de l'API
curl http://localhost:5000/api/health

# Vérifier l'état du frontend
curl http://localhost:3000
```

### Logs
```bash
# Logs en temps réel
docker-compose logs -f

# Logs avec timestamps
docker-compose logs -t
```

## 🛡️ Production

Pour un déploiement en production:

1. **Sécurité**
   - Changer les secrets par défaut
   - Configurer HTTPS
   - Limiter les CORS origins

2. **Performance**
   - Utiliser un reverse proxy (Nginx/Traefik)
   - Configurer la mise en cache
   - Optimiser les images Docker

3. **Monitoring**
   - Ajouter des métriques (Prometheus)
   - Configurer les alertes
   - Logs centralisés

## ⚠️ Avertissements

- **Usage médical**: Cet outil est destiné à l'aide au diagnostic uniquement
- **Validation**: Toujours faire valider par un professionnel de santé
- **Données**: Respecter la confidentialité des données médicales
- **Réglementation**: Vérifier la conformité aux réglementations locales

## 📞 Support

Pour toute question ou problème:
1. Vérifier les logs: `docker-compose logs`
2. Consulter la documentation API
3. Vérifier les issues GitHub