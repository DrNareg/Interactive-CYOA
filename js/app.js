import { loadStoryRegistry, loadStoryPack } from './story-loader.js';
import {
  createInitialState,
  evaluateCondition,
  ensureVariableMap,
  applyDelta,
  markSceneVisited,
  addChoiceDiscovery,
  snapshotState,
  getVariable,
} from './state-manager.js';
import { loadProgress, saveProgress, getStoryProgress, persistCurrentRun } from './save-manager.js';
import { buildAchievements, unlockAchievement, calculateAchievementProgress } from './achievement-manager.js';
import { createTimelineEntry, computeTimelineSummary } from './timeline-manager.js';

const app = {
  registry: [],
  selectedStoryId: null,
  currentStory: null,
  currentState: null,
  storyProgress: { stories: {} },
  achievements: [],
  ui: {
    audioReady: false,
    hasUserGesture: false,
    musicEnabled: true,
  },
};

const defaultStory = {
  id: 'vice-city',
  title: 'Vice City: Alternate Timelines',
  subtitle: 'What if Tommy chose differently?',
  estimatedMinutes: 8,
  setting: 'Vice City, 1986',
  version: '1.0',
  startingScene: 'opening_deal',
  theme: { accent: '#ffb703', background: '#0d1018' },
  scenes: {
    opening_deal: {
      id: 'opening_deal',
      title: 'The Deal',
      summary: 'A simple exchange turns into a war between loyalties.',
      text: [
        'The exchange was supposed to be simple. Money. Cocaine. A clean handoff in the neon haze of Vice City.',
        'Instead, the warehouse erupts in gunfire. The cash is gone. The product is gone. And Tommy Vercetti is left staring at a dead courier and a phone that is already ringing.',
        'Sonny Forelli wants answers. The city is watching. And Tommy realizes the bad deal may be only the beginning.'
      ],
      choices: [
        {
          id: 'call_sonny',
          label: 'Call Sonny and tell him the truth',
          next: 'sonny_call',
          effects: { sonny_trust: 8, reputation: 4 },
          requires: []
        },
        {
          id: 'lie_sonny',
          label: 'Lie and buy yourself time',
          next: 'sonny_lie',
          effects: { sonny_trust: -12, reputation: 2 },
          requires: []
        },
        {
          id: 'cut_ties',
          label: 'Tell Sonny he is not getting another dollar',
          next: 'cut_ties_scene',
          effects: { sonny_trust: -18, reputation: 7 },
          requires: []
        }
      ]
    },
    sonny_call: {
      id: 'sonny_call',
      title: 'The Phone Call',
      summary: 'Tommy chooses honesty and buys himself a little time.',
      text: [
        'Sonny listens, then laughs once before the line goes cold. He is furious, but he has seen Tommy survive worse than this.',
        'The boss gives him one task: find the men responsible, and make the loss right.',
        'In Vice City, a favor from Sonny can be a weapon. A refusal can be a death sentence.'
      ],
      choices: [
        {
          id: 'investigate_rise',
          label: 'Start an investigation and trace the missing shipment',
          next: 'investigation',
          effects: { reputation: 5, police_heat: 4 },
          requires: []
        },
        {
          id: 'make_contact',
          label: 'Use the network and look for a fixer',
          next: 'diaz_meeting',
          effects: { diaz_trust: 6, wealth: 4 },
          requires: []
        }
      ]
    },
    sonny_lie: {
      id: 'sonny_lie',
      title: 'The Lie',
      summary: 'Tommy buys time by bluffing his way through a bad situation.',
      text: [
        'The lie is smooth, fast, and ugly. Sonny is not convinced, but he is unwilling to waste a man he has not yet decided to kill.',
        'Tommy leaves the call with a new problem: the city knows he is vulnerable, and everyone wants a piece of his panic.'
      ],
      choices: [
        {
          id: 'look_for_diaz',
          label: 'Look for Diaz and work the city quietly',
          next: 'diaz_meeting',
          effects: { diaz_trust: 8, wealth: 2 },
          requires: []
        },
        {
          id: 'rally_lance',
          label: 'Ask Lance to help stabilize the operation',
          next: 'lance_support',
          effects: { lance_loyalty: 10, reputation: 3 },
          requires: []
        }
      ]
    },
    cut_ties_scene: {
      id: 'cut_ties_scene',
      title: 'Cut Ties',
      summary: 'Tommy declares his independence in the worst possible way.',
      text: [
        'The words hit like a gunshot. Sonny goes silent. Tommy can almost hear the gears in the Forelli machine turn toward him.',
        'He is not just in debt. He is in open rebellion. The city starts to make sense: everybody has a side and a price.',
        'This is the moment where the empire begins to become more than a simple delivery route.'
      ],
      choices: [
        {
          id: 'take_the_city',
          label: 'Move out on your own and build influence',
          next: 'investigation',
          effects: { empire_power: 12, reputation: 6 },
          requires: []
        },
        {
          id: 'seek_work',
          label: 'Find work with Diaz and learn the game from the inside',
          next: 'diaz_meeting',
          effects: { diaz_trust: 12, wealth: 8 },
          requires: []
        }
      ]
    },
    investigation: {
      id: 'investigation',
      title: 'The Investigation',
      summary: 'Tommy starts to understand the city and the people feeding the chaos.',
      text: [
        'A trail leads to a set of interviews, broken ties, and a few very expensive mistakes. Looters, smugglers, and ambitious hustlers all smell blood in the water.',
        'Lance keeps asking when the city will start paying him back. Diaz keeps smiling like he already knows which side is going to win.'
      ],
      choices: [
        {
          id: 'work_with_lance',
          label: 'Trust Lance and build an alliance',
          next: 'lance_alliance',
          effects: { lance_loyalty: 18, empire_power: 8 },
          requires: []
        },
        {
          id: 'deal_with_diaz',
          label: 'Approach Diaz with a proposal',
          next: 'diaz_meeting',
          effects: { diaz_trust: 10, wealth: 5 },
          requires: []
        },
        {
          id: 'hoard_money',
          label: 'Take the money and keep your head low',
          next: 'money_route',
          effects: { wealth: 14, reputation: -4 },
          requires: []
        }
      ]
    },
    lance_support: {
      id: 'lance_support',
      title: 'Lance in the Middle',
      summary: 'Tommy leans on Lance while the city closes around them.',
      text: [
        'Lance is angry, eager, and deeply impressed by Tommy for once. It is not trust exactly. It is more like a spark in a dry room.',
        'Tommy can steer it toward partnership, control, or disaster. The dozen little choices in between are where empires are born.'
      ],
      choices: [
        {
          id: 'treat_lance_equal',
          label: 'Treat Lance as an equal partner',
          next: 'lance_alliance',
          effects: { lance_loyalty: 20, empire_power: 6 },
          requires: []
        },
        {
          id: 'use_lance',
          label: 'Use Lance as muscle and keep him at arm\'s length',
          next: 'investigation',
          effects: { lance_loyalty: -8, reputation: 2 },
          requires: []
        }
      ]
    },
    diaz_meeting: {
      id: 'diaz_meeting',
      title: 'The Diaz Meeting',
      summary: 'Ricardo Diaz enters the picture and changes the balance of power.',
      text: [
        'Diaz is calm in a way that feels expensive. He talks like a man who has already mapped the city in his head and is just waiting to see whether Tommy is useful or disposable.',
        'The deal is lucrative. The cost is subtle. One promise made in private can become a chain on a future Monday morning.'
      ],
      choices: [
        {
          id: 'accept_diaz',
          label: 'Take Diaz\'s offer and work the city together',
          next: 'diaz_partnership',
          effects: { diaz_trust: 18, wealth: 8, empire_power: 5 },
          requires: []
        },
        {
          id: 'play_diaz',
          label: 'Play both sides and keep your options open',
          next: 'lance_alliance',
          effects: { diaz_trust: 6, reputation: 6 },
          requires: []
        },
        {
          id: 'betray_diaz',
          label: 'Set Diaz up and prepare for a hostile takeover',
          next: 'diaz_betrayal',
          effects: { diaz_trust: -25, empire_power: 12, reputation: 8 },
          requires: []
        }
      ]
    },
    lance_alliance: {
      id: 'lance_alliance',
      title: 'The Risk of Trust',
      summary: 'Tommy and Lance either build something real or prepare to burn each other alive.',
      text: [
        'The city asks for one thing: loyalty. Lance needs to believe Tommy will not discard him. Tommy needs Lance to see him as a partner, not a superior with a gun.',
        'A shared plan could make them unstoppable. A badly handled ego could turn a brother into a rival.'
      ],
      choices: [
        {
          id: 'truly_partner',
          label: 'Treat Lance like a true partner and share the empire',
          next: 'final_push',
          effects: { lance_loyalty: 22, empire_power: 12, reputation: 8 },
          requires: []
        },
        {
          id: 'control_lance',
          label: 'Put Lance in charge of operations and keep control yourself',
          next: 'final_push',
          effects: { lance_loyalty: 12, empire_power: 9 },
          requires: []
        },
        {
          id: 'two_finger_salute',
          label: 'Keep Lance close but make sure he never gets too comfortable',
          next: 'final_push',
          effects: { lance_loyalty: -6, reputation: 4 },
          requires: []
        }
      ]
    },
    money_route: {
      id: 'money_route',
      title: 'The Quiet Route',
      summary: 'Tommy chases cash and avoids the bigger conflict for a while.',
      text: [
        'A pile of money buys a little breathing room. The city keeps moving regardless. Sonny is still angry. Diaz is still watching. And Tommy realizes that eventually every quiet move becomes a visible one.'
      ],
      choices: [
        {
          id: 'leave_city',
          label: 'Cash out and leave Vice City before it devours him',
          next: 'ending_reasonable_adult',
          effects: { wealth: 16, sonny_trust: 10 },
          requires: []
        },
        {
          id: 'double_down',
          label: 'Double down and build a bigger empire anyway',
          next: 'final_push',
          effects: { empire_power: 18, reputation: 8, police_heat: 10 },
          requires: []
        }
      ]
    },
    diaz_betrayal: {
      id: 'diaz_betrayal',
      title: 'The Break',
      summary: 'Tommy turns on Diaz and sets the city on a collision course.',
      text: [
        'Diaz reacts like a man who has spent a lifetime planning for a knife in the back. Tommy is no longer a pawn. He is a problem.',
        'The next move determines whether the city belongs to a king, a partner, or a corpse.'
      ],
      choices: [
        {
          id: 'fight_diaz',
          label: 'Take Diaz out and claim the city for yourself',
          next: 'final_push',
          effects: { diaz_trust: -30, empire_power: 20, reputation: 9 },
          requires: []
        },
        {
          id: 'share_war',
          label: 'Use Lance against Diaz and split the spoils later',
          next: 'final_push',
          effects: { lance_loyalty: 12, empire_power: 10 },
          requires: []
        }
      ]
    },
    diaz_partnership: {
      id: 'diaz_partnership',
      title: 'The Partnership',
      summary: 'Tommy chooses the profitable path and keeps his enemies close.',
      text: [
        'Diaz keeps his promises. Tommy keeps his nerve. It is a working arrangement, not a love story. Yet somewhere in the city, the quiet kind of power is the most dangerous kind of all.'
      ],
      choices: [
        {
          id: 'stay_with_diaz',
          label: 'Stay aligned with Diaz and let the empire grow around the arrangement',
          next: 'ending_diaz_empire',
          effects: { diaz_trust: 22, wealth: 16 },
          requires: []
        },
        {
          id: 'turn_on_diaz_later',
          label: 'Play nice for now, but start preparing to betray him',
          next: 'final_push',
          effects: { diaz_trust: 8, empire_power: 8 },
          requires: []
        }
      ]
    },
    final_push: {
      id: 'final_push',
      title: 'Final Push',
      summary: 'The city turns into a final reckoning between ambition, debt, and loyalty.',
      text: [
        'The final confrontation begins with fireworks, blood, and bad decisions. Sonny is circling. Diaz is alive or dead depending on the path. Lance is a partner, a rival, or a ghost.',
        'Tommy has enough influence to either become the king of the city or the bloodstain beneath it.'
      ],
      choices: [
        {
          id: 'end_king',
          label: 'Strike hard and take the city outright',
          next: 'ending_king_of_vice_city',
          effects: { empire_power: 18, reputation: 10 },
          requires: []
        },
        {
          id: 'end_partnership',
          label: 'Keep Lance close and split the empire',
          next: 'ending_vercetti_vance',
          effects: { lance_loyalty: 18, empire_power: 20 },
          requires: []
        },
        {
          id: 'end_lance_takeover',
          label: 'Let Lance decide the terms and prepare for betrayal',
          next: 'ending_lance_vance',
          effects: { lance_loyalty: -12, empire_power: 12 },
          requires: []
        },
        {
          id: 'end_forelli_victory',
          label: 'Try to outmaneuver Sonny but fail to secure enough power',
          next: 'ending_forelli_victory',
          effects: { sonny_trust: -30, empire_power: -10 },
          requires: []
        },
        {
          id: 'end_empire_collapse',
          label: 'Push too far and turn the empire into a war zone',
          next: 'ending_empire_collapse',
          effects: { empire_power: -18, police_heat: 16 },
          requires: []
        },
        {
          id: 'end_back_to_liberty',
          label: 'Take the money, leave the city, and call it a win',
          next: 'ending_reasonable_adult',
          effects: { wealth: 20, reputation: 2 },
          requires: []
        }
      ]
    },
    ending_king_of_vice_city: {
      id: 'ending_king_of_vice_city',
      type: 'ending',
      title: 'King of Vice City',
      text: [
        'Tommy takes the city by force, outlasting the worst of Sonny and the chaos of Diaz. He wins by being harder, faster, and less sentimental than everyone else.',
        'Vice City becomes his. The neon never stops flashing. The city never sleeps. And the men who were meant to break him are now room-temperature memories.'
      ],
      ending: {
        title: 'King of Vice City',
        summary: 'Tommy defeats Sonny and claims the city as his own.',
        status: { 'Tommy Vercetti': 'Alive', 'Lance Vance': 'Dead', 'Sonny Forelli': 'Dead', 'Ricardo Diaz': 'Dead' },
        achievement: 'king_of_vice_city'
      }
    },
    ending_vercetti_vance: {
      id: 'ending_vercetti_vance',
      type: 'ending',
      title: 'Vercetti & Vance',
      text: [
        'Tommy and Lance realize the only way to survive the city is to stop pretending the other is disposable. They share the empire, the risk, and the blood.'
      ],
      ending: {
        title: 'Vercetti & Vance',
        summary: 'Lance remains a partner instead of a rival.',
        status: { 'Tommy Vercetti': 'Alive', 'Lance Vance': 'Alive', 'Sonny Forelli': 'Dead', 'Ricardo Diaz': 'Dead' },
        achievement: 'brothers_in_arms'
      }
    },
    ending_lance_vance: {
      id: 'ending_lance_vance',
      type: 'ending',
      title: 'Lance Vance',
      text: [
        'Lance sees the hand on the trigger, step aside, and choose his own future. He betrays Tommy, takes the empire, and smiles through the blood.'
      ],
      ending: {
        title: 'Lance Vance',
        summary: 'Tommy is outmaneuvered and Lance takes control.',
        status: { 'Tommy Vercetti': 'Dead', 'Lance Vance': 'Alive', 'Sonny Forelli': 'Alive', 'Ricardo Diaz': 'Unknown' },
        achievement: 'et_tu_lance'
      }
    },
    ending_forelli_victory: {
      id: 'ending_forelli_victory',
      type: 'ending',
      title: 'Forelli Victory',
      text: [
        'Tommy loses the war before he ever truly wins it. Sonny outlasts him, and the city turns its back when it is time to collect the debt.'
      ],
      ending: {
        title: 'Forelli Victory',
        summary: 'Sonny wins the blood feud and the city remains loyal to the old order.',
        status: { 'Tommy Vercetti': 'Dead', 'Lance Vance': 'Unknown', 'Sonny Forelli': 'Alive', 'Ricardo Diaz': 'Unknown' },
        achievement: 'forelli_victory'
      }
    },
    ending_diaz_empire: {
      id: 'ending_diaz_empire',
      type: 'ending',
      title: 'Diaz Empire',
      text: [
        'Tommy keeps his promises to Diaz and becomes another voice in the machine. The arrangement works. The empire grows. But Tommy never stopped becoming someone else.'
      ],
      ending: {
        title: 'Diaz Empire',
        summary: 'Tommy remains aligned with Diaz and builds an uneasy empire beneath him.',
        status: { 'Tommy Vercetti': 'Alive', 'Lance Vance': 'Unknown', 'Sonny Forelli': 'Alive', 'Ricardo Diaz': 'Alive' },
        achievement: 'diaz_empire'
      }
    },
    ending_empire_collapse: {
      id: 'ending_empire_collapse',
      type: 'ending',
      title: 'Empire Collapse',
      text: [
        'Tommy wins the battle but not the peace. The empire is too violent, too volatile, and too broken by the people he trusted to stand still for long.'
      ],
      ending: {
        title: 'Empire Collapse',
        summary: 'Power is won quickly and lost just as quickly.',
        status: { 'Tommy Vercetti': 'Alive', 'Lance Vance': 'Dead', 'Sonny Forelli': 'Dead', 'Ricardo Diaz': 'Dead' },
        achievement: 'empire_collapse'
      }
    },
    ending_reasonable_adult: {
      id: 'ending_reasonable_adult',
      type: 'ending',
      title: 'The Reasonable Adult',
      text: [
        'Tommy takes the money, quits the game, and leaves Vice City with his skin intact. It is the most boring ending in town, and somehow it may be the smartest one.'
      ],
      ending: {
        title: 'The Reasonable Adult',
        summary: 'Tommy pays off the trouble and leaves with enough cash to start over elsewhere.',
        status: { 'Tommy Vercetti': 'Alive', 'Lance Vance': 'Unknown', 'Sonny Forelli': 'Unknown', 'Ricardo Diaz': 'Unknown' },
        achievement: 'reasonable_adult'
      }
    }
  },
  achievements: [
    { id: 'king_of_vice_city', title: 'King of Vice City', description: 'Win the original-style empire ending.', hidden: false },
    { id: 'brothers_in_arms', title: 'Brothers in Arms', description: 'Finish the story with Lance as a true partner.', hidden: false },
    { id: 'et_tu_lance', title: 'Et Tu, Lance?', description: 'Get betrayed by Lance.', hidden: false },
    { id: 'reasonable_adult', title: 'The Reasonable Adult', description: 'Pay off the debt and leave.', hidden: false },
    { id: 'empire_collapse', title: 'Empire Collapse', description: 'Create a destructive empire without lasting stability.', hidden: true },
    { id: 'forelli_victory', title: 'Forelli Victory', description: 'Lose the power struggle to Sonny.', hidden: true },
    { id: 'diaz_empire', title: 'Diaz Empire', description: 'Align with Diaz and survive.', hidden: true }
  ]
};

