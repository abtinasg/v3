"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Share2,
  TrendingUp,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type QuestionType = "single" | "multiple" | "scale"

interface QuestionOption {
  id: string
  label: string
  description?: string
  value: number
}

interface QuizQuestion {
  id: string
  text: string
  type: QuestionType
  options?: QuestionOption[]
  helper?: string
}

type AnswerValue = string | string[] | number | undefined

type PersonalityKey =
  | "growth-hunter"
  | "strategic-analyst"
  | "steady-builder"
  | "cautious-saver"

interface QuizResult {
  score: number
  personalityType: PersonalityKey
  riskTolerance: "conservative" | "moderate" | "aggressive"
}

const SCALE_VALUES = [1, 2, 3, 4, 5]

const QUESTIONS: QuizQuestion[] = [
  {
    id: "q1",
    text: "How would you react if your portfolio dropped 20% in a month?",
    type: "single",
    options: [
      {
        id: "hold-steady",
        label: "Stay calm and hold",
        description: "I trust my long-term plan",
        value: 5,
      },
      {
        id: "rebalance",
        label: "Rebalance strategically",
        description: "I'd look for opportunities",
        value: 4,
      },
      {
        id: "trim",
        label: "Trim positions",
        description: "I'd reduce risk exposure",
        value: 3,
      },
      {
        id: "panic",
        label: "Exit immediately",
        description: "I'd move to cash",
        value: 1,
      },
    ],
  },
  {
    id: "q2",
    text: "What is your primary investment time horizon?",
    type: "single",
    options: [
      { id: "short", label: "Less than 2 years", value: 2 },
      { id: "medium", label: "2-5 years", value: 3 },
      { id: "long", label: "5-10 years", value: 4 },
      { id: "very-long", label: "10+ years", value: 5 },
    ],
  },
  {
    id: "q3",
    text: "Select the strategies you actively use",
    type: "multiple",
    helper: "Choose all that apply",
    options: [
      { id: "dca", label: "Dollar-cost averaging", value: 3 },
      { id: "options", label: "Options / derivatives", value: 5 },
      { id: "research", label: "Deep fundamental research", value: 4 },
      { id: "etfs", label: "Passive ETF exposure", value: 2 },
    ],
  },
  {
    id: "q4",
    text: "How confident are you comparing balance sheets or income statements?",
    type: "scale",
    helper: "1 = Not confident · 5 = Expert level",
  },
  {
    id: "q5",
    text: "How do you typically respond to market volatility?",
    type: "single",
    options: [
      { id: "buy", label: "Buy the dip aggressively", value: 5 },
      { id: "selective", label: "Add selectively", value: 4 },
      { id: "wait", label: "Wait for clarity", value: 3 },
      { id: "exit", label: "Exit to cash", value: 1 },
    ],
  },
]

const PERSONALITY_DESCRIPTIONS = {
  "growth-hunter": {
    title: "Growth Hunter",
    description:
      "You embrace calculated risk, thrive during volatility, and seek asymmetric upside opportunities.",
    badge: "Aggressive",
  },
  "strategic-analyst": {
    title: "Strategic Analyst",
    description:
      "Data-driven and disciplined, you blend qualitative insights with quantitative rigor for balanced decisions.",
    badge: "Analytical",
  },
  "steady-builder": {
    title: "Steady Builder",
    description:
      "Consistency beats timing in your playbook. You focus on compounding and resilient portfolio design.",
    badge: "Balanced",
  },
  "cautious-saver": {
    title: "Cautious Saver",
    description:
      "Capital preservation is priority one. You optimize for downside protection and gradual growth.",
    badge: "Defensive",
  },
} as const

export default function ScorePage() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 py-8">
      <header className="flex flex-col gap-2">
        <p className="text-sm uppercase tracking-widest text-muted-foreground">
          Deep Score Assessment
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Understand your investor DNA
        </h1>
        <p className="text-base text-muted-foreground">
          Answer a few quick questions to generate your Deep Score profile and unlock personalized guidance.
        </p>
      </header>

      <QuizContainer />
    </div>
  )
}

