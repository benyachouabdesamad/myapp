#!/bin/bash

# Script de démarrage pour l'application Brain Tumor Detection

echo "🏥 Démarrage de l'application de détection de tumeurs cérébrales..."

# Vérifier si Docker est installé
if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé. Veuillez installer Docker d'abord."
    exit 1
fi

# Vérifier si docker-compose est installé
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose n'est pas installé. Veuillez installer Docker Compose d'abord."
    exit 1
fi

# Vérifier si le modèle existe
if [ ! -f "backend/brain_model.h5" ]; then
    echo "⚠️  ATTENTION: Le fichier modèle 'brain_model.h5' n'a pas été trouvé dans backend/"
    echo "📁 Veuillez placer votre modèle dans backend/brain_model.h5 avant de continuer."
    read -p "Voulez-vous continuer sans le modèle (mode simulation) ? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Arrêt du démarrage. Placez votre modèle et relancez."
        exit 1
    fi
    echo "⚠️  Démarrage en mode simulation..."
fi

# Construire et démarrer les conteneurs
echo "🔨 Construction des images Docker..."
docker-compose build

echo "🚀 Démarrage des services..."
docker-compose up -d

# Attendre que les services soient prêts
echo "⏳ Attente du démarrage des services..."
sleep 10

# Vérifier l'état des services
echo "🔍 Vérification de l'état des services..."

# Vérifier le backend
if curl -f http://localhost:5000/api/health &> /dev/null; then
    echo "✅ Backend Flask: OK (http://localhost:5000)"
else
    echo "❌ Backend Flask: Erreur"
fi

# Vérifier le frontend
if curl -f http://localhost:3000 &> /dev/null; then
    echo "✅ Frontend React: OK (http://localhost:3000)"
else
    echo "❌ Frontend React: Erreur"
fi

echo ""
echo "🎉 Application démarrée avec succès!"
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 API Backend: http://localhost:5000"
echo "📊 Health Check: http://localhost:5000/api/health"
echo ""
echo "📝 Commandes utiles:"
echo "   - Voir les logs: docker-compose logs -f"
echo "   - Arrêter: docker-compose down"
echo "   - Redémarrer: docker-compose restart"
echo ""
echo "📁 Pour ajouter votre modèle:"
echo "   1. Placez brain_model.h5 dans backend/"
echo "   2. Redémarrez: docker-compose restart backend"