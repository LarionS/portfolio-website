import hospitalImage from "../assets/journey/worlds/hospital-world.webp";
import tacticalImage from "../assets/journey/worlds/tactical-world.webp";
import emergencyImage from "../assets/journey/worlds/emergency-world.webp";
import hoverPoster from "../assets/journey/hover-the-edge/hover-10s.jpg";
import hoverVideo from "../assets/journey/hover-the-edge/hover-loop.mp4";
import flyboxPoster from "../assets/journey/flybox/flybox-08s.jpg";
import flyboxVideo from "../assets/journey/flybox/flybox-loop.mp4";
import lighthouseScreen from "../assets/journey/apps/lighthouse-feed-stories.webp";
import lighthouseIcon from "../assets/journey/apps/lighthouse-icon.webp";
import moneyNestScreen from "../assets/journey/apps/moneynest-home.webp";
import moneyNestIcon from "../assets/journey/apps/moneynest-icon.webp";
import biteSyncScreen from "../assets/journey/apps/bitesync-settings-he.webp";
import biteSyncIcon from "../assets/journey/apps/bitesync-icon.webp";

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
  image?: string;
  video?: string;
  poster?: string;
  alignment: "left" | "right";
  note?: string;
  noteDetail?: string;
  nextLabel: string;
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
      "I build immersive clinical training for hospital teams, nurses and pre-hospital emergency care. The work spans hospital networks across Israel, nurse education and MDA programs—giving teams a safe place to rehearse procedures, communication and critical decisions.",
    tags: [
      "Hospital networks",
      "Nurse training",
      "MDA emergency care",
      "Repeatable scenarios",
    ],
    accent: "#74ecff",
    accentRgb: "116, 236, 255",
    world: "clinical",
    image: hospitalImage,
    alignment: "left",
    note: "Confidential project · Recreated visual",
    noteDetail:
      "The work is real. Client environments and operational material are confidential, so this scene is an original reconstruction.",
    nextLabel: "Connected training",
  },
  {
    id: "tactical",
    number: "02",
    nav: "Connected",
    eyebrow: "Connected defense training",
    title: "Six trainees. One live scenario.",
    body:
      "A confidential Unreal Engine system connects up to six participants over LAN while an instructor controls events from a PC dashboard or tablet. Wearable vitals, tracked peripherals and haptics bring the physical and virtual session together.",
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
    image: tacticalImage,
    alignment: "right",
    note: "Confidential project · Recreated visual",
    noteDetail:
      "The capabilities and technical details are genuine. The visual contains no client interface, personnel or operational material.",
    nextLabel: "Emergency response",
  },
  {
    id: "emergency",
    number: "03",
    nav: "Response",
    eyebrow: "Emergency response training",
    title: "Rehearse pressure. Protect the response.",
    body:
      "Immersive scenarios for police, fire and emergency-service teams turn high-pressure coordination into safe, repeatable training—built around clear decisions, communication and team readiness.",
    tags: [
      "Police training",
      "Fire + rescue",
      "Emergency services",
      "Safe repetition",
    ],
    accent: "#ff7a3c",
    accentRgb: "255, 122, 60",
    world: "emergency",
    image: emergencyImage,
    alignment: "left",
    note: "Original concept visual · No client footage",
    noteDetail:
      "This is an original visualization of the training category, not footage from a client deployment.",
    nextLabel: "Hover The Edge",
  },
  {
    id: "hover-the-edge",
    number: "04",
    nav: "Hover",
    eyebrow: "Hover The Edge",
    title: "Movement is the mechanic.",
    body:
      "A complete VR game built around speed, spatial judgment and physical movement through surreal obstacle courses. The visual language keeps every challenge readable while the world stays in motion.",
    tags: [
      "Released VR title",
      "Unreal Engine",
      "Physical gameplay",
      "Full game loop",
    ],
    accent: "#71fff0",
    accentRgb: "113, 255, 240",
    world: "hover",
    image: hoverPoster,
    video: hoverVideo,
    poster: hoverPoster,
    alignment: "left",
    note: "Gameplay footage · Hover The Edge",
    nextLabel: "FlyboxVR",
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
      "FlyboxVR pairs a physical flight rig with a responsive virtual world, turning balance and motion into the interface. It is built for the instant when a spectator decides they have to try it.",
    tags: [
      "Location-based VR",
      "Physical interaction",
      "Real-time 3D",
      "Guest-facing experience",
    ],
    accent: "#f5c65c",
    accentRgb: "245, 198, 92",
    world: "flybox",
    image: flyboxPoster,
    video: flyboxVideo,
    poster: flyboxPoster,
    alignment: "right",
    note: "Project footage · FlyboxVR",
    nextLabel: "Mobile products",
  },
  {
    id: "mobile-products",
    number: "06",
    nav: "Apps",
    eyebrow: "Mobile products",
    title: "Different worlds. The same product discipline.",
    body:
      "The same systems thinking continues on mobile: clear interaction, expressive motion and products people can understand in seconds.",
    tags: ["Product design", "Mobile engineering", "iOS", "Flutter", "Data-rich UX"],
    accent: "#c8a7ff",
    accentRgb: "200, 167, 255",
    world: "mobile",
    alignment: "left",
    nextLabel: "Finish the journey",
  },
];

export const mobileProducts = [
  {
    name: "Lighthouse",
    line: "Shared-home coordination, made calmer.",
    screen: lighthouseScreen,
    icon: lighthouseIcon,
  },
  {
    name: "MoneyNest",
    line: "Personal finance without the noise.",
    screen: moneyNestScreen,
    icon: moneyNestIcon,
  },
  {
    name: "BiteSync",
    line: "Nutrition and health patterns, made visible.",
    screen: biteSyncScreen,
    icon: biteSyncIcon,
  },
];

export const contact = {
  email: "Larion1@gmail.com",
  emailHref:
    "mailto:Larion1@gmail.com?subject=New%20Unreal%20%2F%20VR%20project",
  whatsapp: "https://wa.me/66922470654",
};