function getScreenById(id) {
  return document.getElementById(id);
}

function useReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function activateScreen(screenId) {
  document.querySelectorAll('.screen').forEach((screen) => {
    screen.classList.remove('active', 'scene-reveal');
  });

  const nextScreen = getScreenById(screenId);
  if (nextScreen) {
    nextScreen.classList.add('active');
    requestAnimationFrame(() => nextScreen.classList.add('scene-reveal'));
  }
  return nextScreen;
}

function scrollToNewSection(screenEl) {
  if (!screenEl) return;

  const target = screenEl.querySelector('.story-hero') || screenEl;
  target.scrollIntoView({
    behavior: useReducedMotion() ? 'auto' : 'smooth',
    block: 'start',
  });
}

function updateMusicToggle(isPlaying) {
  const toggle = document.getElementById('music-toggle');
  if (!toggle) return;

  const enabled = app.ui.musicEnabled;
  toggle.dataset.playing = enabled && isPlaying ? 'true' : 'false';
  toggle.textContent = `Music: ${enabled ? 'On' : 'Off'}`;
}

async function startBackgroundMusic() {
  const audio = document.getElementById('bg-music');
  if (!audio) return false;

  try {
    await audio.play();
    app.ui.audioReady = true;
    updateMusicToggle(true);
    return true;
  } catch (error) {
    updateMusicToggle(false);
    return false;
  }
}

