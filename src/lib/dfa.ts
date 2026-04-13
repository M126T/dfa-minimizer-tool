// ===== Types =====

export interface DFADefinition {
  alphabet: string[];
  states: string[];
  startState: string;
  acceptStates: string[];
  transitions: Record<string, Record<string, string>>; // state -> symbol -> state
}

export interface MinimizationResult {
  originalDFA: DFADefinition;
  unreachableStates: string[];
  reachableDFA: DFADefinition;
  partitionSteps: PartitionStep[];
  minimizedDFA: DFADefinition;
  stateMapping: Record<string, string[]>; // minimized state -> original states
}

export interface PartitionStep {
  label: string;
  partitions: string[][];
  description: string;
}

// ===== Validation =====

export interface ValidationError {
  field: string;
  message: string;
}

export function validateDFA(dfa: DFADefinition): ValidationError[] {
  const errors: ValidationError[] = [];

  if (dfa.alphabet.length === 0) {
    errors.push({ field: 'alphabet', message: 'Alphabet must not be empty' });
  }
  if (dfa.states.length === 0) {
    errors.push({ field: 'states', message: 'Must have at least one state' });
  }
  if (!dfa.states.includes(dfa.startState)) {
    errors.push({ field: 'startState', message: `Start state "${dfa.startState}" is not in the set of states` });
  }
  for (const s of dfa.acceptStates) {
    if (!dfa.states.includes(s)) {
      errors.push({ field: 'acceptStates', message: `Accept state "${s}" is not in the set of states` });
    }
  }
  if (dfa.acceptStates.length === 0) {
    errors.push({ field: 'acceptStates', message: 'Must have at least one accept state' });
  }

  // Check transitions completeness
  for (const state of dfa.states) {
    for (const sym of dfa.alphabet) {
      const target = dfa.transitions[state]?.[sym];
      if (!target) {
        errors.push({ field: 'transitions', message: `Missing transition: δ(${state}, ${sym})` });
      } else if (!dfa.states.includes(target)) {
        errors.push({ field: 'transitions', message: `Invalid target state "${target}" in δ(${state}, ${sym})` });
      }
    }
  }

  return errors;
}

// ===== Unreachable State Removal =====

function findReachableStates(dfa: DFADefinition): Set<string> {
  const visited = new Set<string>();
  const queue = [dfa.startState];
  visited.add(dfa.startState);

  while (queue.length > 0) {
    const current = queue.shift()!;
    for (const sym of dfa.alphabet) {
      const next = dfa.transitions[current]?.[sym];
      if (next && !visited.has(next)) {
        visited.add(next);
        queue.push(next);
      }
    }
  }
  return visited;
}

function removeUnreachableStates(dfa: DFADefinition): { reachableDFA: DFADefinition; unreachable: string[] } {
  const reachable = findReachableStates(dfa);
  const unreachable = dfa.states.filter(s => !reachable.has(s));

  const newTransitions: Record<string, Record<string, string>> = {};
  for (const state of dfa.states) {
    if (reachable.has(state)) {
      newTransitions[state] = { ...dfa.transitions[state] };
    }
  }

  return {
    unreachable,
    reachableDFA: {
      alphabet: [...dfa.alphabet],
      states: dfa.states.filter(s => reachable.has(s)),
      startState: dfa.startState,
      acceptStates: dfa.acceptStates.filter(s => reachable.has(s)),
      transitions: newTransitions,
    },
  };
}

// ===== Partition Refinement =====

function minimizeDFAInternal(dfa: DFADefinition): {
  steps: PartitionStep[];
  minimizedDFA: DFADefinition;
  stateMapping: Record<string, string[]>;
} {
  const { states, alphabet, acceptStates, transitions, startState } = dfa;
  const acceptSet = new Set(acceptStates);

  // P0: separate final and non-final
  const nonFinal = states.filter(s => !acceptSet.has(s));
  const final = states.filter(s => acceptSet.has(s));

  let partitions: string[][] = [];
  if (nonFinal.length > 0) partitions.push(nonFinal);
  if (final.length > 0) partitions.push(final);

  const steps: PartitionStep[] = [];
  steps.push({
    label: 'P0',
    partitions: partitions.map(p => [...p]),
    description: 'Initial partition: separate final and non-final states',
  });

  // Helper: find which partition index a state belongs to
  function getPartitionIndex(state: string, parts: string[][]): number {
    for (let i = 0; i < parts.length; i++) {
      if (parts[i].includes(state)) return i;
    }
    return -1;
  }

  let changed = true;
  let iteration = 0;

  while (changed) {
    changed = false;
    const newPartitions: string[][] = [];

    for (const group of partitions) {
      if (group.length <= 1) {
        newPartitions.push(group);
        continue;
      }

      // Split group based on transition signatures
      const signatureMap = new Map<string, string[]>();

      for (const state of group) {
        const sig = alphabet
          .map(sym => getPartitionIndex(transitions[state][sym], partitions))
          .join(',');

        if (!signatureMap.has(sig)) {
          signatureMap.set(sig, []);
        }
        signatureMap.get(sig)!.push(state);
      }

      const splits = Array.from(signatureMap.values());
      if (splits.length > 1) changed = true;
      newPartitions.push(...splits);
    }

    partitions = newPartitions;
    iteration++;

    if (changed) {
      steps.push({
        label: `P${iteration}`,
        partitions: partitions.map(p => [...p]),
        description: `Refined by splitting groups with different transition signatures`,
      });
    }
  }

  // Build minimized DFA
  // Name each partition
  const stateMapping: Record<string, string[]> = {};
  const partitionNames: Map<number, string> = new Map();

  for (let i = 0; i < partitions.length; i++) {
    // Use the "smallest" state name as representative, or combine
    const sorted = [...partitions[i]].sort();
    const name = partitions[i].length === 1 ? sorted[0] : `{${sorted.join(',')}}`;
    partitionNames.set(i, name);
    stateMapping[name] = [...partitions[i]];
  }

  const minimizedStates = Array.from(partitionNames.values());
  const minimizedTransitions: Record<string, Record<string, string>> = {};

  for (let i = 0; i < partitions.length; i++) {
    const rep = partitions[i][0];
    const name = partitionNames.get(i)!;
    minimizedTransitions[name] = {};

    for (const sym of alphabet) {
      const target = transitions[rep][sym];
      const targetIdx = getPartitionIndex(target, partitions);
      minimizedTransitions[name][sym] = partitionNames.get(targetIdx)!;
    }
  }

  const startIdx = getPartitionIndex(startState, partitions);
  const minimizedStartState = partitionNames.get(startIdx)!;
  const minimizedAcceptStates = partitions
    .map((p, i) => ({ p, i }))
    .filter(({ p }) => p.some(s => acceptSet.has(s)))
    .map(({ i }) => partitionNames.get(i)!);

  return {
    steps,
    minimizedDFA: {
      alphabet: [...alphabet],
      states: minimizedStates,
      startState: minimizedStartState,
      acceptStates: minimizedAcceptStates,
      transitions: minimizedTransitions,
    },
    stateMapping,
  };
}

