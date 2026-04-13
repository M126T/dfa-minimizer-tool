import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { DFADefinition, PRESETS, generateRandomDFA } from '@/lib/dfa';
import { motion } from 'framer-motion';
import { Shuffle, BookOpen, ArrowRight, X } from 'lucide-react';

interface DefineStatesProps {
  dfa: DFADefinition;
  onChange: (dfa: DFADefinition) => void;
  onNext: () => void;
}

export function DefineStates({ dfa, onChange, onNext }: DefineStatesProps) {
  const [alphabetInput, setAlphabetInput] = useState(dfa.alphabet.join(', '));
  const [stateInput, setStateInput] = useState('');
  const [errors, setErrors] = useState<string[]>([]);

  const handleAlphabetChange = (val: string) => {
    setAlphabetInput(val);
    const symbols = val.split(',').map(s => s.trim()).filter(Boolean);
    const unique = [...new Set(symbols)];
    onChange({ ...dfa, alphabet: unique });
  };

  const addState = () => {
    const s = stateInput.trim();
    if (!s) return;
    if (dfa.states.includes(s)) {
      setErrors([`State "${s}" already exists`]);
      return;
    }
    setErrors([]);
    onChange({ ...dfa, states: [...dfa.states, s] });
    setStateInput('');
  };

  const removeState = (s: string) => {
    onChange({
      ...dfa,
      states: dfa.states.filter(st => st !== s),
      startState: dfa.startState === s ? '' : dfa.startState,
      acceptStates: dfa.acceptStates.filter(a => a !== s),
      transitions: Object.fromEntries(
        Object.entries(dfa.transitions).filter(([k]) => k !== s)
      ),
    });
  };

  const toggleAccept = (s: string) => {
    const isAccept = dfa.acceptStates.includes(s);
    onChange({
      ...dfa,
      acceptStates: isAccept
        ? dfa.acceptStates.filter(a => a !== s)
        : [...dfa.acceptStates, s],
    });
  };

  const loadPreset = (preset: typeof PRESETS[0]) => {
    onChange({ ...preset.dfa });
    setAlphabetInput(preset.dfa.alphabet.join(', '));
  };

  const stressTest = () => {
    const random = generateRandomDFA();
    onChange(random);
    setAlphabetInput(random.alphabet.join(', '));
  };

  const canProceed = dfa.alphabet.length > 0 && dfa.states.length > 0 && dfa.startState && dfa.acceptStates.length > 0;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Presets */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-sm">Quick Start</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map(p => (
            <Button key={p.name} variant="outline" size="sm" onClick={() => loadPreset(p)}>
              <span className="mr-1">{p.difficulty === 'Easy' ? '🟢' : p.difficulty === 'Medium' ? '🟡' : '🔴'}</span>
              {p.name}
            </Button>
          ))}
          <Button variant="outline" size="sm" onClick={stressTest}>
            <Shuffle className="w-3.5 h-3.5 mr-1" />
            Stress Test
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Alphabet */}
        <div className="glass-card p-5 space-y-3">
          <Label className="font-semibold">Alphabet (Σ)</Label>
          <Input
            value={alphabetInput}
            onChange={e => handleAlphabetChange(e.target.value)}
            placeholder="e.g. 0, 1 or a, b"
          />
          <div className="flex flex-wrap gap-1.5">
            {dfa.alphabet.map(s => (
              <Badge key={s} variant="secondary" className="font-mono">{s}</Badge>
            ))}
          </div>
        </div>

        {/* States */}
        <div className="glass-card p-5 space-y-3">
          <Label className="font-semibold">States (Q)</Label>
          <div className="flex gap-2">
            <Input
              value={stateInput}
              onChange={e => setStateInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addState()}
              placeholder="e.g. q0"
            />
            <Button onClick={addState} size="sm">Add</Button>
          </div>
          {errors.map((e, i) => (
            <p key={i} className="text-sm text-destructive">{e}</p>
          ))}
          <div className="flex flex-wrap gap-1.5">
            {dfa.states.map(s => (
              <Badge
                key={s}
                variant={dfa.acceptStates.includes(s) ? 'default' : 'secondary'}
                className="font-mono cursor-pointer group gap-1"
              >
                {s}
                {s === dfa.startState && <span className="text-xs opacity-70">→</span>}
                {dfa.acceptStates.includes(s) && <span className="text-xs opacity-70">★</span>}
                <X className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeState(s)} />
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Start State */}
        <div className="glass-card p-5 space-y-3">
          <Label className="font-semibold">Start State (q₀)</Label>
          <div className="flex flex-wrap gap-2">
            {dfa.states.map(s => (
              <Button
                key={s}
                variant={dfa.startState === s ? 'default' : 'outline'}
                size="sm"
                onClick={() => onChange({ ...dfa, startState: s })}
                className="font-mono"
              >
                {s}
              </Button>
            ))}
          </div>
        </div>

        {/* Accept States */}
        <div className="glass-card p-5 space-y-3">
          <Label className="font-semibold">Accept States (F)</Label>
          <div className="flex flex-wrap gap-2">
            {dfa.states.map(s => (
              <Button
                key={s}
                variant={dfa.acceptStates.includes(s) ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleAccept(s)}
                className="font-mono"
              >
                {s}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={onNext} disabled={!canProceed} size="lg">
          Define Transitions
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </motion.div>
  );
}
