import { useEffect, useRef, useState } from 'react';
import { DFADefinition } from '@/lib/dfa';
import { Network } from 'vis-network/standalone';
import { DataSet } from 'vis-data/standalone';

interface DFAGraphProps {
  dfa: DFADefinition;
  title: string;
  stateMapping?: Record<string, string[]>;
  showUnreachable?: boolean;
  unreachableStates?: string[];
  highlightStates?: string[];
}

export function DFAGraph({ dfa, title, stateMapping, showUnreachable, unreachableStates = [], highlightStates = [] }: DFAGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredState, setHoveredState] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const highlightSet = new Set(highlightStates);
    const allStates = showUnreachable
      ? [...dfa.states, ...unreachableStates]
      : dfa.states;

    const unreachableSet = new Set(unreachableStates);
    const acceptSet = new Set(dfa.acceptStates);

    const nodesArray = allStates.map(s => ({
      id: s,
      label: s,
      shape: 'circle' as const,
      size: 28,
      font: {
        face: 'JetBrains Mono, monospace',
        size: 13,
        color: unreachableSet.has(s) ? '#999' : '#1a1a2e',
      },
      color: {
        background: unreachableSet.has(s)
          ? '#f5f5f5'
          : highlightSet.has(s)
          ? '#fef3c7'
          : acceptSet.has(s)
          ? '#d1fae5'
          : '#e0f2fe',
        border: unreachableSet.has(s)
          ? '#ccc'
          : highlightSet.has(s)
          ? '#f59e0b'
          : acceptSet.has(s)
          ? '#059669'
          : '#0284c7',
        highlight: {
          background: '#bfdbfe',
          border: '#2563eb',
        },
      },
      borderWidth: acceptSet.has(s) ? 3 : 1.5,
      borderWidthSelected: 3,
      opacity: unreachableSet.has(s) ? 0.5 : 1,
      title: stateMapping?.[s]
        ? `Contains: ${stateMapping[s].join(', ')}`
        : s === dfa.startState
        ? 'Start state'
        : acceptSet.has(s)
        ? 'Accept state'
        : undefined,
    }));

    // Invisible start arrow node
    (nodesArray as any[]).push({
      id: '__start__',
      label: '',
      shape: 'dot',
      size: 1,
      font: { face: '', size: 1, color: 'transparent' },
      color: { background: 'transparent', border: 'transparent', highlight: { background: 'transparent', border: 'transparent' } },
      borderWidth: 0,
      borderWidthSelected: 0,
      opacity: 0,
      title: undefined,
    });

    // Build edges - combine labels for same source-target
    const edgeMap = new Map<string, string[]>();
    for (const state of dfa.states) {
      for (const sym of dfa.alphabet) {
        const target = dfa.transitions[state]?.[sym];
        if (target) {
          const key = `${state}|${target}`;
          if (!edgeMap.has(key)) edgeMap.set(key, []);
          edgeMap.get(key)!.push(sym);
        }
      }
    }

    const edgesArray: any[] = [
      {
        from: '__start__',
        to: dfa.startState,
        arrows: 'to',
        color: { color: '#0d9488', highlight: '#0d9488' },
        width: 2,
        smooth: { type: 'curvedCW', roundness: 0 },
      },
    ];

    for (const [key, syms] of edgeMap.entries()) {
      const [from, to] = key.split('|');
      const isSelf = from === to;
      edgesArray.push({
        from,
        to,
        label: syms.join(', '),
        arrows: 'to',
        font: { face: 'JetBrains Mono, monospace', size: 11, align: 'top' },
        color: { color: '#64748b', highlight: '#2563eb' },
        width: 1.5,
        smooth: isSelf
          ? { type: 'curvedCW', roundness: 0.8 }
          : from < to
          ? { type: 'curvedCW', roundness: 0.15 }
          : { type: 'curvedCCW', roundness: 0.15 },
      });
    }

    const network = new Network(
      containerRef.current,
      { nodes: nodesArray as any, edges: edgesArray as any },
      {
        physics: {
          enabled: true,
          solver: 'forceAtlas2Based',
          forceAtlas2Based: {
            gravitationalConstant: -40,
            centralGravity: 0.01,
            springLength: 130,
            springConstant: 0.06,
          },
          stabilization: { iterations: 200 },
        },
        interaction: {
          hover: true,
          tooltipDelay: 100,
        },
        layout: {
          improvedLayout: true,
        },
      }
    );

    network.on('hoverNode', (params: any) => {
      if (params.node !== '__start__') setHoveredState(params.node as string);
    });
    network.on('blurNode', () => setHoveredState(null));

    return () => network.destroy();
  }, [dfa, showUnreachable, unreachableStates, highlightStates, stateMapping]);

  return (
    <div className="space-y-2">
      <h4 className="font-semibold text-sm">{title}</h4>
      <div className="graph-container relative" style={{ height: 360 }}>
        <div ref={containerRef} className="w-full h-full" />
        {hoveredState && stateMapping?.[hoveredState] && (
          <div className="absolute bottom-3 left-3 bg-card border rounded-lg px-3 py-2 shadow-lg">
            <p className="text-xs text-muted-foreground">Contains original states:</p>
            <p className="font-mono text-sm font-semibold">{stateMapping[hoveredState].join(', ')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
