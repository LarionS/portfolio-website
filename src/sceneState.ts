import type { WorldKind } from "./content";

export type ClinicalPhase = "baseline" | "event" | "response" | "review";

export type TacticalPhase =
  | "ready"
  | "dispatch"
  | "feedback"
  | "telemetry"
  | "review";

export type JourneySceneState = {
  clinicalPhase: ClinicalPhase;
  tacticalPhase: TacticalPhase;
  emergencyStep: number;
  hoverBoost: boolean;
  flyboxActive: boolean;
  mobileFocus: number;
  contactAssembled: boolean;
};

export const INITIAL_SCENE_STATE: JourneySceneState = {
  clinicalPhase: "baseline",
  tacticalPhase: "ready",
  emergencyStep: 0,
  hoverBoost: false,
  flyboxActive: false,
  mobileFocus: 1,
  contactAssembled: false,
};

export type BooleanWorld = Extract<
  WorldKind,
  "hover" | "flybox"
>;

export function isWorldActive(state: JourneySceneState, world: WorldKind) {
  if (world === "clinical") return state.clinicalPhase !== "baseline";
  if (world === "tactical") return state.tacticalPhase !== "ready";
  if (world === "emergency") return state.emergencyStep > 0;
  if (world === "hover") return state.hoverBoost;
  if (world === "flybox") return state.flyboxActive;
  return false;
}
