import { useState, useMemo } from 'react';
import { DFADefinition, MinimizationResult, minimizeDFA } from '@/lib/dfa';
import { StepIndicator } from './StepIndicator';
import { DefineStates } from './DefineStates';
import { DefineTransitions } from './DefineTransitions';
import { Results } from './Results';
import { motion } from 'framer-motion';
import { Cpu } from 'lucide-react';

const STEPS = [
  { label: 'Define DFA', description: 'States & alphabet' },
  { label: 'Transitions', description: 'Transition table' },
  { label: 'Results', description: 'Visualization' },
];

const emptyDFA: DFADefinition = {
  alphabet: [],
  states: [],
  startState: '',
  acceptStates: [],
  transitions: {},
};

export function DFAWizard() {
  const [step, setStep] = useState(0);
  const [dfa, setDfa] = useState<DFADefinition>(emptyDFA);
  const [result, setResult] = useState<MinimizationResult | null>(null);

  const handleMinimize = () => {
    const res = minimizeDFA(dfa);
    setResult(res);
    setStep(2);
  };

  const handleReset = () => {
    setDfa(emptyDFA);
    setResult(null);
    setStep(0);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
                <Cpu className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight">DFA Minimization Visualizer</h1>
                <p className="text-xs text-muted-foreground">Partition refinement with step-by-step visualization</p>
              </div>
            </div>
          </div>
          <StepIndicator currentStep={step} steps={STEPS} />
        </div>
      </header>

      {/* Content */}
      <main className="container max-w-6xl mx-auto px-4 py-8">
        {step === 0 && (
          <DefineStates dfa={dfa} onChange={setDfa} onNext={() => setStep(1)} />
        )}
        {step === 1 && (
          <DefineTransitions
            dfa={dfa}
            onChange={setDfa}
            onNext={handleMinimize}
            onBack={() => setStep(0)}
          />
        )}
        {step === 2 && result && (
          <Results result={result} onBack={() => setStep(1)} onReset={handleReset} />
        )}
      </main>
    </div>
  );
}
