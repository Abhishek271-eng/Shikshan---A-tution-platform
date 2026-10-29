import React from 'react';
import { Check } from 'lucide-react';

export interface StepItem {
  id: string | number;
  label: string;
  shortLabel?: string;
}

interface ProgressBarProps {
  steps: StepItem[];
  currentStep: number; // 0-indexed or 1-indexed
  onStepClick?: (stepIndex: number) => void;
  allowStepClick?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  steps,
  currentStep,
  onStepClick,
  allowStepClick = false,
}) => {
  return (
    <div className="w-full py-3 select-none">
      <div className="relative flex items-center justify-between">
        {/* Connecting Background Line */}
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1.5 w-full rounded-full"
          style={{ background: '#E2E8F0' }}
        />
        {/* Active Progress Line */}
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1.5 rounded-full transition-all duration-300"
          style={{
            background: 'linear-gradient(90deg, #3B82F6 0%, #2563EB 100%)',
            width: `${(currentStep / (steps.length - 1)) * 100}%`,
          }}
        />

        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;

          return (
            <div
              key={step.id}
              className="relative z-10 flex flex-col items-center"
              onClick={() => {
                if (allowStepClick && onStepClick && isCompleted) {
                  onStepClick(index);
                }
              }}
              style={{ cursor: allowStepClick && isCompleted ? 'pointer' : 'default' }}
            >
              {/* Step Circle Indicator */}
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-200 ${
                  isCompleted
                    ? 'bg-blue-600 text-white shadow-md'
                    : isCurrent
                    ? 'bg-white text-blue-600 border-2 border-blue-600 shadow-md ring-4 ring-blue-100 scale-110'
                    : 'bg-slate-200 text-slate-500 border border-slate-300'
                }`}
              >
                {isCompleted ? <Check className="w-5 h-5 stroke-[2.5]" /> : index + 1}
              </div>

              {/* Step Label (Hidden on small mobile, shows shortLabel or label) */}
              <span
                className={`text-xs mt-1.5 font-medium whitespace-nowrap transition-colors duration-200 ${
                  isCurrent
                    ? 'text-blue-700 font-bold'
                    : isCompleted
                    ? 'text-slate-700'
                    : 'text-slate-400'
                }`}
              >
                <span className="hidden sm:inline">{step.label}</span>
                <span className="sm:hidden">{step.shortLabel || step.label}</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
