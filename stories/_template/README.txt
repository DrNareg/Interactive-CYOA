Creating a new story pack:

1. Copy the _template folder.
2. Rename it to your story ID.
3. Edit metadata.json with the new identity, title, subtitle, and starting scene.
4. Write the story in story.txt if you want a human-readable source.
5. Update story.json to match the runtime format used by the engine.
6. Add any optional assets under assets/.
7. Register the story by adding its folder name to stories/index.json.
8. Test each ending and verify the choice flow.

A new story should be a simple folder with metadata.json, story.json, and optional content files.
The engine loads story metadata and scene definitions from the json file, not from hardcoded JS.
