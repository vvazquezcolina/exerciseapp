import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Calendar from './components/Calendar';
import ExerciseSelector from './components/ExerciseSelector';
import ExerciseTracker from './components/ExerciseTracker';
import Summary from './components/Summary';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route path="/" element={<Calendar />} />
          <Route path="/select-exercise" element={<ExerciseSelector />} />
          <Route path="/track-exercise" element={<ExerciseTracker />} />
          <Route path="/summary" element={<Summary />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App; 