function setupBackgroundMusic() {
  const audio = document.getElementById('bg-music');
  const toggle = document.getElementById('music-toggle');
  if (!audio || !toggle) return;

  audio.volume = 0.35;
  audio.loop = true;
  audio.preload = 'auto';
  audio.autoplay = true;

  updateMusicToggle(app.ui.musicEnabled && !audio.paused);

  audio.addEventListener('ended', () => {
    if (!app.ui.musicEnabled) return;
    audio.currentTime = 0;
    void audio.play().catch(() => {
      updateMusicToggle(false);
    });
  });

  if (app.ui.musicEnabled) {
    void startBackgroundMusic();
  }

  const unlockAudio = async () => {
    if (app.ui.hasUserGesture && app.ui.audioReady) return;
    app.ui.hasUserGesture = true;
    if (!app.ui.musicEnabled) {
      updateMusicToggle(false);
      return;
    }

    const started = await startBackgroundMusic();
    if (started) {
      document.removeEventListener('pointerdown', unlockAudio);
      document.removeEventListener('keydown', unlockAudio);
    }
  };

  document.addEventListener('pointerdown', unlockAudio, { once: false });
  document.addEventListener('keydown', unlockAudio, { once: false });

  toggle.addEventListener('click', async () => {
    if (!app.ui.musicEnabled) {
      app.ui.musicEnabled = true;
      app.ui.hasUserGesture = true;
      await startBackgroundMusic();
      return;
    }

    app.ui.musicEnabled = false;
    audio.pause();
    updateMusicToggle(false);
  });
}

