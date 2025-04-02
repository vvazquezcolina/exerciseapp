import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

function ExerciseCalendar() {
  const [date, setDate] = useState(new Date());
  const [exerciseHistory, setExerciseHistory] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Load exercise history from sessionStorage
    const historyStr = sessionStorage.getItem('exerciseHistory');
    if (historyStr) {
      try {
        const history = JSON.parse(historyStr);
        setExerciseHistory(history);
      } catch (e) {
        console.error('Error parsing exercise history:', e);
      }
    }
  }, []);

  const handleDateSelect = (selectedDate) => {
    setDate(selectedDate);
  };

  const handleStartExercise = () => {
    navigate('/select-exercise', { state: { selectedDate: date } });
  };
  
  const handleViewHistory = () => {
    // Find exercises for the selected date
    const selectedDateStr = date.toDateString();
    const exercisesForDate = exerciseHistory.filter(
      exercise => new Date(exercise.date).toDateString() === selectedDateStr
    );
    
    if (exercisesForDate.length > 0) {
      // Navigate to summary with the most recent exercise for this date
      navigate('/summary', { state: exercisesForDate[exercisesForDate.length - 1] });
    } else {
      alert('No hay ejercicios registrados para esta fecha.');
    }
  };
  
  // Function to customize calendar tiles
  const tileContent = ({ date, view }) => {
    // Only customize day tiles
    if (view !== 'month') return null;
    
    // Check if there are exercises for this date
    const dateStr = date.toDateString();
    const hasExercises = exerciseHistory.some(
      exercise => new Date(exercise.date).toDateString() === dateStr
    );
    
    if (hasExercises) {
      return (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-green-500"></div>
      );
    }
    
    return null;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Exercise Tracker</h1>
      
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
        <Calendar
          onChange={handleDateSelect}
          value={date}
          className="w-full border-none"
          tileClassName="hover:bg-blue-100 relative"
          tileContent={tileContent}
        />
        
        <div className="mt-6 grid grid-cols-2 gap-4">
          <button
            onClick={handleStartExercise}
            className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Empezar ejercicio
          </button>
          
          <button
            onClick={handleViewHistory}
            className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors"
          >
            Ver historial
          </button>
        </div>
        
        {exerciseHistory.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold mb-3">Sesiones recientes</h3>
            <div className="space-y-2">
              {exerciseHistory.slice(-3).reverse().map((exercise, index) => (
                <div 
                  key={index} 
                  className="p-3 bg-gray-50 rounded border border-gray-200 hover:bg-gray-100 cursor-pointer"
                  onClick={() => navigate('/summary', { state: exercise })}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">
                      {exercise.exerciseType === 'pushups' ? 'Lagartijas' : 'Abdominales'}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(exercise.date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="mt-1 text-sm flex justify-between">
                    <span>{exercise.count} repeticiones</span>
                    <span className="text-yellow-500">
                      {'⭐'.repeat(Math.round(exercise.quality / 20))}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ExerciseCalendar; 