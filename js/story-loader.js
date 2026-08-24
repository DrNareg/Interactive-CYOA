const STORY_INDEX_PATH = 'stories/index.json';

export async function loadStoryRegistry() {
  const response = await fetch(STORY_INDEX_PATH, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error('Unable to load story registry.');
  }

  const registry = await response.json();
  return Array.isArray(registry) ? registry : [];
}

export async function loadStoryPack(id) {
  const metadataUrl = `stories/${id}/metadata.json`;
  const storyUrl = `stories/${id}/story.json`;

  const [metadataResponse, storyResponse] = await Promise.all([
    fetch(metadataUrl, { cache: 'no-store' }),
    fetch(storyUrl, { cache: 'no-store' })
  ]);

  if (!metadataResponse.ok || !storyResponse.ok) {
    throw new Error(`Unable to load story pack: ${id}`);
  }

  const metadata = await metadataResponse.json();
  const story = await storyResponse.json();

  return { metadata, story };
}

export function parseChoiceText(text = '') {
  return text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
}
