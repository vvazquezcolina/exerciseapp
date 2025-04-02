import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function Summary() {
  const location = useLocation();
  const navigate = useNavigate();
  const { exerciseType, count, quality, date } = location.state || {};

  if (!exerciseType) {
    navigate('/');
    return null;
  }

  const getQualityMessage = (quality) => {
    if (quality >= 90) return "¡Excelente forma! Mantuviste una postura ideal durante el ejercicio.";
    if (quality >= 75) return "¡Buen ritmo! Tu técnica es consistente pero hay margen de mejora.";
    if (quality >= 60) return "Regular, intenta mejorar la postura y mantener la técnica correcta.";
    return "Necesitas mejorar la técnica. Enfócate en la forma correcta antes de aumentar repeticiones.";
  };

  const getStars = (quality) => {
    const stars = Math.round(quality / 20);
    return "⭐".repeat(stars);
  };
  
  const getExerciseTips = (exerciseType) => {
    if (exerciseType === 'pushups') {
      return [
        "Mantén la espalda recta durante todo el movimiento",
        "Los codos deben formar un ángulo de 90° en la posición baja",
        "Respira de manera controlada: inhala al bajar, exhala al subir"
      ];
    } else {
      return [
        "Mantén el core activado durante todo el ejercicio",
        "No tires del cuello al subir, el movimiento debe venir del abdomen",
        "Controla la velocidad del movimiento para mayor efectividad"
      ];
    }
  };
  
  const handleNewExercise = () => {
    navigate('/select-exercise', { state: { selectedDate: new Date(date) } });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-center mb-8">Resumen de la sesión</h2>

        <div className="space-y-6">
          <div className="text-center">
            <p className="text-gray-600">Ejercicio</p>
            <p className="text-xl font-semibold">
              {exerciseType === 'pushups' ? 'Lagartijas' : 'Abdominales'}
            </p>
          </div>

          <div className="text-center">
            <p className="text-gray-600">Fecha</p>
            <p className="text-xl font-semibold">
              {new Date(date).toLocaleDateString()}
            </p>
          </div>

          <div className="text-center">
            <p className="text-gray-600">Repeticiones totales</p>
            <p className="text-3xl font-bold text-blue-500">{count}</p>
          </div>

          <div className="text-center">
            <p className="text-gray-600">Calidad del ejercicio</p>
            <p className="text-2xl font-bold text-yellow-500">{getStars(quality)}</p>
            <p className="text-lg">{quality.toFixed(1)}%</p>
            <p className="text-gray-700 italic mt-2">{getQualityMessage(quality)}</p>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="font-semibold text-blue-800 mb-2">Consejos para mejorar</p>
            <ul className="text-blue-700 text-sm space-y-1">
              {getExerciseTips(exerciseType).map((tip, index) => (
                <li key={index} className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4">
          <button
            onClick={() => navigate('/')}
            className="bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Volver al calendario
          </button>
          
          <button
            onClick={handleNewExercise}
            className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Nuevo ejercicio
          </button>
        </div>
      </div>
    </div>
  );
}

export default Summary; 