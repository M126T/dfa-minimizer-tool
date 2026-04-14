# DFA Minimization Visualizer

A clean, interactive web application designed to help students and developers understand Deterministic Finite Automaton (DFA) minimization. This tool takes the abstract concepts of automata theory and turns them into a visual experience. It uses the partition refinement algorithm—rooted in the Myhill-Nerode equivalence theorem—to simplify complex machines into their most efficient forms.

**View Live Demo:** [https://dfa-minimizer-tool.vercel.app/](https://dfa-minimizer-tool.vercel.app/)

---

## Key Features

### Interactive Graph Visualization
* **Side-by-Side Comparison:** View your original DFA next to its minimized version to see the difference instantly.
* **Physics-Based Layout:** Built with `vis-network`, so nodes automatically space themselves out for better readability.
* **Standard UI Conventions:** Clear indicators for start states and double-bordered circles for accept states. It also groups transition labels (like 0, 1) to keep the graph from getting cluttered.
* **State Mapping Tooltips:** If you're curious about how a state was merged, you can hover over any minimized node to see the original states that comprise it.

### Reliable Minimization Engine
* **Unreachable State Pruning:** The app runs a Breadth-First Search (BFS) from the start state to strip away any dead nodes before the minimization process even starts.
* **Partition Refinement:** A faithful implementation of iterative state splitting ($P_0, P_1, \dots$) that continues until equivalence classes stabilize.
* **Predictable Results:** The execution is idempotent, meaning you'll get the same deterministic output every time you run it.

### Built for Learning
* **Guided Workflow:** A simple 3-step setup that walks you through defining your alphabet, setting up the transition table, and viewing the results.
* **Detailed Execution Log:** A step-by-step breakdown showing exactly how partitions were split during each iteration.
* **Presets and Randomization:** Start with "Easy" or "Hard" templates, or use the random generator to test the algorithm with unique cases.
* **Live Validation:** Real-time checks to catch missing transitions or duplicate symbols before you run the algorithm.

---

## The Algorithm Under the Hood

The app uses a standard $\mathcal{O}(n^2)$ partition refinement approach:

1.  **Preprocessing:** A quick traversal removes any states that cannot be reached from the initial state.
2.  **Initial Partition ($P_0$):** States are split into two groups: Final States ($F$) and Non-Final States ($Q - F$).
3.  **Iterative Refinement ($P_{n+1}$):** For every group, the engine checks where each state transitions for every input symbol. If states in the same group land in different partitions, they are split into new groups.
4.  **Stabilization:** This continues until no more splits can be made.
5.  **Reconstruction:** Each group in the final partition is merged into a single state to form the minimal DFA.

---

## Getting Started

### Prerequisites
* Node.js (v18 or higher)
* Bun (Recommended) or npm

### Local Development

1.  **Clone the repository**
    ```bash
    git clone [https://github.com/yourusername/dfa-minimizer-tool.git](https://github.com/yourusername/dfa-minimizer-tool.git)
    cd dfa-minimizer-tool
    ```

2.  **Install dependencies**
    ```bash
    bun install
    ```

3.  **Start the development server**
    ```bash
    bun run dev
    ```
