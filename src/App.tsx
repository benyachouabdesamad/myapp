import React, { useState, useCallback } from 'react';
import { Upload, Brain, AlertCircle, CheckCircle, Loader2, FileImage, Info } from 'lucide-react';

interface PredictionResult {
  success: boolean;
  filename: string;
  fileSize: number;
  prediction: 'Tumor' | 'No Tumor';
  confidence: number;
  processing_time: number;
  timestamp: string;
  model_info: {
    name: string;
    version: string;
    accuracy: string;
  };
}

interface ApiError {
  error: string;
  details: string;
}

function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileSelect = useCallback((file: File) => {
    // Validation du type de fichier
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      setError('Type de fichier non supporté. Veuillez utiliser JPG ou PNG.');
      return;
    }

    // Validation de la taille (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setError('Fichier trop volumineux. Taille maximum: 10MB.');
      return;
    }

    setSelectedFile(file);
    setError(null);
    setResult(null);

    // Créer l'aperçu
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      const response = await fetch('http://localhost:5000/api/predict', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        const errorData = data as ApiError;
        setError(`${errorData.error}: ${errorData.details}`);
      }
    } catch (err) {
      setError('Erreur de connexion au serveur Flask (port 5000). Assurez-vous que le backend Python est démarré et que votre modèle brain_tumor_vgg16.h5 est chargé.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetApp = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Détection de Tumeurs Cérébrales</h1>
              <p className="text-sm text-gray-600">Intelligence Artificielle Médicale - VGG16</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Zone d'upload */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Upload className="w-5 h-5 mr-2 text-blue-600" />
            Upload d'Image IRM
          </h2>

          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? 'border-blue-400 bg-blue-50'
                : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
            }`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {previewUrl ? (
              <div className="space-y-4">
                <img
                  src={previewUrl}
                  alt="Aperçu"
                  className="max-w-xs max-h-64 mx-auto rounded-lg shadow-md"
                />
                <div className="text-sm text-gray-600">
                  <p className="font-medium">{selectedFile?.name}</p>
                  <p>{selectedFile && formatFileSize(selectedFile.size)}</p>
                </div>
                <button
                  onClick={resetApp}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Changer d'image
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <FileImage className="w-12 h-12 text-gray-400 mx-auto" />
                <div>
                  <p className="text-lg text-gray-600">
                    Glissez-déposez votre image IRM ici
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    ou cliquez pour parcourir vos fichiers
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png"
                  onChange={handleFileInputChange}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Parcourir les fichiers
                </label>
                <p className="text-xs text-gray-500">
                  Formats supportés: JPG, PNG (max 10MB)
                </p>
              </div>
            )}
          </div>

          {selectedFile && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={handleUpload}
                disabled={isLoading}
                className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyse en cours...
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4 mr-2" />
                    Analyser l'image
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Messages d'erreur */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Erreur</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Résultats */}
        {result && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
              Résultats de l'Analyse
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Prédiction principale */}
              <div className="space-y-4">
                <div className={`p-6 rounded-lg border-2 ${
                  result.prediction === 'Tumor'
                    ? 'bg-red-50 border-red-200'
                    : 'bg-green-50 border-green-200'
                }`}>
                  <div className="text-center">
                    <div className={`text-3xl font-bold ${
                      result.prediction === 'Tumor' ? 'text-red-700' : 'text-green-700'
                    }`}>
                      {result.prediction === 'Tumor' ? 'Tumeur Détectée' : 'Pas de Tumeur'}
                    </div>
                    <div className="text-lg text-gray-600 mt-2">
                      Confiance: {(result.confidence * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Détails du Fichier</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p><span className="font-medium">Nom:</span> {result.filename}</p>
                    <p><span className="font-medium">Taille:</span> {formatFileSize(result.fileSize)}</p>
                    <p><span className="font-medium">Temps de traitement:</span> {result.processing_time}s</p>
                  </div>
                </div>
              </div>

              {/* Informations du modèle */}
              <div className="space-y-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                    <Info className="w-4 h-4 mr-2" />
                    Modèle IA Chargé
                  </h4>
                  <div className="space-y-1 text-sm text-blue-800">
                    <p><span className="font-medium">Modèle:</span> {result.model_info.name}</p>
                    <p><span className="font-medium">Architecture:</span> {result.model_info.architecture}</p>
                    <p><span className="font-medium">Input:</span> {result.model_info.input_shape}</p>
                    <p><span className="font-medium">Fichier:</span> brain_tumor_vgg16.keras</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Analyse Terminée</h4>
                  <p className="text-sm text-gray-600">
                    {new Date(result.timestamp).toLocaleString('fr-FR')}
                  </p>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-xs text-yellow-800">
                    <strong>Avertissement:</strong> Ces résultats sont générés par votre modèle VGG16 personnalisé. 
                    Consultez toujours un professionnel de santé qualifié 
                    pour un diagnostic médical.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <button
                onClick={resetApp}
                className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Analyser une nouvelle image
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-600">
            <p>Détection de tumeurs cérébrales - Modèle VGG16 personnalisé</p>
            <p className="mt-1">⚠️ Outil d'aide au diagnostic - Validation médicale requise</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;