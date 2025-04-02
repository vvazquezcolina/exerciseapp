import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function ExerciseSelector() {
  const location = useLocation();
  const navigate = useNavigate();
  const selectedDate = location.state?.selectedDate || new Date();

  const exercises = [
    {
      id: 'pushups',
      name: 'Lagartijas',
      description: 'Ejercicio de fuerza para brazos y pecho',
      icon: '💪'
    },
    {
      id: 'abdominals',
      name: 'Abdominales',
      description: 'Ejercicio para fortalecer el core',
      icon: '🏋️'
    }
  ];

  const handleExerciseSelect = (exerciseId) => {
    navigate('/track-exercise', { 
      state: { 
        exerciseType: exerciseId,
        selectedDate: selectedDate
      } 
    });
  };
  
  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-center mb-8">Selecciona tu ejercicio</h2>
      <p className="text-center text-gray-600 mb-6">
        Fecha: {selectedDate.toLocaleDateString()}
      </p>
      
      <div className="grid gap-6 max-w-md mx-auto">
        {exercises.map((exercise) => (
          <button
            key={exercise.id}
            onClick={() => handleExerciseSelect(exercise.id)}
            className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow flex items-center space-x-4"
          >
            <span className="text-4xl">{exercise.icon}</span>
            <div className="text-left">
              <h3 className="text-xl font-semibold">{exercise.name}</h3>
              <p className="text-gray-600">{exercise.description}</p>
            </div>
          </button>
        ))}
      </div>
      
      <div className="mt-8 text-center">
        <button
          onClick={handleBack}
          className="text-gray-600 hover:text-gray-800"
        >
          Volver al calendario
        </button>
      </div>
    </div>
  );
}

export default ExerciseSelector; 