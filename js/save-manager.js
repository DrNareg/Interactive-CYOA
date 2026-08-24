const STORAGE_KEY = 'interactive-cyoa-state-v1';

export function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { stories: {} };
  } catch (error) {
    console.warn('Unable to load local progress.', error);
    return { stories: {} };
  }
}

export function saveProgress(progress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function getStoryProgress(progress, storyId) {
  return progress.stories?.[storyId] || {
    achievements: [],
    endings: [],
    timelines: [],
    discoveredScenes: [],
    discoveredChoices: [],
    completion: 0,
    state: { variables: {} }
  };
}

export function persistCurrentRun(progress, storyId, state) {
  const story = getStoryProgress(progress, storyId);
  story.currentRun = {
    runId: state.runId,
    currentSceneId: state.currentSceneId,
    variables: { ...state.variables },
    sceneHistory: [...state.sceneHistory],
    timeline: [...state.timeline],
    visitedScenes: [...(state.visitedScenes || [])],
    discoveredChoices: [...(state.discoveredChoices || [])],
    completed: Boolean(state.ending)
  };
  progress.stories[storyId] = story;
  saveProgress(progress);
}
