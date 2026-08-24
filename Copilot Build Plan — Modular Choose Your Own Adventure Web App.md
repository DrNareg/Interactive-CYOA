# Project: Modular Choose Your Own Adventure Web App

## 1. Project Goal

Build a polished, modular web application for short interactive **Choose Your Own Adventure (CYOA)** stories.

The first playable story will be an alternate-history interpretation of the **Grand Theft Auto: Vice City** storyline.

The application must be designed as a **generic story engine**, not as a Vice City-specific application.

Vice City should simply be the first "story pack" loaded by the engine.

Future stories should be addable primarily by copying a template folder and editing story/content files.

### Target experience

A complete playthrough should take approximately:

**5–10 minutes**

A story should contain:

- Narrative scenes
- Player decisions
- Branching paths
- Hidden state/relationship variables
- Conditional choices
- Multiple endings
- Achievements
- Story completion statistics
- A visual timeline/tree
- Multiple saved timelines

The experience should encourage replaying the story to discover alternate paths and endings.

---

# 2. Important Development Principle

DO NOT hardcode Vice City-specific characters, variables, endings, images, text, or logic into the main application.

The application should work like:

```text
CYOA Engine
    ↓
Story Loader
    ↓
Story Pack
    ↓
Scenes / Choices / Variables / Endings
```

Vice City is simply:

```text
stories/vice-city/
```

A future story could be:

```text
stories/example-story/
```

without requiring the core engine to be rewritten.

---

# 3. Suggested Project Structure

Use a clean modular structure similar to:

```text
/
├── index.html
├── README.md
│
├── css/
│   ├── base.css
│   ├── layout.css
│   ├── story.css
│   ├── timeline.css
│   └── responsive.css
│
├── js/
│   ├── app.js
│   ├── story-loader.js
│   ├── story-engine.js
│   ├── state-manager.js
│   ├── save-manager.js
│   ├── achievement-manager.js
│   ├── timeline-manager.js
│   └── ui.js
│
├── stories/
│   │
│   ├── vice-city/
│   │   ├── story.txt
│   │   ├── story.json
│   │   ├── metadata.json
│   │   └── assets/
│   │       └── README.txt
│   │
│   └── _template/
│       ├── story.txt
│       ├── story.json
│       ├── metadata.json
│       ├── README.txt
│       └── assets/
│           └── README.txt
│
└── assets/
    ├── icons/
    └── ui/
```

Adjust this structure if there is a technically cleaner implementation, but preserve the separation between:

**Engine**

and

**Story content**

---

# 4. Story Source File

The human-editable story MUST be stored in:

```text
stories/vice-city/story.txt
```

The goal is for a person to be able to write or modify a story without digging through JavaScript.

Create a clear text format that is easy to understand.

For example:

```text
[SCENE: deal_aftermath]

TITLE: The Deal

TEXT:
The exchange has been ambushed.

Harry and Lee are dead. Tommy and Ken barely escape with their lives.

The cocaine is gone.

The money is gone.

And Sonny Forelli is expecting an explanation.

CHOICE:
Call Sonny and tell him what happened.
-> sonny_phone_call
sonny_trust +5

CHOICE:
Tell Sonny everything went perfectly and buy yourself time.
-> lie_to_sonny
sonny_trust -15

CHOICE:
Decide Sonny isn't getting another dollar.
-> cut_ties
sonny_trust -40
reputation +10

END_SCENE
```

Copilot may improve this syntax if necessary.

The priorities are:

1. Human readable
2. Easy to edit
3. Easy to duplicate
4. Supports branching
5. Supports variables
6. Supports conditions
7. Supports achievements
8. Supports endings

---

# 5. Runtime Story Format

If parsing the TXT directly becomes unnecessarily complicated, use:

```text
story.txt
```

as the human-readable master/reference and:

```text
story.json
```

as the structured runtime version.

