import type { EAnimatedImageElementBuilder } from "./EAnimatedImageElementBuilder";
import type { EGraphicsElementBuilder } from "./EGraphicsElementBuilder";
import type { EImageElementBuilder } from "./EImageElementBuilder";
import type { ENineSliceElementBuilder } from "./ENineSliceElementBuilder";
import type { EProgressElementBuilder } from "./EProgressElementBuilder";
import type { ESceneElementBuilder } from "./ESceneElementBuilder";
import type { ETextElementBuilder } from "./ETextElementBuilder";

export type EAnyElementBuilder =
  | EAnimatedImageElementBuilder
  | EGraphicsElementBuilder
  | EImageElementBuilder
  | ENineSliceElementBuilder
  | EProgressElementBuilder
  | ESceneElementBuilder
  | ETextElementBuilder;
