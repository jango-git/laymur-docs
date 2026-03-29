export interface AssetMeta {
  name: string;
  url: string;
  dataURL: string;
}

export interface ElementState {
  id: string;
  type: string;
  name: string;
  fieldValues: Record<string, unknown>;
}

export interface ConstraintState {
  id: string;
  constraintType: string;
  name?: string;
  fieldValues: Record<string, string | number>;
}

export interface LayerState {
  id: string;
  name: string;
  policyType: string;
  policyParams: Record<string, number>;
  elements: ElementState[];
  constraints: ConstraintState[];
}
