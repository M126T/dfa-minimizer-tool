import { Check } from 'lucide-react';
import { motion } from 'framer-motion';

interface StepIndicatorProps {
  currentStep: number;
  steps: { label: string; description: string }[];
}

export function StepIndicator({ currentStep, steps }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-2 md:gap-4">
      {steps.map((step, i) => {
        const isDone = i < currentStep;
        const isActive = i === currentStep;

        return (
          <div key={i} className="flex items-center gap-2 md:gap-4">
            <div className="flex items-center gap-2">
              <motion.div
                className={`step-badge ${isActive ? 'step-badge-active' : isDone ? 'step-badge-done' : 'step-badge-pending'}`}
                animate={{ scale: isActive ? 1.1 : 1 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                {isDone ? <Check className="w-4 h-4" /> : i + 1}
              </motion.div>
              <div className="hidden sm:block">
                <p className={`text-sm font-medium ${isActive ? 'text-foreground' : isDone ? 'text-primary' : 'text-muted-foreground'}`}>
                  {step.label}
                </p>
                <p className="text-xs text-muted-foreground hidden md:block">{step.description}</p>
              </div>
            </div>
            {i < steps.length - 1 && (
              <div className={`w-8 md:w-16 h-0.5 rounded-full transition-colors ${isDone ? 'bg-primary' : 'bg-muted'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