function QuizContainer() {
  const totalQuestions = QUESTIONS.length
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({})
  const [result, setResult] = useState<QuizResult | null>(null)

  const currentQuestion = QUESTIONS[currentIndex]
  const currentValue = answers[currentQuestion?.id]
  const isLastQuestion = currentIndex === totalQuestions - 1
  const answeredCount = Object.keys(answers).length
  const progressPercent = result
    ? 100
    : Math.min(100, ((currentIndex) / totalQuestions) * 100 + 100 / totalQuestions)

  const canAdvance = (() => {
    if (result) return false
    if (currentQuestion?.type === "multiple") {
      return Array.isArray(currentValue) && currentValue.length > 0
    }
    return typeof currentValue !== "undefined"
  })()

  function handleAnswerChange(value: AnswerValue) {
    if (!currentQuestion) return
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }))
  }

  function handleNext() {
    if (isLastQuestion) {
      const quizResult = calculateResults({ ...answers })
      setResult(quizResult)
      return
    }
    setCurrentIndex((prev) => Math.min(prev + 1, totalQuestions - 1))
  }

  function handleBack() {
    if (currentIndex === 0 || result) return
    setCurrentIndex((prev) => Math.max(prev - 1, 0))
  }

  function handleSkip() {
    if (result || !currentQuestion) return

    setAnswers((prev) => {
      const { [currentQuestion.id]: _, ...rest } = prev
      const nextAnswers: Record<string, AnswerValue> = { ...rest }

      if (isLastQuestion) {
        setResult(calculateResults(nextAnswers))
      } else {
        setCurrentIndex((prevIndex) => Math.min(prevIndex + 1, totalQuestions - 1))
      }

      return nextAnswers
    })
  }

  function handleRestart() {
    setAnswers({})
    setResult(null)
    setCurrentIndex(0)
  }

  if (result) {
    return (
      <ResultsView
        result={result}
        totalAnswered={answeredCount}
        onRestart={handleRestart}
      />
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <ProgressBar current={currentIndex + 1} total={totalQuestions} percent={progressPercent} />

      {currentQuestion && (
        <QuestionCard
          question={currentQuestion}
          value={currentValue}
          onChange={handleAnswerChange}
        />
      )}

      <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Question {currentIndex + 1}</span>
          <span className="text-muted-foreground/60">/</span>
          <span>{totalQuestions}</span>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={handleSkip}
          >
            Skip
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            disabled={currentIndex === 0}
          >
            <ArrowLeft className="size-4" aria-hidden />
            Back
          </Button>

          <Button
            type="button"
            onClick={handleNext}
            disabled={!canAdvance}
          >
            {isLastQuestion ? "Submit" : "Next"}
            <ArrowRight className="size-4" aria-hidden />
          </Button>
        </div>
      </div>
    </div>
  )
}

interface QuestionCardProps {
  question: QuizQuestion
  value: AnswerValue
  onChange: (value: AnswerValue) => void
}