// ===== Main Entry Point =====

export function minimizeDFA(dfa: DFADefinition): MinimizationResult {
  const { reachableDFA, unreachable } = removeUnreachableStates(dfa);
  const { steps, minimizedDFA, stateMapping } = minimizeDFAInternal(reachableDFA);

  return {
    originalDFA: dfa,
    unreachableStates: unreachable,
    reachableDFA,
    partitionSteps: steps,
    minimizedDFA,
    stateMapping,
  };
}

// ===== Presets =====

export const PRESETS: { name: string; difficulty: string; description: string; dfa: DFADefinition }[] = [
  {
    name: 'Simple Even/Odd',
    difficulty: 'Easy',
    description: 'Accepts binary strings with even number of 1s',
    dfa: {
      alphabet: ['0', '1'],
      states: ['q0', 'q1', 'q2'],
      startState: 'q0',
      acceptStates: ['q0'],
      transitions: {
        q0: { '0': 'q0', '1': 'q1' },
        q1: { '0': 'q1', '1': 'q0' },
        q2: { '0': 'q2', '1': 'q2' }, // unreachable trap
      },
    },
  },
  {
    name: 'Redundant States',
    difficulty: 'Medium',
    description: 'DFA with equivalent and unreachable states',
    dfa: {
      alphabet: ['a', 'b'],
      states: ['A', 'B', 'C', 'D', 'E', 'F'],
      startState: 'A',
      acceptStates: ['C', 'D', 'E'],
      transitions: {
        A: { a: 'B', b: 'C' },
        B: { a: 'A', b: 'D' },
        C: { a: 'E', b: 'F' },
        D: { a: 'E', b: 'F' },
        E: { a: 'E', b: 'F' },
        F: { a: 'F', b: 'F' },
      },
    },
  },
  {
    name: 'Complex Merge',
    difficulty: 'Hard',
    description: 'Multiple equivalent state groups with unreachable states',
    dfa: {
      alphabet: ['0', '1'],
      states: ['s0', 's1', 's2', 's3', 's4', 's5', 's6', 's7'],
      startState: 's0',
      acceptStates: ['s2', 's4', 's6'],
      transitions: {
        s0: { '0': 's1', '1': 's2' },
        s1: { '0': 's0', '1': 's3' },
        s2: { '0': 's4', '1': 's5' },
        s3: { '0': 's4', '1': 's5' },
        s4: { '0': 's4', '1': 's5' },
        s5: { '0': 's5', '1': 's5' },
        s6: { '0': 's6', '1': 's6' }, // unreachable
        s7: { '0': 's7', '1': 's6' }, // unreachable
      },
    },
  },
];

// ===== Random DFA Generator =====

export function generateRandomDFA(numStates: number = 6, alphabetSize: number = 2): DFADefinition {
  const alphabet = Array.from({ length: alphabetSize }, (_, i) => String.fromCharCode(97 + i)); // a, b, c...
  const states = Array.from({ length: numStates }, (_, i) => `q${i}`);
  const startState = 'q0';

  // Random accept states (at least 1, at most half)
  const numAccept = Math.max(1, Math.floor(Math.random() * (numStates / 2)) + 1);
  const shuffled = [...states].sort(() => Math.random() - 0.5);
  const acceptStates = shuffled.slice(0, numAccept);

  const transitions: Record<string, Record<string, string>> = {};
  for (const state of states) {
    transitions[state] = {};
    for (const sym of alphabet) {
      transitions[state][sym] = states[Math.floor(Math.random() * numStates)];
    }
  }

  return { alphabet, states, startState, acceptStates, transitions };
}
