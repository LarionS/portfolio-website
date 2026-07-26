import hoverPoster from "../assets/journey/hover-the-edge/hover-10s.jpg";
import hoverVideo from "../assets/journey/hover-the-edge/hover-loop.mp4";
import flyboxPoster from "../assets/journey/flybox/flybox-08s.jpg";
import flyboxVideo from "../assets/journey/flybox/flybox-loop.mp4";
import lighthouseScreen from "../assets/journey/apps/lighthouse-feed-stories-3d.webp";
import moneyNestScreen from "../assets/journey/apps/moneynest-home-3d.webp";
import biteSyncScreen from "../assets/journey/apps/bitesync-settings-he-3d.webp";

export type WorldKind =
  | "clinical"
  | "tactical"
  | "emergency"
  | "hover"
  | "flybox"
  | "mobile";

export type Chapter = {
  id: string;
  number: string;
  nav: string;
  eyebrow: string;
  title: string;
  body: string;
  tags: string[];
  accent: string;
  accentRgb: string;
  world: WorldKind;
  video?: string;
  poster?: string;
  alignment: "left" | "right";
  note?: string;
  noteDetail?: string;
  nextLabel: string;
  interaction: {
    label: string;
    resetLabel: string;
    idleStatus: string;
    activeStatus: string;
    resetStatus: string;
    resetEvents?: number;
  };
  projectLink?: {
    label: string;
    href: string;
  };
};