function renderStorySelect() {
  const screen = activateScreen('story-select-screen');
  screen.innerHTML = `
    <div class="story-hero">
      <h1>Choose Your Timeline</h1>
      <div class="story-meta">Multiple stories • replayable outcomes</div>
    </div>
    <div class="story-body">
      <div class="story-grid">
        <article class="story-card">
          <h3>Vice City: Alternate Timelines</h3>
          <p>What if Tommy chose differently?</p>
          <p>5–10 minutes • Vice City, 1986</p>
          <button class="story-button" data-story="vice-city">Play</button>
        </article>
      </div>
    </div>
  `;

  screen.querySelectorAll('[data-story]').forEach((button) => {
    button.addEventListener('click', () => startStory(button.dataset.story));
  });

  scrollToNewSection(screen);
}

function renderIntro(story) {
  const screen = activateScreen('story-intro-screen');
  screen.innerHTML = `
    <div class="story-hero">
      <h1>${story.title}</h1>
      <div class="story-meta">${story.setting || 'Story Pack'} • ${story.estimatedMinutes || 8} minutes</div>
    </div>
    <div class="story-body">
      <div class="summary-card">
        <h2>${story.subtitle || 'A dangerous new timeline'}</h2>
        <p>One deal is about to change everything. Your decisions will determine who rises, who falls, and who owns the city.</p>
        <p><strong>Estimated time:</strong> ${story.estimatedMinutes || 8} minutes</p>
        <p><strong>Multiple endings.</strong> Your decisions matter.</p>
        <button class="primary-button" id="begin-story-btn">Begin</button>
      </div>
    </div>
  `;

  document.getElementById('begin-story-btn').addEventListener('click', () => {
    renderStoryScreen(story, story.startingScene);
  });

  scrollToNewSection(screen);
}

