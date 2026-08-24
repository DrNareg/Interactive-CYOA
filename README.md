# Interactive CYOA

A modular Choose Your Own Adventure web app built for replayable stories and story-pack loading. The first story pack is an alternate-history take on Vice City, but the engine is designed to load future story packs without rewriting core logic.

## Features

- Generic story engine
- Story registry and metadata loading
- Scene and choice-based branching
- Variable-driven choices and state tracking
- Multiple endings and achievement tracking
- Timeline/history storage in browser localStorage
- Responsive story UI with a lightweight neon crime-drama look
- Template story pack for creating future stories

## Project structure

- index.html — app shell
- css/ — styling for layout, story reading, and timelines
- js/ — engine, persistence, loader, and UI logic
- stories/ — story registry and story packs
  - index.json — available stories
  - vice-city/ — main playable story pack
  - _template/ — starter pack for new stories

## Running locally

Because this is a static frontend, you can run it with any local static server. For example:

python3 -m http.server 8000

Then open:

http://localhost:8000

## Story format

The engine expects each story pack to contain:

- metadata.json — story metadata and starting scene
- story.json — runtime scene graph
- optional story.txt — human-readable source
- optional assets/ directory

Example metadata:

{
  "id": "vice-city",
  "title": "Vice City: Alternate Timelines",
  "subtitle": "What if Tommy chose differently?",
  "estimatedMinutes": 8,
  "setting": "Vice City, 1986",
  "version": "1.0",
  "startingScene": "opening_deal"
}

Example runtime scene:

{
  "id": "opening_deal",
  "title": "The Deal",
  "text": ["The warehouse bursts into gunfire."],
  "choices": [
    {
      "id": "call_sonny",
      "label": "Call Sonny and tell him the truth",
      "next": "sonny_call",
      "effects": { "sonny_trust": 8 },
      "requires": []
    }
  ]
}

## Variables and conditions

Variables are arbitrary key/value states that are stored in the current run. Future choices can depend on them through the requires array. The engine supports simple comparisons such as >=, <=, >, <, ==, and !=.

## Endings and achievements

Each ending is a scene with an ending object. The object can include:

- title
- summary
- status
- achievement

Achievements are stored in the story definition and can be unlocked when a matching ending is reached.

## Timeline and saves

The app stores browser progress using localStorage, including:

- current run state
- discovered choices and scenes
- completed endings
- achievements
- saved timelines

## Creating another story

1. Copy the template folder in stories/_template.
2. Rename the folder to your story id.
3. Update metadata.json.
4. Create or update the scene graph in story.json.
5. Add art or UI assets as needed.
6. Register the story in stories/index.json.
7. Test each ending and verify the flow.

## Notes

This is a lightweight static proof-of-concept aligned with the project plan. It focuses on a modular, story-pack architecture and a complete playable Vice City example without hardcoding story logic into the engine itself.
