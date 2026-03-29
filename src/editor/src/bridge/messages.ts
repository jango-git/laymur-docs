export interface ResetSceneMessage {
  type: "RESET_SCENE";
}

export interface AddLayerMessage {
  type: "ADD_LAYER";
  layerId: string;
  name: string;
  policyType: string;
  policyParams: Record<string, number>;
}

export interface SetActiveLayerMessage {
  type: "SET_ACTIVE_LAYER";
  layerId: string;
}

export interface RemoveLayerMessage {
  type: "REMOVE_LAYER";
  layerId: string;
}

export interface SetLayerConfigMessage {
  type: "SET_LAYER_CONFIG";
  layerId: string;
  name: string;
  policyType: string;
  policyParams: Record<string, number>;
}

export interface AddImageMessage {
  type: "ADD_IMAGE";
  id: string;
  layerId: string;
  dataURL: string;
}

export interface RemoveElementMessage {
  type: "REMOVE_ELEMENT";
  id: string;
  layerId: string;
}

export interface ReorderElementsMessage {
  type: "REORDER_ELEMENTS";
  layerId: string;
  orderedIds: string[];
}

export interface SetElementTextureMessage {
  type: "SET_ELEMENT_TEXTURE";
  id: string;
  layerId: string;
  dataURL: string;
}

export interface AddConstraintMessage {
  type: "ADD_CONSTRAINT";
  id: string;
  layerId: string;
  constraintType: string;
  fieldValues: Record<string, string | number>;
}

export interface UpdateConstraintMessage {
  type: "UPDATE_CONSTRAINT";
  id: string;
  layerId: string;
  constraintType: string;
  fieldValues: Record<string, string | number>;
}

export interface RemoveConstraintMessage {
  type: "REMOVE_CONSTRAINT";
  id: string;
  layerId: string;
}

export type EditorMessage =
  | ResetSceneMessage
  | AddLayerMessage
  | SetActiveLayerMessage
  | RemoveLayerMessage
  | SetLayerConfigMessage
  | AddImageMessage
  | RemoveElementMessage
  | ReorderElementsMessage
  | SetElementTextureMessage
  | AddConstraintMessage
  | UpdateConstraintMessage
  | RemoveConstraintMessage;