function appStateFromStory(story) {
  const state = createInitialState();
  state.variables = {
    sonny_trust: 0,
    lance_loyalty: 0,
    diaz_trust: 0,
    cortez_trust: 0,
    reputation: 0,
    police_heat: 0,
    wealth: 0,
    empire_power: 0,
  };
  state.currentSceneId = story.startingScene || Object.keys(story.scenes)[0];
  state.sceneHistory = [state.currentSceneId];
  markSceneVisited(state, state.currentSceneId);
  return state;
}

function resolveScene(story, sceneId) {
  const scene = story.scenes[sceneId];
  if (!scene) {
    return story.scenes[story.startingScene] || Object.values(story.scenes)[0];
  }
  return scene;
}

function applyEffects(state, effects = {}) {
  Object.entries(effects).forEach(([variable, value]) => applyDelta(state, variable, value));
}

function choiceIsVisible(state, choice) {
  if (!choice.requires || choice.requires.length === 0) return true;
  return choice.requires.every((requirement) => {
    const value = getVariable(state, requirement.variable, 0);
    if (requirement.operator === '>=') return value >= Number(requirement.value || 0);
    if (requirement.operator === '<=') return value <= Number(requirement.value || 0);
    if (requirement.operator === '>') return value > Number(requirement.value || 0);
    if (requirement.operator === '<') return value < Number(requirement.value || 0);
    if (requirement.operator === '==') return value === Number(requirement.value || 0);
    return true;
  });
}

