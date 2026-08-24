export function createInitialState() {
  return {
    variables: {},
    visitedScenes: new Set(),
    discoveredChoices: new Set(),
    currentSceneId: '',
    sceneHistory: [],
    timeline: [],
    runId: crypto.randomUUID ? crypto.randomUUID() : `run-${Date.now()}`,
    startedAt: Date.now(),
    completion: 0,
    isFirstRun: true,
  };
}

export function ensureVariableMap(state, rawVariables = {}) {
  state.variables = { ...(rawVariables || {}) };
}

export function getVariable(state, name, fallback = 0) {
  return Number(state.variables?.[name] ?? fallback);
}

export function setVariable(state, name, value) {
  state.variables[name] = Number(value || 0);
}

export function applyDelta(state, variable, delta) {
  const current = getVariable(state, variable, 0);
  setVariable(state, variable, current + Number(delta || 0));
}

export function evaluateCondition(state, condition = []) {
  if (!Array.isArray(condition) || condition.length === 0) return true;

  return condition.every((entry) => {
    const field = entry.variable;
    const op = entry.operator || '>=';
    const value = Number(entry.value ?? 0);
    const current = getVariable(state, field, 0);

    switch (op) {
      case '>=': return current >= value;
      case '>': return current > value;
      case '<=': return current <= value;
      case '<': return current < value;
      case '==': return current === value;
      case '!=': return current !== value;
      default: return true;
    }
  });
}

export function addChoiceDiscovery(state, choiceId) {
  if (!choiceId) return;
  state.discoveredChoices = state.discoveredChoices || new Set();
  state.discoveredChoices.add(choiceId);
}

export function markSceneVisited(state, sceneId) {
  if (!sceneId) return;
  state.visitedScenes = state.visitedScenes || new Set();
  state.visitedScenes.add(sceneId);
}

export function snapshotState(state) {
  return {
    variables: { ...state.variables },
    currentSceneId: state.currentSceneId,
    sceneHistory: [...state.sceneHistory],
    timeline: [...state.timeline],
    visitedScenes: [...(state.visitedScenes || [])],
    discoveredChoices: [...(state.discoveredChoices || [])],
  };
}
