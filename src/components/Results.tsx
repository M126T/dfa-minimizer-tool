import { useState } from 'react';
import { MinimizationResult } from '@/lib/dfa';
import { DFAGraph } from './DFAGraph';
import { PartitionSteps } from './PartitionSteps';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { ArrowLeft, RotateCcw, Eye, EyeOff, TrendingDown, AlertTriangle } from 'lucide-react';

interface Props {
  result: MinimizationResult;
  onBack: () => void;
  onReset: () => void;
}

export function Results({ result, onBack, onReset }: Props) {
  const [showUnreachable, setShowUnreachable] = useState(false);

  const originalCount = result.originalDFA.states.length;
  const minimizedCount = result.minimizedDFA.states.length;
  const removed = originalCount - minimizedCount;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-bold">{originalCount}</p>
          <p className="text-xs text-muted-foreground">Original States</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-bold text-primary">{minimizedCount}</p>
          <p className="text-xs text-muted-foreground">Minimized States</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-bold">{result.unreachableStates.length}</p>
          <p className="text-xs text-muted-foreground">Unreachable Removed</p>
        </div>
        <div className="glass-card p-4 text-center flex flex-col items-center justify-center">
          <div className="flex items-center gap-1">
            <TrendingDown className="w-4 h-4 text-primary" />
            <p className="text-2xl font-bold text-primary">{removed > 0 ? `-${removed}` : '0'}</p>
          </div>
          <p className="text-xs text-muted-foreground">States Reduced</p>
        </div>
      </div>

      {/* Unreachable states warning */}
      {result.unreachableStates.length > 0 && (
        <div className="glass-card p-4 border-warning/30">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-warning" />
            <span className="font-semibold text-sm">Preprocessing: Unreachable States Removed</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {result.unreachableStates.map(s => (
              <Badge key={s} variant="outline" className="font-mono text-muted-foreground line-through">{s}</Badge>
            ))}
          </div>
        </div>
      )}

      {/* Graphs side by side */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowUnreachable(!showUnreachable)}
            >
              {showUnreachable ? <EyeOff className="w-3.5 h-3.5 mr-1" /> : <Eye className="w-3.5 h-3.5 mr-1" />}
              {showUnreachable ? 'Hide' : 'Show'} Unreachable
            </Button>
          </div>
          <DFAGraph
            dfa={result.reachableDFA}
            title="Original DFA (after removing unreachable)"
            showUnreachable={showUnreachable}
            unreachableStates={result.unreachableStates}
          />
        </div>
        <DFAGraph
          dfa={result.minimizedDFA}
          title="Minimized DFA"
          stateMapping={result.stateMapping}
        />
      </div>

      {/* Partition Steps */}
      <div className="glass-card p-5">
        <PartitionSteps steps={result.partitionSteps} />
      </div>

      {/* State Mapping */}
      <div className="glass-card p-5">
        <h4 className="font-semibold text-sm mb-3">State Mapping</h4>
        <div className="space-y-2">
          {Object.entries(result.stateMapping).map(([minState, origStates]) => (
            <div key={minState} className="flex items-center gap-3 font-mono text-sm">
              <Badge className="min-w-[60px] justify-center">{minState}</Badge>
              <span className="text-muted-foreground">←</span>
              <span>{origStates.join(', ')}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button onClick={onReset} variant="outline">
          <RotateCcw className="w-4 h-4 mr-2" />
          Start Over
        </Button>
      </div>
    </motion.div>
  );
}
