import type { WorldKind } from "./content";

export type JourneySceneState = {
  clinicalActive: boolean;
  tacticalNode: number | null;
  emergencyActive: boolean;
  hoverBoost: boolean;
  flyboxActive: boolean;
  mobileFocus: number;
  contactAssembled: boolean;
};

export const INITIAL_SCENE_STATE: JourneySceneState = {
  clinicalActive: false,
  tacticalNode: null,
  emergencyActive: false,
  hoverBoost: false,
  flyboxActive: false,
  mobileFocus: 1,
  contactAssembled: false,
};

export type BooleanWorld = Extract<
  WorldKind,
  "clinical" | "emergency" | "hover" | "flybox"
>;

export function isWorldActive(state: JourneySceneState, world: WorldKind) {
  if (world === "clinical") return state.clinicalActive;
  if (world === "tactical") return state.tacticalNode !== null;
  if (world === "emergency") return state.emergencyActive;
  if (world === "hover") return state.hoverBoost;
  if (world === "flybox") return state.flyboxActive;
  return false;
}
