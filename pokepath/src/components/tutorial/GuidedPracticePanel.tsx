'use client'

import { useMemo, useState } from 'react'

import {
  GUIDED_PRACTICE_LESSONS,
  validateGuidedPracticeChoice,
} from '@/src/lib/tutorial/guidedPractice'

export function GuidedPracticePanel() {
  const [lessonIndex, setLessonIndex] = useState(0)
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null)

  const lesson = GUIDED_PRACTICE_LESSONS[lessonIndex]!
  const result = useMemo(
    () =>
      selectedChoiceId
        ? validateGuidedPracticeChoice(lesson.id, selectedChoiceId)
        : null,
    [lesson.id, selectedChoiceId],
  )

  const goToLesson = (index: number) => {
    setLessonIndex(index)
    setSelectedChoiceId(null)
  }

  return (
    <section className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 dark:border-emerald-900/70 dark:bg-emerald-950/30 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
            Guided practice
          </p>
          <h2 className="mt-1 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Try the rule, then get instant feedback
          </h2>
        </div>
        <p className="rounded-full bg-white px-3 py-1 text-xs font-medium text-emerald-800 shadow-sm dark:bg-zinc-900 dark:text-emerald-200">
          {lesson.eyebrow} of {GUIDED_PRACTICE_LESSONS.length}
        </p>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,0.75fr)]">
        <div className="rounded-xl bg-white/85 p-4 shadow-sm dark:bg-zinc-950/80">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{lesson.title}</h3>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{lesson.setup}</p>
          <p className="mt-4 text-sm font-medium text-zinc-800 dark:text-zinc-100">{lesson.prompt}</p>

          <div className="mt-4 grid gap-2">
            {lesson.choices.map((choice) => {
              const isSelected = selectedChoiceId === choice.id
              return (
                <button
                  key={choice.id}
                  type="button"
                  className={`rounded-xl border px-4 py-3 text-left text-sm font-medium transition ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-100 text-emerald-950 dark:border-emerald-400 dark:bg-emerald-900/50 dark:text-emerald-50'
                      : 'border-zinc-200 bg-white text-zinc-800 hover:border-emerald-300 hover:bg-emerald-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-emerald-700 dark:hover:bg-emerald-950/50'
                  }`}
                  onClick={() => setSelectedChoiceId(choice.id)}
                >
                  {choice.label}
                </button>
              )
            })}
          </div>

          <div
            className="mt-4 min-h-20 rounded-xl border border-dashed border-emerald-300 bg-emerald-50 p-4 text-sm text-zinc-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-zinc-200"
            aria-live="polite"
          >
            {result ? (
              <>
                <p className="font-semibold text-zinc-900 dark:text-zinc-50">
                  {result.isCorrect ? 'Nice read.' : 'Try another angle.'}
                </p>
                <p className="mt-1">{result.feedback}</p>
                {result.reason && (
                  <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                    Engine reason: {result.reason}
                  </p>
                )}
              </>
            ) : (
              <p>Choose an action above. The tutorial checks it with the same engine rules as a live turn.</p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {GUIDED_PRACTICE_LESSONS.map((item, index) => (
            <button
              key={item.id}
              type="button"
              className={`rounded-xl border px-4 py-3 text-left transition ${
                index === lessonIndex
                  ? 'border-emerald-500 bg-white text-zinc-900 shadow-sm dark:border-emerald-400 dark:bg-zinc-900 dark:text-zinc-50'
                  : 'border-transparent bg-white/60 text-zinc-600 hover:bg-white dark:bg-zinc-950/50 dark:text-zinc-400 dark:hover:bg-zinc-900'
              }`}
              onClick={() => goToLesson(index)}
            >
              <span className="block text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                {item.eyebrow}
              </span>
              <span className="mt-1 block text-sm font-medium">{item.title}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
