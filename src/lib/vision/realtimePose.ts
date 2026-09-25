import * as poseDetection from '@tensorflow-models/pose-detection'
import '@tensorflow/tfjs-backend-webgl'
import '@tensorflow/tfjs-core'
import type { Point2D } from '../biomechanics/angleCalculators'

let detectorInstance: poseDetection.PoseDetector | null = null
let isInitializing = false

/**
 * Initializes MoveNet SinglePose Lightning detector
 */
export async function getPoseDetector(): Promise<poseDetection.PoseDetector> {
  if (detectorInstance) return detectorInstance
  if (isInitializing) {
    while (isInitializing) {
      await new Promise((r) => setTimeout(r, 50))
    }
    if (detectorInstance) return detectorInstance
  }

  isInitializing = true
  try {
    const detector = await poseDetection.createDetector(
      poseDetection.SupportedModels.MoveNet,
      {
        modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
        enableSmoothing: true,
      }
    )
    detectorInstance = detector
    return detector
  } finally {
    isInitializing = false
  }
}

export interface ExtractedSwimmerJoints {
  leftShoulder?: Point2D
  rightShoulder?: Point2D
  leftElbow?: Point2D
  rightElbow?: Point2D
  leftWrist?: Point2D
  rightWrist?: Point2D
  leftHip?: Point2D
  rightHip?: Point2D
  allKeypoints: poseDetection.Keypoint[]
}

/**
 * Extracts normalized swimmer landmarks from MoveNet detection
 */
export function extractSwimmerJoints(pose: poseDetection.Pose): ExtractedSwimmerJoints {
  const joints: ExtractedSwimmerJoints = { allKeypoints: pose.keypoints }

  for (const kp of pose.keypoints) {
    const minScore = 0.3
    if ((kp.score ?? 0) < minScore) continue

    const pt: Point2D = { x: kp.x, y: kp.y, score: kp.score }

    if (kp.name === 'left_shoulder') joints.leftShoulder = pt
    if (kp.name === 'right_shoulder') joints.rightShoulder = pt
    if (kp.name === 'left_elbow') joints.leftElbow = pt
    if (kp.name === 'right_elbow') joints.rightElbow = pt
    if (kp.name === 'left_wrist') joints.leftWrist = pt
    if (kp.name === 'right_wrist') joints.rightWrist = pt
    if (kp.name === 'left_hip') joints.leftHip = pt
    if (kp.name === 'right_hip') joints.rightHip = pt
  }

  return joints
}

/**
 * Draws real-time skeleton overlay on target canvas (Monochrome Classy Aesthetic)
 */
export function drawSkeleton(
  ctx: CanvasRenderingContext2D,
  joints: ExtractedSwimmerJoints,
  width: number,
  height: number,
  color = '#ffffff'
): void {
  ctx.clearRect(0, 0, width, height)

  const pairs: [Point2D | undefined, Point2D | undefined][] = [
    // Left arm
    [joints.leftShoulder, joints.leftElbow],
    [joints.leftElbow, joints.leftWrist],
    // Right arm
    [joints.rightShoulder, joints.rightElbow],
    [joints.rightElbow, joints.rightWrist],
    // Torso
    [joints.leftShoulder, joints.rightShoulder],
    [joints.leftShoulder, joints.leftHip],
    [joints.rightShoulder, joints.rightHip],
    [joints.leftHip, joints.rightHip],
  ]

  ctx.lineWidth = 3
  ctx.strokeStyle = color
  ctx.lineCap = 'round'

  // Draw bones
  for (const [p1, p2] of pairs) {
    if (p1 && p2) {
      ctx.beginPath()
      ctx.moveTo(p1.x, p1.y)
      ctx.lineTo(p2.x, p2.y)
      ctx.stroke()
    }
  }

  // Draw joints
  for (const kp of joints.allKeypoints) {
    if ((kp.score ?? 0) >= 0.3) {
      ctx.beginPath()
      ctx.arc(kp.x, kp.y, 5, 0, 2 * Math.PI)
      ctx.fillStyle = '#ffffff'
      ctx.fill()
      ctx.lineWidth = 2
      ctx.strokeStyle = '#000000'
      ctx.stroke()
    }
  }
}