function renderStoryScreen(story, sceneId) {
  const screen = activateScreen('story-screen');
  const scene = resolveScene(story, sceneId);

  app.currentStory = story;
  app.currentState = app.currentState || appStateFromStory(story);
  app.currentState.currentSceneId = scene.id;
  markSceneVisited(app.currentState, scene.id);

  const visibleChoices = (scene.choices || []).filter((choice) => choiceIsVisible(app.currentState, choice));

  const detailEl = document.createElement('div');
  detailEl.innerHTML = `
    <div class="story-hero">
      <h1>${story.title}</h1>
      <div class="story-meta">${story.setting || 'Story Pack'} • timeline ${app.currentState.timeline.length + 1}</div>
    </div>
    <div class="story-body">
      <div class="scene-title">${scene.title}</div>
      <div class="scene-text">
        ${(scene.text || []).map((paragraph) => `<p>${paragraph}</p>`).join('')}
      </div>

      <div class="choice-list">
        ${visibleChoices.map((choice) => `
          <button class="choice-button" data-choice-id="${choice.id}" data-next="${choice.next || ''}">
            <span class="choice-label">${choice.label}</span>
            <span class="choice-next">${choice.next ? 'Continue' : 'Outcome'}</span>
          </button>
        `).join('') || '<div class="empty-state">No choices available.</div>'}
      </div>

      ${app.currentState.debugMode ? `
        <div class="debug-panel">
          <h4>Current State</h4>
          <div class="debug-grid">
            ${Object.entries(app.currentState.variables).map(([key, value]) => `<div class="debug-value"><strong>${key}</strong><br>${value}</div>`).join('')}
          </div>
        </div>
      ` : ''}
    </div>
  `;

  screen.innerHTML = detailEl.innerHTML;

  screen.querySelectorAll('[data-choice-id]').forEach((button) => {
    button.addEventListener('click', () => {
      const choiceId = button.dataset.choiceId;
      const nextSceneId = button.dataset.next;
      const choice = (scene.choices || []).find((item) => item.id === choiceId);
      if (!choice) return;

      app.currentState.timeline.push({ sceneId: scene.id, choiceId, decision: choice.label, timestamp: Date.now() });
      app.currentState.sceneHistory.push(nextSceneId || scene.id);
      addChoiceDiscovery(app.currentState, choiceId);
      applyEffects(app.currentState, choice.effects || {});

      if (nextSceneId && app.currentStory.scenes[nextSceneId]) {
        renderStoryScreen(app.currentStory, nextSceneId);
      } else {
        renderEndingScreen(app.currentStory, scene, choice);
      }
      persistCurrentRun(app.storyProgress, story.id, app.currentState);
    });
  });

  document.getElementById('home-button').classList.remove('hidden');
  scrollToNewSection(screen);
}

