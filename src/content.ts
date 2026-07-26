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
  interaction: string;
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
      "Immersive clinical simulation for hospital teams, nurses and pre-hospital emergency care—built to rehearse critical decisions safely and repeatedly.",
    tags: [
      "Hospital networks",
      "Nurse training",
      "MDA emergency care",
      "Repeatable scenarios",
    ],
    accent: "#74ecff",
    accentRgb: "116, 236, 255",
    world: "clinical",
    alignment: "left",
    note: "Confidential project · Recreated visual",
    noteDetail:
      "The work is real. Client environments and operational material are confidential, so this scene is an original reconstruction.",
    nextLabel: "Connected training",
    interaction: "Trigger a vital alert",
  },
  {
    id: "tactical",
    number: "02",
    nav: "Connected",
    eyebrow: "Connected defense training",
    title: "Six trainees. One live scenario.",
    body:
      "A connected Unreal system brings six participants, instructor control, wearables, tracked peripherals and physical feedback into one live session.",
    tags: [
      "Unreal Engine",
      "Up to 6 over LAN",
      "PC + tablet control",
      "Galaxy Watch vitals",
      "WonderFitter peripherals",
      "bHaptics suit",
    ],
    accent: "#d7ff4f",
    accentRgb: "215, 255, 79",
    world: "tactical",
    alignment: "right",
    note: "Confidential project · Recreated visual",
    noteDetail:
      "The capabilities and technical details are genuine. The visual contains no client interface, personnel or operational material.",
    nextLabel: "Emergency response",
    interaction: "Cycle the live network",
  },
  {
    id: "emergency",
    number: "03",
    nav: "Response",
    eyebrow: "Emergency response training",
    title: "Rehearse pressure. Protect the response.",
    body:
      "Repeatable VR scenarios let police, fire and emergency-service teams train coordination under pressure without putting the real response at risk.",
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
    interaction: "Contain the incident",
  },
  {
    id: "hover-the-edge",
    number: "04",
    nav: "Hover",
    eyebrow: "Hover The Edge",
    title: "Movement is the mechanic.",
    body:
      "A released VR game built around speed, spatial judgment and physical instinct through a world that never stops moving.",
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
    interaction: "Boost the hover craft",
    projectLink: {
      label: "Watch full gameplay",
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
      "A location-based flight experience where balance and full-body movement become the interface between the physical rig and virtual world.",
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
    interaction: "Lift the flight rig",
  },
  {
    id: "mobile-products",
    number: "06",
    nav: "Apps",
    eyebrow: "Mobile products",
    title: "The same thinking, in your hand.",
    body:
      "Clear systems, expressive interaction and useful products people can understand in seconds.",
    tags: ["Product design", "Mobile engineering", "iOS", "Flutter", "Data-rich UX"],
    accent: "#c8a7ff",
    accentRgb: "200, 167, 255",
    world: "mobile",
    alignment: "left",
    nextLabel: "Finish the journey",
    interaction: "Focus the next product",
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
