export interface Point2D {
  x: number
  y: number
  score?: number
}

/**
 * Calculates the interior angle in degrees at vertex B formed by points A - B - C
 */
export function calculateAngle(a: Point2D, b: Point2D, c: Point2D): number {
  const radians =
    Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x)
  let angle = Math.abs((radians * 180.0) / Math.PI)

  if (angle > 180.0) {
    angle = 360.0 - angle
  }

  return Math.round(angle * 10) / 10
}

/**
 * Early Vertical Forearm (EVF) Catch Angle Analysis
 * Vertex is the elbow (Shoulder -> Elbow -> Wrist)
 */
export function calculateEarlyVerticalForearm(
  shoulder: Point2D,
  elbow: Point2D,
  wrist: Point2D
): {
  angle: number
  status: 'optimal' | 'acceptable' | 'dropped_elbow' | 'over_flexed'
  color: string
  feedback: string
} {
  const angle = calculateAngle(shoulder, elbow, wrist)

  if (angle >= 100 && angle <= 125) {
    return {
      angle,
      status: 'optimal',
      color: 'text-emerald-400',
      feedback:
        'Optimal Early Vertical Forearm (EVF)! High elbow position generates maximal forward propulsion surface without shoulder impingement stress.',
    }
  }

  if (angle > 125 && angle <= 145) {
    return {
      angle,
      status: 'acceptable',
      color: 'text-amber-400',
      feedback:
        'Acceptable catch angle, but elbow is starting to drop. Focus on anchoring the forearm like a paddle before driving back.',
    }
  }

  if (angle > 145) {
    return {
      angle,
      status: 'dropped_elbow',
      color: 'text-rose-400',
      feedback:
        'Dropped elbow detected! Arm is slipping through the water and pushing down instead of back. This increases rotator cuff strain and reduces propulsion.',
    }
  }

  return {
    angle,
    status: 'over_flexed',
    color: 'text-cyan-400',
    feedback:
      'Over-flexed catch (<100°). Reaching too close to body, reducing stroke length and leverage.',
  }
}

/**
 * Streamline & Shoulder Flexion Test
 * Measures active overhead shoulder reach angle (Hip -> Shoulder -> Wrist)
 */
export function calculateStreamlineFlexion(
  hip: Point2D,
  shoulder: Point2D,
  wrist: Point2D
): {
  angle: number
  status: 'excellent' | 'adequate' | 'restricted'
  alignmentScore: number
  feedback: string
} {
  const angle = calculateAngle(hip, shoulder, wrist)

  // 180 deg is a completely straight vertical streamline
  const deviation = Math.abs(180 - angle)
  const alignmentScore = Math.max(0, Math.min(100, Math.round(100 - deviation * 2.5)))

  if (angle >= 170) {
    return {
      angle,
      status: 'excellent',
      alignmentScore,
      feedback:
        'Full thoracic and lat mobility! Perfect hydrodynamic streamline for push-offs, starts, and breakouts.',
    }
  }

  if (angle >= 155 && angle < 170) {
    return {
      angle,
      status: 'adequate',
      alignmentScore,
      feedback:
        'Moderate shoulder flexion. Slight lat or pec tightness restricting full overhead lock. Pre-swim foam rolling on lats recommended.',
    }
  }

  return {
    angle,
    status: 'restricted',
    alignmentScore,
    feedback:
      'Restricted shoulder flexion (<155°). Compensating with lumbar arching. High risk of swimmer shoulder impingement. Perform Pec Minor & Subscapularis SMR before entering pool!',
  }
}

/**
 * Bilateral Stroke Asymmetry Analysis
 */
export function calculateBilateralAsymmetry(
  leftStrokeDurationSec: number,
  rightStrokeDurationSec: number
): {
  asymmetryPercentage: number
  dominantSide: 'left' | 'right' | 'balanced'
  riskLevel: 'low' | 'moderate' | 'high'
  recommendation: string
} {
  if (leftStrokeDurationSec <= 0 || rightStrokeDurationSec <= 0) {
    return {
      asymmetryPercentage: 0,
      dominantSide: 'balanced',
      riskLevel: 'low',
      recommendation: 'Enter valid stroke cycle durations.',
    }
  }

  const diff = Math.abs(leftStrokeDurationSec - rightStrokeDurationSec)
  const avg = (leftStrokeDurationSec + rightStrokeDurationSec) / 2
  const asymmetryPercentage = Math.round((diff / avg) * 1000) / 10

  let dominantSide: 'left' | 'right' | 'balanced' = 'balanced'
  if (leftStrokeDurationSec > rightStrokeDurationSec * 1.03) {
    dominantSide = 'left'
  } else if (rightStrokeDurationSec > leftStrokeDurationSec * 1.03) {
    dominantSide = 'right'
  }

  if (asymmetryPercentage <= 5) {
    return {
      asymmetryPercentage,
      dominantSide,
      riskLevel: 'low',
      recommendation:
        'Symmetrical pull forces detected. Low risk of unilateral shoulder overuse.',
    }
  }

  if (asymmetryPercentage <= 12) {
    return {
      asymmetryPercentage,
      dominantSide,
      riskLevel: 'moderate',
      recommendation: `Moderate asymmetry (${asymmetryPercentage}%). The ${dominantSide} arm is spending longer in pull/propulsion, often due to breathing preference. Practice bilateral breathing drills.`,
    }
  }

  return {
    asymmetryPercentage,
    dominantSide,
    riskLevel: 'high',
    recommendation: `Severe asymmetry (${asymmetryPercentage}%). Significant unilateral loading on the ${dominantSide} shoulder. High correlation with swimmer's shoulder tendinopathy. Release subscapularis and check catch mechanics.`,
  }
}
