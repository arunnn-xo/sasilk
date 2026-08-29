import type { ReactNode } from 'react'
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react'
import StepIndicator from './StepIndicator'
import type { Step } from './StepIndicator'

export interface WizardContainerProps {
  steps: Step[]
  currentStep: number
  onNext: () => void
  onPrev: () => void
  onCancel: () => void
  onSubmit: () => void
  isFirstStep: boolean
  isLastStep: boolean
  isSubmitting?: boolean
  isPending?: boolean
  children: ReactNode
}

export default function WizardContainer({
  steps,
  currentStep,
  onNext,
  onPrev,
  onCancel,
  onSubmit,
  isFirstStep,
  isLastStep,
  isSubmitting,
  isPending,
  children,
}: WizardContainerProps) {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header with back button */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-2 rounded border border-[var(--line)] px-3 py-2 text-sm font-semibold text-[var(--gold)] transition-colors hover:bg-[var(--burgundy-soft)]"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </button>
        {currentStep > 0 && (
          <p className="text-sm text-[var(--muted)]">
            Step {currentStep + 1} of {steps.length}
          </p>
        )}
      </div>

      <section className="admin-card overflow-hidden rounded-lg">
        <div className="border-b border-[var(--line)] bg-gradient-to-r from-[var(--burgundy-soft)]/40 to-transparent px-6 py-5 md:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#6B1A2A] text-white border border-[#D9B86E]/40 shadow-sm">
              <Check className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#6B1A2A]">
                {steps[currentStep].label}
              </p>
              <h1 className="font-display text-xl font-bold text-[#1F080D] md:text-2xl">
                {steps[currentStep].description}
              </h1>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-8">
          {/* Step indicator */}
          <StepIndicator steps={steps} currentStep={currentStep} />

          {/* Step content */}
          <div className="min-h-[200px]">{children}</div>

          {/* Navigation buttons */}
          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-[var(--line)] pt-6 sm:flex-row sm:justify-between">
            <div>
              {!isFirstStep && (
                <button
                  type="button"
                  onClick={onPrev}
                  disabled={isSubmitting}
                  className="admin-btn-secondary"
                >
                  <span className="flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Previous
                  </span>
                </button>
              )}
            </div>
            <div className="flex gap-3">
              {!isLastStep ? (
                <button
                  type="button"
                  onClick={onNext}
                  disabled={isSubmitting}
                  className="admin-btn-primary"
                >
                  Next
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onSubmit}
                  disabled={isSubmitting || isPending}
                  className="admin-btn-primary"
                >
                  {isSubmitting || isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                  {isSubmitting || isPending ? 'Saving…' : 'Save'}
                </button>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