The engine should consume structured story data rather than containing story logic itself.

Document how TXT maps to JSON.

Do NOT create a complicated custom programming language.

Keep story authoring simple.

---

# 6. Story Metadata

Each story should have:

```text
metadata.json
```

Example:

```json
{
  "id": "vice-city",
  "title": "Vice City: Alternate Timelines",
  "subtitle": "What if Tommy chose differently?",
  "estimatedMinutes": 8,
  "setting": "Vice City, 1986",
  "version": "1.0",
  "startingScene": "deal_aftermath"
}
```

The application should use metadata instead of hardcoded story information.

---

# 7. Story Selection Screen

The homepage should show available stories.

Example:

```text
CHOOSE YOUR TIMELINE

┌─────────────────────────────────┐
│                                 │
│        VICE CITY                │
│     ALTERNATE TIMELINES         │
│                                 │
│ What if Tommy chose differently?│
│                                 │
│ 5–10 MINUTES                    │
│                                 │
│          [ PLAY ]               │
└─────────────────────────────────┘
```

Future story folders should be capable of appearing here without redesigning the application.

---

# 8. Vice City Story

Create a complete playable Vice City story in:

```text
stories/vice-city/story.txt
```

Use the original game's broad premise as inspiration:

- Tommy Vercetti arrives in Vice City
- The opening deal goes wrong
- Sonny expects his money
- Tommy begins investigating
- Tommy encounters major figures in Vice City
- Tommy builds influence
- Diaz becomes an important factor
- Tommy and Lance's relationship changes
- Sonny eventually becomes a major threat
- The story reaches a final confrontation

However, this is an **alternate timeline**, so player decisions should be capable of dramatically changing events.

Do not simply summarize the original game.

The player should actively influence the story.

---

# 9. Canon Path

One possible route should approximately follow the recognizable outcome of the original game.

However:

**DO NOT identify choices as "Canon", "Original Choice", or similar during the first playthrough.**

The player should not know which choices reproduce the original timeline.

After discovering the corresponding ending, the application may identify it as:

```text
CANON ENDING DISCOVERED
```

---

# 10. Story Length

A single playthrough should take:

**Maximum approximately 10 minutes.**

Target approximately:

**8–12 meaningful decisions per playthrough.**

Do not require the player to read huge walls of text.

Individual scenes should generally be concise enough to keep the story moving.

Important scenes can be longer.

---

# 11. Branching Philosophy

Avoid creating a completely separate story after every choice.

Instead, branches should sometimes diverge and sometimes reconnect.

Example:

```text
                     DEAL
                      │
          ┌───────────┼───────────┐
          │           │           │
      Tell Sonny    Lie        Cut Ties
          │           │           │
          └──────┐    │    ┌──────┘
                 ↓    ↓    ↓
                INVESTIGATION
                      │
                  DIAZ ARC
```

Earlier decisions should still matter because they modify state.

This keeps the story manageable while allowing meaningful variation.

---

# 12. State System

The engine must support arbitrary variables defined by each story.

For Vice City, consider variables such as:

```text
sonny_trust
lance_loyalty
diaz_trust
cortez_trust
reputation
police_heat
wealth
empire_power
```

These values should NOT necessarily be shown directly to the player.

Choices modify them.

Example:

```text
Help Lance get revenge.

lance_loyalty +20
reputation +5
police_heat +10
```

Later scenes can behave differently based on those values.

---

# 13. Conditional Choices

The engine must support choices that only appear when requirements are satisfied.

Example:

```text
CHOICE:
Ask Lance to stand with you against Sonny.

REQUIRES:
lance_loyalty >= 70

-> lance_alliance
```

Another player with low Lance loyalty might never see this option.

This creates meaningful replayability.

---

# 14. Character Relationships

Relationships should be an important part of Vice City's branching.

Especially:

### Lance Vance

The player's treatment of Lance should heavily influence his eventual behavior.

