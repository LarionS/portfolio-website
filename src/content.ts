import hoverPoster from "../assets/journey/hover-the-edge/hover-story-v2-poster.jpg";
import hoverVideo from "../assets/journey/hover-the-edge/hover-story-v2.mp4";
import flyboxPoster from "../assets/journey/flybox/flybox-story-v2-poster.jpg";
import flyboxVideo from "../assets/journey/flybox/flybox-story-v2.mp4";
import lighthouseScreen from "../assets/journey/apps/lighthouse-feed-stories-3d.webp";
import moneyNestScreen from "../assets/journey/apps/moneynest-home-3d.webp";
import biteSyncScreen from "../assets/journey/apps/bitesync-settings-de.webp";

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
    eyebrow: "Clinical decision systems",
    title: "A patient changes. The room responds.",
    body:
      "VR scenarios let hospital teams see, choose and act—then replay the exact decision path.",
    tags: [
      "Hospital networks",
      "Nurse + MDA / EMS training",
      "Decision replay",
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
      label: "Begin the decision",
      resetLabel: "Stabilize the patient",
      idleStatus: "Patient stable · observe the baseline.",
      activeStatus: "Deterioration detected · decision path recording.",
      resetStatus: "Intervention complete · decision ready to replay.",
    },
  },
  {
    id: "tactical",
    number: "02",
    nav: "Connected",
    eyebrow: "Army training · Connected XR",
    title: "One command. Six trainees respond.",
    body:
      "A six-person Unreal Engine simulation over LAN. Instructors trigger events from PC or tablet while wearables, tracked training weapons and haptics return live data.",
    tags: [
      "Up to 6 trainees over LAN",
      "PC + tablet instructor control",
      "Wearables + tracked weapons + haptics",
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
      label: "Send an instructor event",
      resetLabel: "Clear the event",
      idleStatus: "Six trainees connected · instructor ready.",
      activeStatus: "Event sent · vitals, equipment and haptic feedback reporting.",
      resetStatus: "Route cleared · all six trainees synchronized.",
    },
  },
  {
    id: "emergency",
    number: "03",
    nav: "Response",
    eyebrow: "Multi-role response training",
    title: "One incident. Three coordinated responses.",
    body:
      "Police, fire and medical teams rehearse their role in the same controllable scenario—together, safely, repeatedly.",
    tags: [
      "Police · fire · medical",
      "Shared scenario state",
      "Repeatable scenario control",
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
      label: "Coordinate the response",
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
      "FlyboxVR maps balance and posture into real-time flight inside a physical wind system.",
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
  email: "Larion1@gmail.com",
  emailHref:
    "mailto:Larion1@gmail.com?subject=New%20Unreal%20%2F%20VR%20project",
  whatsapp: "https://wa.me/66922470654",
};
