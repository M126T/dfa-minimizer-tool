import { PartitionStep } from '@/lib/dfa';
import { motion } from 'framer-motion';

interface Props {
  steps: PartitionStep[];
}

export function PartitionSteps({ steps }: Props) {
  return (
    <div className="space-y-3">
      <h4 className="font-semibold text-sm">Partition Refinement Steps</h4>
      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
        {steps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="partition-step bg-muted/50"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-primary">{step.label}</span>
              <span className="text-xs text-muted-foreground">{step.description}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {step.partitions.map((group, gi) => (
                <span key={gi} className="inline-flex items-center bg-card border rounded px-2 py-0.5 text-xs font-mono">
                  {'{'}{group.join(', ')}{'}'}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
