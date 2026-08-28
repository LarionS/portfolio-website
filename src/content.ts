import hoverPoster from "../assets/journey/hover-the-edge/hover-story-v2-poster.jpg";
import hoverVideo from "../assets/journey/hover-the-edge/hover-story-v2-web.mp4";
import flyboxPoster from "../assets/journey/flybox/flybox-story-v2-poster.jpg";
import flyboxVideo from "../assets/journey/flybox/flybox-story-v2-web.mp4";
import lighthouseScreen from "../assets/journey/apps/lighthouse-feed-stories.webp";
import moneyNestScreen from "../assets/journey/apps/moneynest-home.webp";
import biteSyncScreen from "../assets/journey/apps/bitesync-health-chat.webp";

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
    eyebrow: "Clinical decision training",
    title: "A patient changes. The room responds.",
    body:
      "Configurable scenarios connect patient state, trainee action, live feedback, and replayable debrief.",
    tags: [
      "Scenario control",
      "Live state",
      "Debrief replay",
    ],
    accent: "#74ecff",
    accentRgb: "116, 236, 255",
    world: "clinical",
    alignment: "left",
    note: "Confidential project · Recreated visual",
    noteDetail:
      "Original reconstruction illustrating delivered training capabilities. No client material is shown.",
    nextLabel: "Connected training",
    interaction: {
      label: "Trigger patient deterioration",
      resetLabel: "Replay scenario",
      idleStatus: "Patient stable · instructor ready.",
      activeStatus: "Scenario event injected · response recording.",
      resetStatus: "Response captured · ready to review.",
    },
  },
  {
    id: "tactical",
    number: "02",
    nav: "Connected",
    eyebrow: "Connected XR training",
    title: "One command. Six trainees respond.",
    body:
      "The instructor triggers one event. It reaches six VR trainees, activates their tracked hardware and haptics, then returns live telemetry.",
    tags: [
      "6-person LAN",
      "Wearables + haptics",
      "Instructor control",
    ],
    accent: "#5d76ff",
    accentRgb: "93, 118, 255",
    world: "tactical",
    alignment: "right",
    note: "Confidential project · Recreated visual",
    noteDetail:
      "The capabilities and technical details are genuine. The visual contains no client interface, personnel or operational material.",
    nextLabel: "Emergency response",
    interaction: {
      label: "Send event to all 6 trainees",
      resetLabel: "Replay dispatch",
      idleStatus: "Six trainees connected · session ready.",
      activeStatus: "Event dispatched · devices responding.",
      resetStatus: "Event delivered · telemetry received.",
    },
  },
  {
    id: "emergency",
    number: "03",
    nav: "Response",
    eyebrow: "Coordinated response training",
    title: "Three roles. One changing incident.",
    body:
      "Secure the route, suppress the fire, then treat the casualty—each team’s action unlocks the next.",
    tags: [
      "Shared scenario",
      "Role dependencies",
      "After-action review",
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
      label: "Choose next role",
      resetLabel: "Replay response",
      idleStatus: "Incident active · choose the next role.",
      activeStatus: "Response sequence advancing.",
      resetStatus: "Incident contained · response ready for review.",
    },
  },
  {
    id: "hover-the-edge",
    number: "04",
    nav: "Hover",
    eyebrow: "Hover The Edge",
    title: "Lean. Launch. Extract.",
    body:
      "A released Unreal Engine VR game where players steer a hoverboard with their body, race across a collapsing island and extract the artifact.",
    tags: [
      "Released on Steam",
      "Body-steered VR",
      "Unreal Engine",
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
      label: "Boost toward the artifact",
      resetLabel: "Release boost",
      idleStatus: "Lean to carve · hold the line toward the artifact.",
      activeStatus: "Boost engaged · board, camera and route responding.",
      resetStatus: "Boost released · carve remains active.",
    },
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
    title: "Your body becomes the aircraft.",
    body:
      "A real wind tunnel lifts the participant while FlyboxVR maps their balance and posture into the flight shown on screen.",
    tags: [
      "Location-based VR",
      "Body-as-controller",
      "Real-time flight",
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
      label: "Take flight",
      resetLabel: "Return to idle",
      idleStatus: "Airflow ready · real project footage online.",
      activeStatus: "Flight active · posture mapped to the virtual world.",
      resetStatus: "Flight reset · footage remains live.",
    },
  },
  {
    id: "mobile-products",
    number: "06",
    nav: "Apps",
    eyebrow: "Beyond XR · Mobile product engineering",
    title: "Three products. One obsession: clarity.",
    body:
      "The same systems thinking, applied to mobile: home coordination, personal finance and health data—shipped as focused, useful products.",
    tags: ["Product strategy", "iOS + Flutter", "Data-rich UX"],
    accent: "#c8a7ff",
    accentRgb: "200, 167, 255",
    world: "mobile",
    alignment: "left",
    nextLabel: "Discuss an Unreal / VR project",
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
  email: "Project enquiries",
  emailHref:
    "mailto:Larion1@gmail.com?subject=New%20Unreal%20%2F%20VR%20project",
  whatsapp: "https://wa.me/66922470654",
};
