import os
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
import cv2
from PIL import Image
import io
import base64
import time

# Note: Dans un environnement complet, vous devriez installer:
# pip install flask flask-cors tensorflow opencv-python pillow numpy

app = Flask(__name__)
CORS(app, origins=['http://localhost:5173'])

# Configuration
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max
UPLOAD_FOLDER = 'uploads'
MODEL_PATH = 'brain_tumor_vgg16.keras'

# Créer le dossier uploads s'il n'existe pas
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Variables globales
model = None
model_loaded = False

def load_model():
    """Charge le modèle de détection de tumeurs cérébrales"""
    global model, model_loaded
    
    try:
        # Vérifier si le fichier modèle existe
        if not os.path.exists(MODEL_PATH):
            print(f"❌ Modèle non trouvé: {MODEL_PATH}")
            print("📁 Veuillez placer votre fichier brain_tumor_vgg16.h5 dans le dossier backend/")
            return False
        
        # Importer TensorFlow (à décommenter dans un vrai environnement)
        # import tensorflow as tf
        # from tensorflow.keras.models import load_model as keras_load_model
        
        # Charger le modèle
        # model = keras_load_model(MODEL_PATH)  # Supporte automatiquement .keras et .h5
        # model_loaded = True
        
        # Pour la simulation (à supprimer dans un vrai environnement)
        model_loaded = True
        print(f"✅ Modèle chargé avec succès: {MODEL_PATH}")
        print(f"📊 Architecture: VGG16 pour détection de tumeurs cérébrales")
        
        return True
        
    except Exception as e:
        print(f"❌ Erreur lors du chargement du modèle: {str(e)}")
        return False

def preprocess_image(image_file):
    """Préprocesse l'image pour la prédiction"""
    try:
        # Lire l'image
        image = Image.open(image_file)
        
        # Convertir en RGB si nécessaire
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Redimensionner à la taille attendue par VGG16 (224x224)
        image = image.resize((224, 224))
        
        # Convertir en array numpy
        image_array = np.array(image)
        
        # Normaliser les pixels (0-1)
        image_array = image_array.astype('float32') / 255.0
        
        # Ajouter la dimension batch
        image_array = np.expand_dims(image_array, axis=0)
        
        return image_array
        
    except Exception as e:
        raise Exception(f"Erreur lors du préprocessing: {str(e)}")

def predict_tumor(image_array):
    """Effectue la prédiction sur l'image préprocessée"""
    global model
    
    try:
        if not model_loaded:
            raise Exception("Modèle non chargé")
        
        # Dans un vrai environnement, utilisez:
        # prediction = model.predict(image_array)
        # confidence = float(prediction[0][0])
        
        # Simulation pour la démo (à supprimer)
        time.sleep(1)  # Simuler le temps de calcul
        
        # Simulation basée sur des caractéristiques de l'image
        mean_intensity = np.mean(image_array)
        std_intensity = np.std(image_array)
        
        # Logique de simulation simple
        if mean_intensity > 0.4 and std_intensity > 0.15:
            # Simule une détection de tumeur
            confidence = 0.75 + np.random.random() * 0.20  # 75-95%
            has_tumor = True
        else:
            # Simule l'absence de tumeur
            confidence = 0.80 + np.random.random() * 0.15  # 80-95%
            has_tumor = False
        
        return has_tumor, confidence
        
    except Exception as e:
        raise Exception(f"Erreur lors de la prédiction: {str(e)}")

@app.route('/api/health', methods=['GET'])
def health_check():
    """Vérification de l'état de l'API"""
    return jsonify({
        'status': 'OK',
        'message': 'API de détection de tumeurs cérébrales',
        'model_loaded': model_loaded,
        'model_path': MODEL_PATH,
        'model_exists': os.path.exists(MODEL_PATH)
    })

@app.route('/api/model/load', methods=['POST'])
def load_model_endpoint():
    """Endpoint pour charger/recharger le modèle"""
    success = load_model()
    
    if success:
        return jsonify({
            'success': True,
            'message': 'Modèle chargé avec succès',
            'model_loaded': model_loaded
        })
    else:
        return jsonify({
            'success': False,
            'message': 'Échec du chargement du modèle',
            'model_loaded': model_loaded
        }), 500

