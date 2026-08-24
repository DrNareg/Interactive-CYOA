export function createTimelineEntry(sceneId, choiceId, sceneTitle, choiceText) {
  return {
    sceneId,
    choiceId,
    sceneTitle,
    choiceText,
    timestamp: Date.now()
  };
}

export function computeTimelineSummary(timelines = []) {
  const total = timelines.length;
  return {
    total,
    latest: total ? timelines[timelines.length - 1] : null
  };
}

export function buildCheckpointTree(timeline = []) {
  return timeline.map((entry, index) => ({
    ...entry,
    depth: index
  }));
}
