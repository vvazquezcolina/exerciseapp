// Import posenet for getAdjacentKeyPoints
import * as posenet from '@tensorflow-models/posenet';

// Helper function to convert keypoint coordinates to canvas coordinates
const toTuple = ({ y, x }) => {
  return [y, x];
}

// Draws a single point on the canvas
function drawPoint(ctx, y, x, r, color) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2 * Math.PI);
  ctx.fillStyle = color;
  ctx.fill();
}

// Draws a line segment on the canvas
function drawSegment([ay, ax], [by, bx], color, scale, ctx) {
  ctx.beginPath();
  ctx.moveTo(ax * scale, ay * scale);
  ctx.lineTo(bx * scale, by * scale);
  ctx.lineWidth = 2;
  ctx.strokeStyle = color;
  ctx.stroke();
}

// Draws keypoints on the canvas
export function drawKeypoints(keypoints, minConfidence, ctx, scale = 1) {
  for (let i = 0; i < keypoints.length; i++) {
    const keypoint = keypoints[i];

    if (keypoint.score < minConfidence) {
      continue;
    }

    const { y, x } = keypoint.position;
    drawPoint(ctx, y * scale, x * scale, 3, 'aqua');
  }
}

// Defines adjacent keypoints for drawing the skeleton
function getAdjacentKeyPoints(keypoints, minConfidence) {
  // Now posenet is defined because the import is at the top
  return posenet.getAdjacentKeyPoints(keypoints, minConfidence);
}

// Draws the skeleton on the canvas
export function drawSkeleton(keypoints, minConfidence, ctx, scale = 1) {
  const adjacentKeyPoints = getAdjacentKeyPoints(keypoints, minConfidence);

  adjacentKeyPoints.forEach((keypoints) => {
    drawSegment(
      toTuple(keypoints[0].position),
      toTuple(keypoints[1].position),
      'aqua',
      scale,
      ctx
    );
  });
} 