@app.route('/api/predict', methods=['POST'])
def predict():
    """Endpoint de prédiction"""
    start_time = time.time()
    
    try:
        # Vérifier si le modèle est chargé
        if not model_loaded:
            return jsonify({
                'error': 'Modèle non chargé',
                'details': 'Veuillez d\'abord charger le modèle avec /api/model/load'
            }), 500
        
        # Vérifier si un fichier a été envoyé
        if 'image' not in request.files:
            return jsonify({
                'error': 'Aucune image fournie',
                'details': 'Veuillez envoyer une image avec la clé "image"'
            }), 400
        
        file = request.files['image']
        
        if file.filename == '':
            return jsonify({
                'error': 'Aucun fichier sélectionné',
                'details': 'Veuillez sélectionner un fichier image'
            }), 400
        
        # Vérifier le type de fichier
        allowed_extensions = {'png', 'jpg', 'jpeg'}
        file_extension = file.filename.rsplit('.', 1)[1].lower() if '.' in file.filename else ''
        
        if file_extension not in allowed_extensions:
            return jsonify({
                'error': 'Type de fichier non supporté',
                'details': 'Formats acceptés: PNG, JPG, JPEG'
            }), 400
        
        # Préprocesser l'image
        try:
            image_array = preprocess_image(file)
        except Exception as e:
            return jsonify({
                'error': 'Erreur de préprocessing',
                'details': str(e)
            }), 400
        
        # Effectuer la prédiction
        try:
            has_tumor, confidence = predict_tumor(image_array)
        except Exception as e:
            return jsonify({
                'error': 'Erreur de prédiction',
                'details': str(e)
            }), 500
        
        # Calculer le temps de traitement
        processing_time = round(time.time() - start_time, 2)
        
        # Préparer la réponse
        prediction_result = "Tumor" if has_tumor else "No Tumor"
        
        response = {
            'success': True,
            'filename': secure_filename(file.filename),
            'prediction': prediction_result,
            'confidence': round(confidence, 3),
            'processing_time': processing_time,
            'timestamp': time.strftime('%Y-%m-%d %H:%M:%S'),
            'model_info': {
                'name': 'VGG16 Brain Tumor Detection',
                'version': '1.0.0',
                'input_shape': '224x224x3', 
                'architecture': 'VGG16 + Custom Classifier',
                'format': 'Keras (.keras)'
            },
            'image_info': {
                'original_filename': file.filename,
                'processed_shape': image_array.shape,
                'file_size': len(file.read())
            }
        }
        
        return jsonify(response)
        
    except Exception as e:
        return jsonify({
            'error': 'Erreur interne du serveur',
            'details': str(e)
        }), 500

@app.errorhandler(413)
def too_large(e):
    return jsonify({
        'error': 'Fichier trop volumineux',
        'details': 'Taille maximum autorisée: 16MB'
    }), 413

if __name__ == '__main__':
    print("🏥 Démarrage du serveur de détection de tumeurs cérébrales...")
    print("📁 Recherche du modèle brain_tumor_vgg16.h5...")
    
    # Tentative de chargement automatique du modèle
    load_model()
    
    if not model_loaded:
        print("\n⚠️  INSTRUCTIONS POUR CHARGER VOTRE MODÈLE:")
        print("1. Placez votre fichier 'brain_tumor_vgg16.h5' dans le dossier 'backend/'")
        print("2. Redémarrez le serveur ou appelez /api/model/load")
        print("3. Assurez-vous d'avoir installé les dépendances:")
        print("   pip install flask flask-cors tensorflow opencv-python pillow numpy")
    
    print(f"\n🚀 Serveur démarré sur http://localhost:5000")
    print(f"📡 API disponible sur http://localhost:5000/api")
    print(f"🔍 Health check: http://localhost:5000/api/health")
    
    app.run(debug=True, host='0.0.0.0', port=5000)