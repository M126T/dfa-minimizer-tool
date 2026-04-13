import { DFADefinition, validateDFA } from '@/lib/dfa';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, AlertCircle } from 'lucide-react';

interface Props {
  dfa: DFADefinition;
  onChange: (dfa: DFADefinition) => void;
  onNext: () => void;
  onBack: () => void;
}

export function DefineTransitions({ dfa, onChange, onNext, onBack }: Props) {
  const setTransition = (state: string, sym: string, target: string) => {
    onChange({
      ...dfa,
      transitions: {
        ...dfa.transitions,
        [state]: {
          ...(dfa.transitions[state] || {}),
          [sym]: target,
        },
      },
    });
  };

  const errors = validateDFA(dfa);
  const transitionErrors = errors.filter(e => e.field === 'transitions');

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="glass-card p-5 overflow-x-auto">
        <h3 className="font-semibold mb-4">Transition Table — δ(state, symbol)</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 px-3 font-semibold text-muted-foreground">State</th>
              {dfa.alphabet.map(sym => (
                <th key={sym} className="text-left py-2 px-3 font-mono font-semibold text-muted-foreground">{sym}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dfa.states.map(state => (
              <tr key={state} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                <td className="py-2 px-3 font-mono font-medium">
                  {state === dfa.startState && <span className="text-primary mr-1">→</span>}
                  {dfa.acceptStates.includes(state) && <span className="text-primary mr-1">★</span>}
                  {state}
                </td>
                {dfa.alphabet.map(sym => (
                  <td key={sym} className="py-2 px-3">
                    <select
                      className="w-full px-2 py-1.5 rounded-md border bg-background text-foreground font-mono text-sm focus:ring-2 focus:ring-ring focus:outline-none"
                      value={dfa.transitions[state]?.[sym] || ''}
                      onChange={e => setTransition(state, sym, e.target.value)}
                    >
                      <option value="">—</option>
                      {dfa.states.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {transitionErrors.length > 0 && (
        <div className="glass-card p-4 border-destructive/50">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-destructive" />
            <span className="font-semibold text-sm text-destructive">Validation Errors</span>
          </div>
          <ul className="space-y-1">
            {transitionErrors.map((e, i) => (
              <li key={i} className="text-sm text-destructive/80 font-mono">{e.message}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button onClick={onNext} disabled={errors.length > 0} size="lg">
          Minimize DFA
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </motion.div>
  );
}
