#!/bin/bash

# Script d'arrêt pour l'application Brain Tumor Detection

echo "🛑 Arrêt de l'application de détection de tumeurs cérébrales..."

# Arrêter et supprimer les conteneurs
docker-compose down

echo "🧹 Nettoyage des ressources Docker..."

# Optionnel: supprimer les images (décommentez si nécessaire)
# docker-compose down --rmi all

# Optionnel: supprimer les volumes (décommentez si nécessaire)
# docker-compose down --volumes

echo "✅ Application arrêtée avec succès!"
echo ""
echo "📝 Pour redémarrer:"
echo "   ./scripts/start.sh"
echo ""
echo "🧹 Pour un nettoyage complet:"
echo "   docker-compose down --rmi all --volumes"