export const chapters: Chapter[] = [
  {
    id: "clinical",
    number: "01",
    nav: "Clinical",
    eyebrow: "Clinical simulation",
    title: "Train the decision before it matters.",
    body:
      "Production VR training for hospital teams, nurses and pre-hospital responders—repeatable scenarios for decisions that cannot be rehearsed on real patients.",
    tags: [
      "Hospital networks",
      "Nurse training",
      "MDA / pre-hospital care",
      "Scenario replay",
    ],
    accent: "#74ecff",
    accentRgb: "116, 236, 255",
    world: "clinical",
    alignment: "left",
    note: "Confidential project · Recreated visual",
    noteDetail:
      "The work is real. Client environments and operational material are confidential, so this scene is an original reconstruction.",
    nextLabel: "Connected training",
    interaction: {
      label: "Start vital deterioration",
      resetLabel: "Reset patient state",
      idleStatus: "Patient stable · scenario ready.",
      activeStatus: "Vitals unstable · clinical response in progress.",
      resetStatus: "Patient reset · scenario ready.",
    },
  },
  {
    id: "tactical",
    number: "02",
    nav: "Connected",
    eyebrow: "Connected defense training",
    title: "Six trainees. One live scenario.",
    body:
      "A production Unreal Engine platform connects up to six trainees over LAN with live instructor control, watch vitals, tracked weapons and physical feedback.",
    tags: [
      "6-player LAN",
      "PC + tablet instructor control",
      "Galaxy Watch vitals",
      "WonderFitter tracking",
      "bHaptics feedback",
    ],
    accent: "#d7ff4f",
    accentRgb: "215, 255, 79",
    world: "tactical",
    alignment: "right",
    note: "Confidential project · Recreated visual",
    noteDetail:
      "The capabilities and technical details are genuine. The visual contains no client interface, personnel or operational material.",
    nextLabel: "Emergency response",
    interaction: {
      label: "Trace one live node",
      resetLabel: "Restore all six nodes",
      idleStatus: "Six trainees synchronized over LAN.",
      activeStatus: "Tracing one participant across vitals, tracking and haptics.",
      resetStatus: "All six nodes restored and synchronized.",
      resetEvents: 5,
    },
  },
  {
    id: "emergency",
    number: "03",
    nav: "Response",
    eyebrow: "Emergency response training",
    title: "Rehearse pressure. Protect the response.",
    body:
      "VR training systems for police, fire and emergency teams—coordinating roles, timing and response under pressure without risking a live operation.",
    tags: [
      "Police training",
      "Fire + rescue",
      "Emergency services",
      "Safe repetition",
    ],
    accent: "#ff7a3c",
    accentRgb: "255, 122, 60",
    world: "emergency",
    alignment: "left",
    note: "Original concept visual · No client footage",
    noteDetail:
      "This is an original visualization of the training category, not footage from a client deployment.",
    nextLabel: "Hover The Edge",
    interaction: {
      label: "Contain the incident",
      resetLabel: "Reset the response",
      idleStatus: "Incident active · response team deployed.",
      activeStatus: "Incident contained · scenario ready for review.",
      resetStatus: "Incident reset · response scenario live again.",
    },
  },
  {
    id: "hover-the-edge",
    number: "04",
    nav: "Hover",
    eyebrow: "Hover The Edge",
    title: "Movement is the mechanic.",
    body:
      "A released VR game where speed, spatial judgment and full-body instinct drive every run through a world that never stops moving.",
    tags: [
      "Released VR title",
      "Unreal Engine",
      "Physical gameplay",
      "Full game loop",
    ],
    accent: "#71fff0",
    accentRgb: "113, 255, 240",
    world: "hover",
    video: hoverVideo,
    poster: hoverPoster,
    alignment: "left",
    note: "Gameplay footage · Hover The Edge",
    nextLabel: "FlyboxVR",
    interaction: {
      label: "Engage boost",
      resetLabel: "Release boost",
      idleStatus: "Craft ready · gameplay portal online.",
      activeStatus: "Boost engaged · thrust and gameplay running.",
      resetStatus: "Boost released · gameplay continues in the portal.",
    },
    projectLink: {
      label: "Watch gameplay",
      href: "https://www.youtube.com/watch?v=yD0MdJfYck0",
    },
  },
  {
    id: "flyboxvr",
    number: "05",
    nav: "Flybox",
    eyebrow: "FlyboxVR",
    title: "When the body believes the world.",
    body:
      "A location-based VR flight system that turns balance and full-body movement into real-time control of the virtual world.",
    tags: [
      "Location-based VR",
      "Physical interaction",
      "Real-time 3D",
      "Guest-facing experience",
    ],
    accent: "#f5c65c",
    accentRgb: "245, 198, 92",
    world: "flybox",
    video: flyboxVideo,
    poster: flyboxPoster,
    alignment: "right",
    note: "Project footage · FlyboxVR",
    nextLabel: "Mobile products",
    interaction: {
      label: "Lift the flight rig",
      resetLabel: "Lower the flight rig",
      idleStatus: "Rig grounded · airflow visualization ready.",
      activeStatus: "Rig lifted · body input mapped to flight.",
      resetStatus: "Rig lowered · project footage remains available.",
    },
  },
  {
    id: "mobile-products",
    number: "06",
    nav: "Apps",
    eyebrow: "Mobile product engineering",
    title: "Systems thinking, beyond the headset.",
    body:
      "Mobile products that turn complex home, finance and health information into clear daily decisions.",
    tags: ["Product strategy", "Mobile engineering", "iOS", "Flutter", "Data-rich UX"],
    accent: "#c8a7ff",
    accentRgb: "200, 167, 255",
    world: "mobile",
    alignment: "left",
    nextLabel: "Start a conversation",
    interaction: {
      label: "Select a product",
      resetLabel: "Clear product focus",
      idleStatus: "Choose a product to inspect its interface.",
      activeStatus: "Product selected in the 3D gallery.",
      resetStatus: "Product gallery reset.",
    },
  },
];

export const mobileProducts = [
  {
    name: "Lighthouse",
    line: "Shared-home coordination, made calmer.",
    screen: lighthouseScreen,
  },
  {
    name: "MoneyNest",
    line: "Personal finance without the noise.",
    screen: moneyNestScreen,
  },
  {
    name: "BiteSync",
    line: "Nutrition and health patterns, made visible.",
    screen: biteSyncScreen,
  },
];

export const contact = {
  email: "Larion1@gmail.com",
  emailHref:
    "mailto:Larion1@gmail.com?subject=New%20Unreal%20%2F%20VR%20project",
  whatsapp: "https://wa.me/66922470654",
};