Possible outcomes include:

- Lance remains loyal
- Lance becomes Tommy's equal partner
- Lance reluctantly stays
- Lance betrays Tommy as in the original timeline
- Lance betrays Tommy earlier
- Lance attempts to take the empire himself
- Lance dies under different circumstances

The betrayal should NOT be inevitable.

---

# 15. Major Branching Opportunities

Create interesting alternate possibilities around events such as:

### Sonny Forelli

Tommy can:

- Remain loyal
- Lie to Sonny
- Repay Sonny
- Slowly distance himself
- Openly rebel
- Attempt to manipulate him
- Prepare for war

### Ricardo Diaz

Tommy can potentially:

- Work for Diaz
- Betray Diaz
- Kill Diaz
- Become Diaz's partner
- Manipulate Diaz
- Leave Diaz in control

### Lance

Tommy can:

- Respect him
- Ignore him
- Manipulate him
- Treat him as an equal
- Betray him
- Depend heavily on him

### Vice City Empire

Tommy can prioritize:

- Money
- Loyalty
- Violence
- Political influence
- Independence
- Alliances

These decisions should contribute to different endings.

---

# 16. Endings

Target approximately:

**8–12 major endings.**

Possible examples:

### King of Vice City

The recognizable original outcome.

Tommy defeats Sonny and Lance and controls Vice City.

### Vercetti & Vance

Tommy treats Lance as a legitimate partner.

Together they defeat Sonny and jointly control their empire.

### Lance Vance

Lance successfully betrays Tommy and takes control.

### Forelli Victory

Tommy fails to build enough power and Sonny eliminates him.

### Diaz Empire

Tommy chooses to remain aligned with Diaz rather than overthrowing him.

### The Partnership

Tommy and Diaz reach an uneasy but profitable long-term arrangement.

### Back to Liberty

Tommy earns enough money to settle his debt with Sonny and leaves Vice City.

Give this a humorous achievement such as:

**The Reasonable Adult**

### Witness Protection

A strange hidden route where Tommy eventually cooperates with authorities.

### Empire Collapse

Tommy wins his immediate conflicts but destroys his organization through excessive violence or poor alliances.

### Vice City's Untouchable

Tommy creates an even stronger empire than the original timeline through careful alliances.

Copilot should create additional endings where appropriate.

Endings should feel substantially different rather than merely changing one sentence.

---

# 17. Ending Screen

When an ending is reached, display something like:

```text
TIMELINE COMPLETE

Vercetti & Vance

Tommy Vercetti: ALIVE
Lance Vance: ALIVE
Sonny Forelli: DEAD
Ricardo Diaz: DEAD

Vice City Empire:
VERY STRONG

You convinced Lance that he was more valuable
as a partner than a subordinate.

Together, you defeated Sonny Forelli and created
the most powerful criminal organization in Vice City.

━━━━━━━━━━━━━━━━━━━━

Story discovered: 34%

Choices discovered: 21 / 57

Endings discovered: 2 / 10

Achievements: 4 / 18

[ VIEW TIMELINE ]

[ TRY ANOTHER PATH ]

[ STORY SELECT ]
```

---

# 18. Timeline System

Track the decisions made during each run.

After completing the story, allow the player to view a visual decision tree.

Example:

```text
THE DEAL
   │
   ├── Tell Sonny
   │
   ├── Lie to Sonny ← YOU
   │       │
   │       ├── Work with Cortez ← YOU
   │       │       │
   │       │       └── ???
   │       │
   │       └── ???
   │
   └── ???
```

Undiscovered choices should appear as:

```text
???
```

Do not spoil undiscovered branches.

---

# 19. Timeline Mode

After the player's first completed playthrough, unlock:

**TIMELINE MODE**

Previously reached scenes become checkpoints.

The player should be able to select a previously reached decision and create a new timeline from that point.

This avoids forcing players to repeatedly reread the opening scenes.