function renderEndingScreen(story, scene, choice) {
  const screen = activateScreen('story-screen');
  const endingId = choice.next || scene.id;
  const endingScene = story.scenes[endingId] || scene;
  const ending = endingScene.ending || { title: 'Timeline Complete', status: {}, summary: 'You reached a dramatic end.' };

  app.currentState.ending = ending.title;
  app.currentState.isFirstRun = false;

  const statusEntries = Object.entries(ending.status || {});
  screen.innerHTML = `
    <div class="story-hero">
      <h1>${story.title}</h1>
      <div class="story-meta">Timeline complete</div>
    </div>
    <div class="story-body">
      <div class="ending-panel">
        <div class="ending-title">${ending.title}</div>
        <p>${ending.summary || 'Your decisions changed the city forever.'}</p>
        <div class="status-grid">
          ${statusEntries.map(([label, value]) => `<div class="status-pill"><strong>${label}</strong> • ${value}</div>`).join('')}
        </div>
        <p>${(endingScene.text || []).map((text) => text).join(' ')}</p>
        <div class="choice-list">
          <button class="primary-button" id="view-timeline-btn">View Timeline</button>
          <button class="secondary-button" id="another-path-btn">Try Another Path</button>
          <button class="ghost-button" id="story-select-btn">Story Select</button>
        </div>
      </div>
    </div>
  `;

  document.getElementById('view-timeline-btn').addEventListener('click', () => renderTimelineScreen(story));
  document.getElementById('another-path-btn').addEventListener('click', () => startStory(story.id));
  document.getElementById('story-select-btn').addEventListener('click', () => showStorySelect());

  const storyProgress = getStoryProgress(app.storyProgress, story.id);
  if (!storyProgress.endings.includes(ending.title)) {
    storyProgress.endings.push(ending.title);
  }
  app.storyProgress.stories[story.id] = storyProgress;
  saveProgress(app.storyProgress);

  const achievementId = endingScene.ending?.achievement;
  if (achievementId) { 
    const achievements = app.achievements || buildAchievements(story);
    unlockAchievement(achievements, achievementId);
    app.achievements = achievements;
  }

  scrollToNewSection(screen);
}

