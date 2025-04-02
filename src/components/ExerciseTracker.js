import React, { useRef, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import * as posenet from '@tensorflow-models/posenet';
import * as tf from '@tensorflow/tfjs';
// Import backends
import '@tensorflow/tfjs-backend-webgl';
import '@tensorflow/tfjs-backend-cpu';
// Import drawing utility
import { drawKeypoints, drawSkeleton } from './utils/poseUtils'; // We'll create this file

// Ensure at least one backend is registered
tf.setBackend('webgl').catch(() => {
  console.log('WebGL backend failed, falling back to CPU');
  tf.setBackend('cpu');
});

const VIDEO_WIDTH = 640;
const VIDEO_HEIGHT = 480;

function ExerciseTracker() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null); // Ref for the canvas
  const [count, setCount] = useState(0);
  const [quality, setQuality] = useState(0);
  const [net, setNet] = useState(null);
  const [repState, setRepState] = useState('up'); // 'up' or 'down' for tracking reps
  const location = useLocation();
  const navigate = useNavigate();
  const exerciseType = location.state?.exerciseType;
  const selectedDate = location.state?.selectedDate || new Date();
  
  // Refs to persist values between renders without causing effects
  const lastPoseRef = useRef(null);
  const qualityScoresRef = useRef([]);

  // Check if camera access is granted
  const [cameraAccess, setCameraAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tfBackendReady, setTfBackendReady] = useState(false);

  useEffect(() => {
    // Initialize TensorFlow.js backend
    async function setupBackend() {
      try {
        await tf.ready();
        console.log('TensorFlow backend ready:', tf.getBackend());
        setTfBackendReady(true);
      } catch (error) {
        console.error('Error initializing TensorFlow backend:', error);
      }
    }
    
    setupBackend();
  }, []);

  useEffect(() => {
    if (!exerciseType) {
      navigate('/select-exercise');
      return;
    }

    // Check for camera access
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        setCameraAccess(true);
        stream.getTracks().forEach(track => track.stop()); // Stop the stream
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error accessing camera: ", err);
        setCameraAccess(false);
        setLoading(false);
        alert("No se pudo acceder a la cámara. Por favor, otorga permisos para continuar.");
      });

    if (!tfBackendReady) return;

    const loadPoseNet = async () => {
      try {
        console.log('Loading PoseNet model...');
        const loadedNet = await posenet.load({
          architecture: 'MobileNetV1',
          outputStride: 16,
          inputResolution: { width: VIDEO_WIDTH, height: VIDEO_HEIGHT },
          multiplier: 0.75
        });
        
        console.log('PoseNet model loaded successfully');
        setNet(loadedNet);
      } catch (error) {
        console.error('Error loading PoseNet model:', error);
        alert('Error al cargar el modelo de detección de postura. Por favor, recarga la página.');
      }
    };

    loadPoseNet();
    
    return () => {
      // Clean up when component unmounts
      setRepState('up');
      setCount(0);
      setQuality(0);
      qualityScoresRef.current = [];
    };
  }, [exerciseType, navigate, tfBackendReady]);

  useEffect(() => {
    if (!net || !webcamRef.current || !cameraAccess || !canvasRef.current) return;
    
    let requestId;
    const ctx = canvasRef.current.getContext('2d');
    
    const detectPose = async () => {
      if (webcamRef.current && webcamRef.current.video && webcamRef.current.video.readyState === 4) {
        try {
          const pose = await net.estimateSinglePose(webcamRef.current.video);
          
          analyzePose(pose);
          drawPoseOnCanvas(pose, ctx);
          lastPoseRef.current = pose;
        } catch (error) {
          console.error('Error detecting pose:', error);
        }
        
        requestId = requestAnimationFrame(detectPose);
      } else {
        requestId = requestAnimationFrame(detectPose);
      }
    };

    detectPose();
    
    return () => {
      if (requestId) {
        cancelAnimationFrame(requestId);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [net, cameraAccess]); // Added analyzePose to dependency array if needed

  const drawPoseOnCanvas = (pose, ctx) => {
    ctx.clearRect(0, 0, VIDEO_WIDTH, VIDEO_HEIGHT); // Clear previous drawings
    if (pose && pose.keypoints) {
      // Draw keypoints
      drawKeypoints(pose.keypoints, 0.5, ctx);
      // Draw skeleton
      drawSkeleton(pose.keypoints, 0.5, ctx);
    }
  };

  const analyzePose = (pose) => {
    if (!pose || pose.score < 0.3) return; // Ignore low confidence poses
    
    if (exerciseType === 'pushups') {
      analyzePushups(pose);
    } else if (exerciseType === 'abdominals') {
      analyzeAbdominals(pose);
    }
    
    // Calculate an average quality score from recent frames
    if (qualityScoresRef.current.length > 10) {
      qualityScoresRef.current.shift(); // Remove oldest score
    }
    
    const avgQuality = qualityScoresRef.current.reduce((sum, score) => sum + score, 0) / 
                      (qualityScoresRef.current.length || 1);
    
    setQuality(avgQuality);
  };
  
  const analyzePushups = (pose) => {
    // Get key points for push-up detection
    const leftShoulder = pose.keypoints.find(kp => kp.part === 'leftShoulder');
    const rightShoulder = pose.keypoints.find(kp => kp.part === 'rightShoulder');
    const leftElbow = pose.keypoints.find(kp => kp.part === 'leftElbow');
    const rightElbow = pose.keypoints.find(kp => kp.part === 'rightElbow');
    const leftWrist = pose.keypoints.find(kp => kp.part === 'leftWrist');
    const rightWrist = pose.keypoints.find(kp => kp.part === 'rightWrist');
    
    if (!leftShoulder || !rightShoulder || !leftElbow || !rightElbow || !leftWrist || !rightWrist) {
      return;
    }
    
    // Calculate arm angles
    const leftArmAngle = calculateAngle(
      leftShoulder.position,
      leftElbow.position,
      leftWrist.position
    );
    
    const rightArmAngle = calculateAngle(
      rightShoulder.position,
      rightElbow.position,
      rightWrist.position
    );
    
    // Average the two angles
    const avgArmAngle = (leftArmAngle + rightArmAngle) / 2;
    
    // Determine push-up state and count reps
    if (repState === 'up' && avgArmAngle < 60) {
      // Transition from up to down
      setRepState('down');
    } else if (repState === 'down' && avgArmAngle > 130) {
      // Completed a rep
      setRepState('up');
      setCount(prevCount => prevCount + 1);
    }
    
    // Calculate quality based on form
    // For push-ups, we want arms at about 90 degrees at the bottom
    // and straight (180 degrees) at the top
    let qualityScore;
    
    if (repState === 'down') {
      // In down position, a 90 degree angle is ideal
      qualityScore = 100 - Math.min(100, Math.abs(90 - avgArmAngle));
    } else {
      // In up position, a 180 degree angle is ideal
      qualityScore = 100 - Math.min(100, Math.abs(180 - avgArmAngle) * 1.5);
    }
    
    qualityScoresRef.current.push(qualityScore);
  };
  
  const analyzeAbdominals = (pose) => {
    // Get key points for abdominals detection
    const leftShoulder = pose.keypoints.find(kp => kp.part === 'leftShoulder');
    const rightShoulder = pose.keypoints.find(kp => kp.part === 'rightShoulder');
    const leftHip = pose.keypoints.find(kp => kp.part === 'leftHip');
    const rightHip = pose.keypoints.find(kp => kp.part === 'rightHip');
    const leftKnee = pose.keypoints.find(kp => kp.part === 'leftKnee');
    const rightKnee = pose.keypoints.find(kp => kp.part === 'rightKnee');
    
    if (!leftShoulder || !rightShoulder || !leftHip || !rightHip || !leftKnee || !rightKnee) {
      return;
    }
    
    // Calculate torso-to-leg angle for both sides
    const leftTorsoLegAngle = calculateAngle(
      leftShoulder.position,
      leftHip.position,
      leftKnee.position
    );
    
    const rightTorsoLegAngle = calculateAngle(
      rightShoulder.position,
      rightHip.position,
      rightKnee.position
    );
    
    // Average the two angles
    const avgTorsoLegAngle = (leftTorsoLegAngle + rightTorsoLegAngle) / 2;
    
    // Determine sit-up state and count reps
    if (repState === 'down' && avgTorsoLegAngle < 90) {
      // Transition from down to up (sit-up position)
      setRepState('up');
      setCount(prevCount => prevCount + 1);
    } else if (repState === 'up' && avgTorsoLegAngle > 150) {
      // Back to starting position
      setRepState('down');
    }
    
    // Calculate quality based on form
    // For sit-ups, we want a 45-60 degree angle at the top
    // and 180 degrees (flat) at the bottom
    let qualityScore;
    
    if (repState === 'up') {
      // In up position, a 60 degree angle is ideal
      qualityScore = 100 - Math.min(100, Math.abs(60 - avgTorsoLegAngle) * 1.5);
    } else {
      // In down position, a 180 degree angle is ideal
      qualityScore = 100 - Math.min(100, Math.abs(180 - avgTorsoLegAngle));
    }
    
    qualityScoresRef.current.push(qualityScore);
  };

  const calculateAngle = (point1, point2, point3) => {
    const radians = Math.atan2(point3.y - point2.y, point3.x - point2.x) -
                   Math.atan2(point1.y - point2.y, point1.x - point2.x);
    let angle = Math.abs(radians * 180.0 / Math.PI);
    // Ensure angle is within 0-180 range for consistency
    if (angle > 180) {
        angle = 360 - angle;
    }
    return angle;
  };

  const handleFinish = () => {
    // Save exercise data
    const exerciseData = {
      exerciseType,
      count,
      quality,
      date: selectedDate
    };
    
    // Store in session storage for demo
    const existingDataStr = sessionStorage.getItem('exerciseHistory') || '[]';
    const existingData = JSON.parse(existingDataStr);
    existingData.push(exerciseData);
    sessionStorage.setItem('exerciseHistory', JSON.stringify(existingData));
    
    // Navigate to summary
    navigate('/summary', { state: exerciseData });
  };
  
  const handleBack = () => {
    navigate('/select-exercise', { state: { selectedDate: selectedDate } });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Cargando...</h2>
        <p>Inicializando el seguimiento de ejercicios...</p>
      </div>
    );
  }

  if (!cameraAccess) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Se requiere acceso a la cámara</h2>
        <p className="mb-6">Para contar repeticiones y evaluar la calidad del ejercicio, necesitamos acceso a tu cámara.</p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
        >
          Reintentar
        </button>
        <button 
          onClick={() => navigate('/select-exercise', { state: { selectedDate: selectedDate } })}
          className="ml-4 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Volver
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-4">
          {exerciseType === 'pushups' ? 'Lagartijas' : 'Abdominales'}
        </h2>
        <p className="text-center text-gray-600 mb-6">
          {selectedDate.toLocaleDateString()}
        </p>

        <div className="relative w-full max-w-full aspect-video mx-auto">
          <Webcam
            ref={webcamRef}
            audio={false}
            width={VIDEO_WIDTH}
            height={VIDEO_HEIGHT}
            videoConstraints={{
              width: VIDEO_WIDTH,
              height: VIDEO_HEIGHT,
              facingMode: "user"
            }}
            className="absolute top-0 left-0 w-full h-full rounded-lg shadow-lg"
            style={{ transform: 'scaleX(-1)' }} // Mirror the webcam image
          />
          
          <canvas
            ref={canvasRef}
            width={VIDEO_WIDTH}
            height={VIDEO_HEIGHT}
            className="absolute top-0 left-0 w-full h-full rounded-lg"
            style={{ transform: 'scaleX(-1)' }} // Mirror the canvas to match the video
          />
          
          <div className="absolute top-4 right-4 bg-black bg-opacity-70 text-white px-4 py-3 rounded-lg z-10">
            <p className="font-bold">Repeticiones: <span className="text-xl">{count}</span></p>
            <p>Calidad: <span className="text-yellow-400">{quality.toFixed(1)}%</span></p>
            <p className="text-xs opacity-75">Estado: {repState === 'up' ? 'Arriba' : 'Abajo'}</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <button
            onClick={handleBack}
            className="bg-gray-200 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Volver
          </button>
          
          <button
            onClick={handleFinish}
            className="bg-red-500 text-white py-3 px-4 rounded-lg hover:bg-red-600 transition-colors font-semibold"
          >
            Terminar sesión
          </button>
        </div>
      </div>
    </div>
  );
}

export default ExerciseTracker; 