Make sure the state existing at that checkpoint is restored correctly.

---

# 20. Saves

Use browser storage for V1.

Prefer:

```text
localStorage
```

unless IndexedDB provides a meaningful advantage.

Store:

- Completed endings
- Achievements
- Discovered scenes
- Discovered choices
- Saved timelines
- Story completion percentage
- Current run
- State snapshots/checkpoints

No account system is necessary for V1.

---

# 21. Multiple Timelines

Allow multiple completed runs.

Example:

```text
YOUR TIMELINES

01 — KING OF VICE CITY
Tommy: Alive
Lance: Dead
Sonny: Dead

02 — VERCETTI & VANCE
Tommy: Alive
Lance: Alive
Sonny: Dead

03 — FORELLI VICTORY
Tommy: Dead
Lance: Unknown
Sonny: Alive
```

Players should be able to inspect previous timelines.

---

# 22. Achievements

Create approximately:

**15–20 achievements**

Examples:

### King of Vice City
Discover the original ending.

### Brothers in Arms
Finish the story with Lance loyal.

### Et Tu, Lance?
Be betrayed by Lance.

### The Reasonable Adult
Repay Sonny and leave Vice City.

### Burn Every Bridge
Become enemies with every major faction.

### Puppet Master
Manipulate multiple factions into fighting each other.

### Untouchable
Finish with extremely high empire power.

### Everybody Lives
Reach an ending where the maximum possible number of major characters survive.

### Worst Timeline
Discover one of the most disastrous possible outcomes.

Some achievements should be hidden until unlocked.

---

# 23. Discovery Percentage

Track completion for each story.

Example:

```text
VICE CITY

Story Discovery: 38%

Scenes:
31 / 72

Choices:
44 / 103

Endings:
4 / 10

Achievements:
7 / 18
```

Do not require 100% completion to enjoy the application.

This is primarily a replay incentive.

---

# 24. Story UI

The reading interface should prioritize atmosphere and readability.

Example:

```text
VICE CITY
1986

━━━━━━━━━━━━━━━━━━━━━━━━

THE DEAL

The exchange was supposed to be simple.

Money for cocaine.

Instead, gunfire tears through the warehouse...

━━━━━━━━━━━━━━━━━━━━━━━━

WHAT DOES TOMMY DO?

[ Call Sonny immediately ]

[ Lie and buy yourself time ]

[ Cut ties with the Forellis ]

━━━━━━━━━━━━━━━━━━━━━━━━

Timeline 03
```

Use subtle transitions between scenes.

Do not overanimate.

---

# 25. Visual Direction

For the Vice City story, use an aesthetic inspired by:

- 1980s Miami
- Neon signage
- Sunset gradients
- Art Deco
- Dark nighttime backgrounds
- Palm silhouettes
- Retro crime-film presentation

However, the **core application UI must support per-story themes.**

Vice City's visual styling should come from its story configuration/theme rather than being permanently built into the global UI.

Future stories may look completely different.

---

# 26. Assets

Avoid requiring copyrighted GTA artwork for the application to function.

Use:

- CSS
- Gradients
- Generic silhouettes
- Original/simple icons
- Story-specific user-provided assets

Create:

```text
stories/vice-city/assets/
```

so assets can easily be added later.

---

# 27. Story Template

This is VERY IMPORTANT.

Create:

```text
stories/_template/
```

This folder should contain everything needed to create another story.

Include:

```text
_template/
├── story.txt
├── story.json
├── metadata.json
├── README.txt
└── assets/
    └── README.txt
```

The template story should contain simple example scenes demonstrating:

- Normal scene
- Multiple choices
- State modification
- Conditional choice
- Achievement
- Ending
- Character status
- Branching
- Branch reconnection

Do not include Vice City-specific content in the template.

---

# 28. Template Documentation

The template README should explain:

## Creating a new story