function showStorySelect() {
  app.currentState = null;
  document.getElementById('home-button').classList.add('hidden');
  renderStorySelect();
}

function renderTimelineScreen(story) {
  const screen = activateScreen('timeline-screen');
  const timeline = app.currentState?.timeline || [];
  const summary = computeTimelineSummary(timeline);
  screen.innerHTML = `
    <div class="story-hero">
      <h1>Timeline</h1>
      <div class="story-meta">${story.title}</div>
    </div>
    <div class="story-body timeline-layout">
      <div class="timeline-card">
        <h3>Decisions taken</h3>
        <ul class="timeline-list">
          ${timeline.length ? timeline.map((entry) => `
            <li class="timeline-item">
              <strong>${entry.sceneId}</strong>
              <div class="timeline-choice">${entry.decision}</div>
            </li>
          `).join('') : '<li class="empty-state">No timeline yet.</li>'}
        </ul>
      </div>
      <div class="summary-card">
        <h3>Run Summary</h3>
        <div class="timeline-summary-grid">
          <div class="summary-stat"><strong>${timeline.length}</strong> decisions</div>
          <div class="summary-stat"><strong>${summary.total}</strong> timeline entries</div>
        </div>
        <div class="choice-list">
          <button class="primary-button" id="resume-story-btn">Resume</button>
          <button class="ghost-button" id="story-select-btn-2">Story Select</button>
        </div>
      </div>
    </div>
  `;

  document.getElementById('resume-story-btn').addEventListener('click', () => {
    const latestScene = app.currentState?.currentSceneId || story.startingScene;
    renderStoryScreen(story, latestScene);
  });
  document.getElementById('story-select-btn-2').addEventListener('click', () => showStorySelect());

  scrollToNewSection(screen);
}

async function startStory(storyId) {
  const storyPack = await loadStoryPack(storyId);
  app.selectedStoryId = storyId;
  app.currentStory = storyPack.story;
  app.currentStory.metadata = storyPack.metadata;
  app.currentStory.title = storyPack.metadata.title || app.currentStory.title || 'Untitled Story';
  app.currentStory.subtitle = storyPack.metadata.subtitle || app.currentStory.subtitle || '';
  app.currentStory.setting = storyPack.metadata.setting || app.currentStory.setting || 'Story Pack';
  app.currentStory.estimatedMinutes = storyPack.metadata.estimatedMinutes || app.currentStory.estimatedMinutes || 8;
  app.currentStory.startingScene = storyPack.metadata.startingScene || app.currentStory.startingScene || Object.keys(app.currentStory.scenes)[0];
  app.currentState = appStateFromStory(app.currentStory);
  app.achievements = buildAchievements(app.currentStory);
  app.storyProgress = loadProgress();

  renderIntro(app.currentStory);
}

async function initializeApp() {
  setupBackgroundMusic();

  const homeButton = document.getElementById('home-button');
  homeButton.addEventListener('click', showStorySelect);
  document.getElementById('reset-button').addEventListener('click', () => {
    localStorage.clear();
    alert('Progress reset.');
    showStorySelect();
  });

  app.storyProgress = loadProgress();
  app.registry = await loadStoryRegistry();
  renderStorySelect();
  showStorySelect();
}

initializeApp();