function QuestionCard({ question, value, onChange }: QuestionCardProps) {
  return (
    <Card className="border-primary/10 bg-card/60">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-foreground">
          {question.text}
        </CardTitle>
        {question.helper && (
          <CardDescription className="text-base">{question.helper}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {question.type === "scale" ? (
          <ScaleSelector value={typeof value === "number" ? value : undefined} onChange={onChange} />
        ) : (
          question.options?.map((option) => (
            <OptionRow
              key={option.id}
              option={option}
              questionType={question.type}
              isSelected={isOptionSelected(question.type, value, option.id)}
              onSelect={() => handleOptionChange(question.type, value, option.id, onChange)}
            />
          ))
        )}
      </CardContent>
    </Card>
  )
}

function OptionRow({
  option,
  questionType,
  isSelected,
  onSelect,
}: {
  option: QuestionOption
  questionType: QuestionType
  isSelected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex w-full flex-col gap-1 rounded-xl border px-4 py-3 text-left transition hover:border-primary/60 hover:bg-primary/5",
        isSelected ? "border-primary bg-primary/10" : "border-border"
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium text-foreground">{option.label}</span>
        <span
          className={cn(
            "text-xs font-semibold uppercase tracking-widest",
            questionType === "multiple"
              ? "text-purple-400"
              : questionType === "single"
                ? "text-emerald-400"
                : "text-muted-foreground"
          )}
        >
          {isSelected ? "Selected" : "Choose"}
        </span>
      </div>
      {option.description && (
        <p className="text-sm text-muted-foreground">{option.description}</p>
      )}
    </button>
  )
}

function handleOptionChange(
  type: QuestionType,
  currentValue: AnswerValue,
  optionId: string,
  onChange: (value: AnswerValue) => void,
) {
  if (type === "single") {
    onChange(optionId)
  } else if (type === "multiple") {
    const existing = Array.isArray(currentValue) ? currentValue : []
    const exists = existing.includes(optionId)
    const next = exists ? existing.filter((id) => id !== optionId) : [...existing, optionId]
    onChange(next)
  }
}

function isOptionSelected(type: QuestionType, value: AnswerValue, optionId: string) {
  if (type === "single") {
    return value === optionId
  }
  if (type === "multiple") {
    return Array.isArray(value) && value.includes(optionId)
  }
  return false
}

function ScaleSelector({ value, onChange }: { value?: number; onChange: (value: AnswerValue) => void }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between text-xs uppercase tracking-widest text-muted-foreground">
        <span>Not confident</span>
        <span>Expert</span>
      </div>
      <div className="flex items-center justify-between gap-3">
        {SCALE_VALUES.map((scaleValue) => (
          <button
            key={scaleValue}
            type="button"
            onClick={() => onChange(scaleValue)}
            className={cn(
              "flex size-12 items-center justify-center rounded-full border text-lg font-semibold transition",
              value === scaleValue
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:border-primary/60 hover:text-primary"
            )}
          >
            {scaleValue}
          </button>
        ))}
      </div>
    </div>
  )
}

function ProgressBar({ current, total, percent }: { current: number; total: number; percent: number }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Progress · {current}/{total}
        </span>
        <span>{Math.round(percent)}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary to-primary/60 transition-[width] duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}

function calculateResults(answers: Record<string, AnswerValue>): QuizResult {
  let total = 0
  let maxTotal = 0

  for (const question of QUESTIONS) {
    if (question.type === "scale") {
      const value = Number(answers[question.id] ?? 0)
      const questionMax = SCALE_VALUES[SCALE_VALUES.length - 1]
      total += value
      maxTotal += questionMax
      continue
    }

    const response = answers[question.id]
    if (!question.options) continue

    if (question.type === "single") {
      const questionMax = Math.max(...question.options.map((opt) => opt.value))
      maxTotal += questionMax

      if (typeof response === "string") {
        const option = question.options.find((opt) => opt.id === response)
        if (option) {
          total += option.value
        }
      }
    }

    if (question.type === "multiple") {
      const questionMax = question.options.reduce((acc, opt) => acc + Math.max(opt.value, 0), 0)
      maxTotal += questionMax

      if (Array.isArray(response)) {
        const optionMap = new Map(question.options.map((opt) => [opt.id, opt.value]))
        const sum = response.reduce((acc, optionId) => acc + (optionMap.get(optionId) ?? 0), 0)
        total += sum
      }
    }
  }

  const score = maxTotal === 0 ? 0 : Math.round((total / maxTotal) * 100)

  if (score >= 80) {
    return {
      score,
      personalityType: "growth-hunter",
      riskTolerance: "aggressive",
    }
  }

  if (score >= 65) {
    return {
      score,
      personalityType: "strategic-analyst",
      riskTolerance: "moderate",
    }
  }

  if (score >= 45) {
    return {
      score,
      personalityType: "steady-builder",
      riskTolerance: "moderate",
    }
  }

  return {
    score,
    personalityType: "cautious-saver",
    riskTolerance: "conservative",
  }
}

function ResultsView({
  result,
  totalAnswered,
  onRestart,
}: {
  result: QuizResult
  totalAnswered: number
  onRestart: () => void
}) {
  const personality = PERSONALITY_DESCRIPTIONS[result.personalityType]

  async function handleShare() {
    const shareMessage = `I just completed the Deep Score quiz and scored ${result.score}!`
    if (navigator.share) {
      try {
        await navigator.share({
          title: "My Deep Score",
          text: shareMessage,
        })
        return
      } catch (error) {
        console.warn("Share cancelled", error)
      }
    }

    try {
      await navigator.clipboard.writeText(shareMessage)
      alert("Result copied to clipboard")
    } catch (error) {
      console.error("Clipboard error", error)
    }
  }

  return (
    <Card className="border-primary/20 bg-card/70">
      <CardHeader className="gap-4 text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/10">
          <Sparkles className="size-7 text-primary" aria-hidden />
        </div>
        <CardTitle className="text-3xl font-semibold text-foreground">
          Your Deep Score
        </CardTitle>
        <CardDescription className="text-base">
          {totalAnswered} of {QUESTIONS.length} questions answered
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="text-6xl font-black tracking-tight text-foreground">
            {result.score}
          </div>
          <div className="flex flex-col items-center gap-2">
            <Badge className="px-3 py-1 text-sm">
              {personality.badge}
            </Badge>
            <p className="text-2xl font-semibold text-foreground">
              {personality.title}
            </p>
            <p className="max-w-2xl text-balance text-base text-muted-foreground">
              {personality.description}
            </p>
          </div>
        </div>

        <div className="grid gap-4 rounded-xl border border-border/80 bg-background/40 p-4 sm:grid-cols-2">
          <div className="flex items-center gap-3 rounded-lg border border-border/60 p-4">
            <TrendingUp className="size-6 text-primary" aria-hidden />
            <div>
              <p className="text-sm text-muted-foreground">Personality Type</p>
              <p className="text-lg font-semibold text-foreground">
                {personality.title}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-border/60 p-4">
            <Sparkles className="size-6 text-primary" aria-hidden />
            <div>
              <p className="text-sm text-muted-foreground">Risk Tolerance</p>
              <p className="text-lg font-semibold capitalize text-foreground">
                {result.riskTolerance}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button type="button" variant="outline" onClick={handleShare}>
            <Share2 className="size-4" aria-hidden />
            Share result
          </Button>

          <Button asChild>
            <Link href="/dashboard/terminal">Continue to Terminal</Link>
          </Button>

          <Button type="button" variant="ghost" onClick={onRestart}>
            Retake quiz
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