1. Copy `_template`.
2. Rename the folder.
3. Update `metadata.json`.
4. Write the story in `story.txt`.
5. Create/update `story.json`.
6. Add optional assets.
7. Test every ending.
8. Add the story to the story registry if automatic discovery is not practical.

Provide examples of every supported story feature.

The goal is that someone unfamiliar with the engine could create another story by following this README.

---

# 29. Story Registry

Because a static frontend cannot reliably enumerate folders on a server, create a lightweight registry if necessary.

For example:

```text
stories/index.json
```

containing:

```json
[
  "vice-city"
]
```

Adding another story would then only require:

```json
[
  "vice-city",
  "new-story"
]
```

The engine loads the corresponding metadata.

Do not hardcode story cards directly into HTML.

---

# 30. Responsive Design

The application should work well on:

- Desktop
- Laptop
- Tablet
- Phone

The actual story experience should be particularly good on mobile because this type of game works naturally on a phone.

Choices should be large, comfortable buttons.

Text should remain readable without excessive line width.

---

# 31. Accessibility

Include:

- Keyboard navigation
- Visible focus states
- Semantic HTML
- Proper button elements
- Appropriate contrast
- Reduced-motion support
- Screen-reader-friendly choice controls

Do not sacrifice readability for the neon Vice City aesthetic.

---

# 32. No Runtime AI Requirement

Do NOT require ChatGPT/OpenAI/another AI API to play stories.

The story should be deterministic based on:

```text
Current scene
+
Player choices
+
Story state
```

This makes stories predictable, testable and replayable.

AI can be used during development to help AUTHOR stories, but it should not be required by the application.

---

# 33. Story Validation

Create a development utility or validation function that checks story data for obvious problems.

Check for:

- Duplicate scene IDs
- Choices pointing to nonexistent scenes
- Missing starting scene
- Invalid conditions
- Unreachable endings where detectable
- Missing ending IDs
- Duplicate achievements
- Invalid variable references
- Scenes with no choices and no ending
- Broken asset references

Log useful errors to the console.

A malformed story should fail gracefully instead of crashing the entire application.

---

# 34. Debug Mode

Create an optional developer/debug mode.

When enabled, show information such as:

```text
CURRENT STATE

sonny_trust: -25
lance_loyalty: 70
diaz_trust: 20
reputation: 55
police_heat: 30
wealth: 45
empire_power: 60
```

Also allow jumping to scenes during development.

This should NOT appear during normal gameplay.

---

# 35. Vice City Story Writing Style

Keep the writing:

- Fast
- Cinematic
- Funny when appropriate
- Crime-drama focused
- Easy to read
- Appropriate for short sessions

Avoid giant exposition dumps.

Scenes should generally consist of several short paragraphs followed by meaningful choices.

Choices should not merely be:

```text
Yes
No
Maybe
```

Instead:

```text
Tell Sonny the truth.

Lie and buy yourself time.

Tell Sonny you're finished taking orders.
```

Choices should reveal something about the player's version of Tommy.

---

# 36. Meaningful Consequences

Avoid fake choices.

A choice should ideally do at least one of:

- Change the next scene
- Modify relationships
- Modify resources
- Unlock another choice later
- Remove another choice later
- Change character survival
- Influence an ending
- Unlock an achievement
- Change later dialogue

Some choices can reconverge, but the state changes should preserve their consequences.

---

# 37. Character Outcomes

Endings should be capable of defining the final status of major characters.

Support generic statuses such as:

```text
alive
dead
missing
imprisoned
betrayed
ally
enemy
unknown
```

The engine should not assume these specific statuses are the only possibilities.

Stories should be able to define their own display text.

---

# 38. First Launch Experience

On first launch:

```text
CHOOSE YOUR TIMELINE
```

Show Vice City.

Selecting it opens:

