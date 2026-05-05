/** Prompt Quality Analyzer
 * Rule-based prompt quality scoring across multiple dimensions.
 * Returns a 0-100 score, letter grade, and actionable suggestions.
 */

interface QualityFactor {
  name: string
  score: number
  weight: number
  tip: string
}

function scoreLength(text: string): QualityFactor {
  const len = text.trim().length
  let score = 0
  let tip = ''

  if (len === 0) { score = 0; tip = 'Start typing your prompt' }
  else if (len < 15) { score = 10; tip = 'Prompt is too short — add more detail and context' }
  else if (len < 40) { score = 30; tip = 'Consider adding specific requirements or constraints' }
  else if (len < 100) { score = 55; tip = 'Good start — try adding examples or desired format' }
  else if (len < 300) { score = 80; tip = 'Nice length — ensure all key details are included' }
  else if (len < 800) { score = 95; tip = 'Excellent detail level' }
  else if (len < 2000) { score = 90; tip = 'Very detailed — make sure it stays focused' }
  else { score = 75; tip = 'Consider breaking into smaller, focused prompts' }

  return { name: 'Length', score, weight: 0.15, tip }
}

function scoreSpecificity(text: string): QualityFactor {
  let score = 0
  const indicators = [
    /\d+/,                          // contains numbers
    /["'].+?["']/,                  // quoted strings
    /\b(exactly|specifically|must|should|always|never)\b/i,  // directive words
    /\b(e\.g\.|for example|such as|like)\b/i,                // examples
    /\b(step \d|first|second|then|finally)\b/i,              // sequential
    /\b(json|csv|html|markdown|code|list|table|bullet)\b/i,  // format specs
  ]

  indicators.forEach(regex => {
    if (regex.test(text)) score += 16
  })

  score = Math.min(100, score)
  const tip = score < 50
    ? 'Add specific details: numbers, examples, format requirements'
    : score < 80
      ? 'Good specificity — consider adding edge cases or constraints'
      : 'Excellent specificity'

  return { name: 'Specificity', score, weight: 0.25, tip }
}

function scoreStructure(text: string): QualityFactor {
  let score = 20 // base score for any text
  const lines = text.split('\n').filter(l => l.trim())

  if (lines.length > 1) score += 15
  if (/^[-*•]\s/m.test(text)) score += 20       // bullet points
  if (/^#+\s/m.test(text)) score += 15           // headers
  if (/^\d+[.)]\s/m.test(text)) score += 20      // numbered lists
  if (/```/.test(text)) score += 15               // code blocks
  if (/\n\n/.test(text)) score += 10              // paragraphs

  score = Math.min(100, score)
  const tip = score < 50
    ? 'Use bullet points, numbered lists, or sections to organize your prompt'
    : 'Well structured prompt'

  return { name: 'Structure', score, weight: 0.15, tip }
}

function scoreClarity(text: string): QualityFactor {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
  const avgSentenceLen = sentences.length > 0
    ? sentences.reduce((sum, s) => sum + s.trim().split(/\s+/).length, 0) / sentences.length
    : 0

  let score = 50
  // Ideal sentence length is 10-25 words
  if (avgSentenceLen >= 8 && avgSentenceLen <= 25) score = 90
  else if (avgSentenceLen < 8) score = 60
  else if (avgSentenceLen > 40) score = 35
  else score = 70

  // Penalize excessive jargon density
  const words = text.split(/\s+/)
  const longWords = words.filter(w => w.length > 12).length
  if (words.length > 0 && longWords / words.length > 0.3) score -= 15

  score = Math.max(0, Math.min(100, score))
  const tip = score < 60
    ? 'Use clearer, shorter sentences for better AI comprehension'
    : 'Good clarity'

  return { name: 'Clarity', score, weight: 0.2, tip }
}

function scoreIntent(text: string): QualityFactor {
  let score = 10
  const intentPatterns = [
    /\b(create|generate|write|build|make|design|implement)\b/i,
    /\b(explain|describe|summarize|analyze|compare)\b/i,
    /\b(fix|debug|solve|optimize|improve|refactor)\b/i,
    /\b(translate|convert|transform|format)\b/i,
    /\b(list|find|search|identify|extract)\b/i,
    /\?/,  // questions show intent
  ]

  intentPatterns.forEach(p => {
    if (p.test(text)) score += 15
  })

  score = Math.min(100, score)
  const tip = score < 50
    ? 'Start with a clear action verb: Create, Explain, Fix, List...'
    : 'Clear intent detected'

  return { name: 'Intent', score, weight: 0.25, tip }
}

function getGrade(score: number): string {
  if (score >= 90) return 'A+'
  if (score >= 85) return 'A'
  if (score >= 80) return 'A-'
  if (score >= 75) return 'B+'
  if (score >= 70) return 'B'
  if (score >= 65) return 'B-'
  if (score >= 60) return 'C+'
  if (score >= 55) return 'C'
  if (score >= 50) return 'C-'
  if (score >= 40) return 'D'
  return 'F'
}

export function analyzePrompt(text: string) {
  if (!text || text.trim().length === 0) {
    return {
      score: 0,
      grade: '-',
      factors: [],
      suggestions: ['Start typing a prompt to see quality analysis'],
    }
  }

  const factors = [
    scoreLength(text),
    scoreSpecificity(text),
    scoreStructure(text),
    scoreClarity(text),
    scoreIntent(text),
  ]

  const totalWeight = factors.reduce((sum, f) => sum + f.weight, 0)
  const weightedScore = factors.reduce((sum, f) => sum + f.score * f.weight, 0) / totalWeight
  const score = Math.round(weightedScore)
  const grade = getGrade(score)

  // Get top 3 suggestions from lowest-scoring factors
  const suggestions = factors
    .sort((a, b) => a.score - b.score)
    .slice(0, 3)
    .filter(f => f.score < 80)
    .map(f => f.tip)

  return {
    score,
    grade,
    factors: factors.map(f => ({ name: f.name, score: f.score, tip: f.tip })),
    suggestions,
  }
}
