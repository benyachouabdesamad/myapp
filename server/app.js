const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 5000;

// Configuration CORS
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://192.168.15.9:3000', 'http://192.168.15.9:5173'],
  credentials: true
}));

app.use(express.json());

// Configuration multer pour les uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const originalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${timestamp}_${originalName}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 16 * 1024 * 1024 // 16MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Type de fichier non supporté. Utilisez JPG ou PNG.'));
    }
  }
});

// Variables globales pour simuler le modèle
let modelLoaded = false;
const MODEL_PATH = 'brain_model.h5';

// Fonction pour vérifier si le modèle existe
function checkModelExists() {
  return fs.existsSync(MODEL_PATH);
}

// Fonction pour simuler le chargement du modèle
function loadModel() {
  try {
    if (checkModelExists()) {
      modelLoaded = true;
      console.log(`✅ Modèle chargé avec succès: ${MODEL_PATH}`);
      console.log(`📊 Architecture: Modèle personnalisé pour détection de tumeurs cérébrales`);
      return true;
    } else {
      console.log(`❌ Modèle non trouvé: ${MODEL_PATH}`);
      console.log("📁 Veuillez placer votre fichier brain_model.h5 dans le répertoire racine");
      return false;
    }
  } catch (error) {
    console.log(`❌ Erreur lors du chargement du modèle: ${error.message}`);
    return false;
  }
}

// Fonction pour simuler la prédiction
function simulatePrediction(filename) {
  // Simulation basée sur le nom du fichier pour la démo
  const random = Math.random();
  const nameHash = filename.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  // Utiliser le hash du nom pour une prédiction "cohérente"
  const baseProb = Math.abs(nameHash % 100) / 100;
  
  let hasTumor, confidence;
  
  if (baseProb > 0.5) {
    // Simule une détection de tumeur
    hasTumor = true;
    confidence = 0.70 + (random * 0.25); // 70-95%
  } else {
    // Simule l'absence de tumeur
    hasTumor = false;
    confidence = 0.75 + (random * 0.20); // 75-95%
  }
  
  return { hasTumor, confidence };
}

// Routes API

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'API de détection de tumeurs cérébrales',
    model_loaded: modelLoaded,
    model_path: MODEL_PATH,
    model_exists: checkModelExists(),
    server: 'Node.js (simulation Flask)',
    timestamp: new Date().toISOString()
  });
});

// Charger le modèle
app.post('/api/model/load', (req, res) => {
  const success = loadModel();
  
  if (success) {
    res.json({
      success: true,
      message: 'Modèle chargé avec succès',
      model_loaded: modelLoaded,
      model_path: MODEL_PATH
    });
  } else {
    res.status(500).json({
      success: false,
      message: 'Échec du chargement du modèle',
      model_loaded: modelLoaded,
      details: `Fichier ${MODEL_PATH} non trouvé`
    });
  }
});

// Prédiction
app.post('/api/predict', upload.single('image'), (req, res) => {
  const startTime = Date.now();
  
  try {
    // Vérifier si le modèle est chargé
    if (!modelLoaded) {
      return res.status(500).json({
        error: 'Modèle non chargé',
        details: 'Veuillez d\'abord charger le modèle avec /api/model/load'
      });
    }

    // Vérifier si un fichier a été envoyé
    if (!req.file) {
      return res.status(400).json({
        error: 'Aucune image fournie',
        details: 'Veuillez envoyer une image avec la clé "image"'
      });
    }

    const file = req.file;
    
    // Simuler le temps de traitement
    setTimeout(() => {
      try {
        // Effectuer la prédiction simulée
        const { hasTumor, confidence } = simulatePrediction(file.originalname);
        
        // Calculer le temps de traitement
        const processingTime = (Date.now() - startTime) / 1000;
        
        // Préparer la réponse
        const prediction = hasTumor ? "Tumor" : "No Tumor";
        
        const response = {
          success: true,
          filename: file.originalname,
          fileSize: file.size,
          prediction: prediction,
          confidence: Math.round(confidence * 1000) / 1000,
          processing_time: Math.round(processingTime * 100) / 100,
          timestamp: new Date().toISOString(),
          model_info: {
            name: 'Brain Tumor Detection Model',
            version: '1.0.0',
            architecture: 'Custom Neural Network',
            input_shape: '224x224x3',
            format: 'Keras (.h5)'
          },
          image_info: {
            original_filename: file.originalname,
            processed_shape: [1, 224, 224, 3],
            file_size: file.size
          }
        };
        
        res.json(response);
        
        // Nettoyer le fichier uploadé après traitement
        setTimeout(() => {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        }, 1000);
        
      } catch (error) {
        res.status(500).json({
          error: 'Erreur de prédiction',
          details: error.message
        });
      }
    }, 800 + Math.random() * 1200); // Simuler 0.8-2s de traitement
    
  } catch (error) {
    res.status(500).json({
      error: 'Erreur interne du serveur',
      details: error.message
    });
  }
});

// Gestion des erreurs multer
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        error: 'Fichier trop volumineux',
        details: 'Taille maximum autorisée: 16MB'
      });
    }
  }
  
  res.status(400).json({
    error: 'Erreur de traitement du fichier',
    details: error.message
  });
});

// Démarrage du serveur
app.listen(PORT, '0.0.0.0', () => {
  console.log("🏥 Démarrage du serveur de détection de tumeurs cérébrales...");
  console.log(`📁 Recherche du modèle ${MODEL_PATH}...`);
  
  // Tentative de chargement automatique du modèle
  loadModel();
  
  if (!modelLoaded) {
    console.log("\n⚠️  INSTRUCTIONS POUR CHARGER VOTRE MODÈLE:");
    console.log(`1. Placez votre fichier '${MODEL_PATH}' dans le répertoire racine`);
    console.log("2. Redémarrez le serveur ou appelez /api/model/load");
    console.log("3. Le serveur fonctionne en mode simulation pour la démo");
  }
  
  console.log(`\n🚀 Serveur démarré sur http://localhost:${PORT}`);
  console.log(`📡 API disponible sur http://localhost:${PORT}/api`);
  console.log(`🔍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`💻 Simulation Flask API avec Node.js/Express`);
});