```text
VICE CITY
ALTERNATE TIMELINES

Vice City, 1986.

One deal is about to change everything.

Your decisions will determine who rises,
who falls, and who owns the city.

Estimated time:
5–10 minutes

Multiple endings.

Your decisions matter.

[ BEGIN ]
```

Then immediately begin the story.

Do not bury the player under tutorials.

Teach mechanics naturally.

---

# 39. First Playthrough Rules

During the first run:

DO NOT show:

- Hidden variable numbers
- Undiscovered endings
- Canon-choice labels
- Complete decision tree
- Future consequences

Let the player experience the story naturally.

After completion, reveal the deeper completion/timeline systems.

---

# 40. Replay Experience

After finishing:

```text
NEW FEATURE UNLOCKED

TIMELINE MODE

Return to decisions you've already reached
and discover what could have happened.
```

Then allow checkpoint branching.

The second playthrough should therefore be significantly faster.

---

# 41. Reset Options

Settings should allow:

### Reset Current Run

Restart the current story without deleting discoveries.

### Reset Story Progress

Delete discoveries, achievements and timelines for one story.

### Reset Everything

Delete all local application data.

Require confirmation before destructive resets.

---

# 42. README

Create a strong root:

```text
README.md
```

Explain:

- What the project is
- Architecture
- How stories are loaded
- Folder structure
- Story TXT syntax
- Story JSON schema
- Variables
- Conditions
- Achievements
- Endings
- Timeline system
- Saves
- Debugging
- How to create another story
- How to run locally

---

# 43. Implementation Priority

Build in this order.

## Phase 1 — Engine

Implement:

- Story registry
- Story loading
- Scene rendering
- Choices
- Branch navigation
- Variables
- Conditions

Use a tiny test story first if necessary.

## Phase 2 — Persistence

Implement:

- localStorage
- Current runs
- Discoveries
- Completed endings
- Achievements

## Phase 3 — Vice City

Create the full:

```text
stories/vice-city/story.txt
```

Then create the runtime story data.

Make sure a normal run stays below approximately 10 minutes.

## Phase 4 — Replay Systems

Implement:

- Timeline history
- Checkpoints
- Branching from previous decisions
- Multiple timelines
- Discovery %

## Phase 5 — Polish

Add:

- Vice City theme
- Animations
- Responsive design
- Accessibility
- Ending presentation
- Achievements UI

## Phase 6 — Template

Finalize:

```text
stories/_template/
```

Verify that a completely new story could be created without modifying the engine.

---

# 44. Testing Requirement

Before considering the project complete:

Test every major Vice City ending.

Verify:

- Every ending is reachable.
- No choices lead to missing scenes.
- Conditions work.
- Relationship changes matter.
- Timeline checkpoints restore the correct state.
- Refreshing does not destroy progress.
- Multiple timelines do not overwrite each other.
- Discovery percentages are correct.
- Achievements unlock correctly.
- Mobile layout works.
- The template can create a second test story without changing core engine code.

---

# 45. Important Scope Control

Do NOT overengineer V1.

Do not add yet:

- Accounts
- Multiplayer
- Cloud saves
- Databases
- AI-generated runtime narratives
- User-generated story marketplace
- Social feeds
- Online leaderboards
- Complex backend infrastructure

The priority is:

**A polished, fun, reusable local CYOA engine with one excellent Vice City story.**

---

# 46. Definition of Success

The project is successful when:

1. I can open the application and select Vice City.
2. I can complete an interesting playthrough in under 10 minutes.
3. My choices meaningfully alter relationships and events.
4. I can reach substantially different endings.
5. I want to immediately try another path.
6. The application remembers what I have discovered.
7. I can view my previous timelines.
8. I can branch from previous decisions.
9. Vice City exists entirely as a story pack rather than engine-specific code.
10. I can copy `_template`, write another story, register it, and have the engine play it without modifying the core application.

Prioritize **fun, replayability, modularity and simplicity** over adding unnecessary features.