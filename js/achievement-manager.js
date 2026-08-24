export function buildAchievements(story) {
  const list = Array.isArray(story.achievements) ? story.achievements : [];
  return list.map((item, index) => ({
    id: item.id || `achievement-${index}`,
    title: item.title || 'Untitled Achievement',
    description: item.description || '',
    hidden: Boolean(item.hidden),
    unlocked: false
  }));
}

export function unlockAchievement(achievements, achievementId) {
  const achievement = achievements.find((entry) => entry.id === achievementId);
  if (!achievement || achievement.unlocked) {
    return false;
  }

  achievement.unlocked = true;
  return true;
}

export function calculateAchievementProgress(achievements) {
  const total = achievements.length;
  const unlocked = achievements.filter((item) => item.unlocked).length;
  return { total, unlocked, percent: total ? Math.round((unlocked / total) * 100) : 0 };
}
