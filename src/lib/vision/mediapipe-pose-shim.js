// @ts-expect-error - CJS import from node_modules
import * as mediapipePose from '../../../node_modules/@mediapipe/pose/pose.js'

const actual = mediapipePose.default || mediapipePose
export const Pose = actual.Pose || (typeof window !== 'undefined' ? window.Pose : undefined)
export const POSE_CONNECTIONS = actual.POSE_CONNECTIONS
export const POSE_LANDMARKS = actual.POSE_LANDMARKS
export const POSE_LANDMARKS_LEFT = actual.POSE_LANDMARKS_LEFT
export const POSE_LANDMARKS_RIGHT = actual.POSE_LANDMARKS_RIGHT
export const POSE_LANDMARKS_NEUTRAL = actual.POSE_LANDMARKS_NEUTRAL
export default actual
