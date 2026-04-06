import { EElementType } from "../../../document/types.elements";
import type { EElementUuid } from "../../../document/types.misc";
import { EAnimatedImageElementBuilder } from "../../builders/elements/EAnimatedImageElementBuilder";
import { EGraphicsElementBuilder } from "../../builders/elements/EGraphicsElementBuilder";
import { EImageElementBuilder } from "../../builders/elements/EImageElementBuilder";
import { ENineSliceElementBuilder } from "../../builders/elements/ENineSliceElementBuilder";
import { EProgressElementBuilder } from "../../builders/elements/EProgressElementBuilder";
import { ESceneElementBuilder } from "../../builders/elements/ESceneElementBuilder";
import { ETextElementBuilder } from "../../builders/elements/ETextElementBuilder";
import type { EAnyElementBuilder } from "../../builders/elements/types";
import { EAnimatedImageElementCard } from "../../cards/elements/EAnimatedImageElementCard";
import { EGraphicsElementCard } from "../../cards/elements/EGraphicsElementCard";
import { EImageElementCard } from "../../cards/elements/EImageElementCard";
import { ENineSliceElementCard } from "../../cards/elements/ENineSliceElementCard";
import { EProgressElementCard } from "../../cards/elements/EProgressElementCard";
import { ESceneElementCard } from "../../cards/elements/ESceneElementCard";
import { ETextElementCard } from "../../cards/elements/ETextElementCard";

export interface ElementEntry {
  label: string;
  type: EElementType;
  createBuilder: (container: HTMLDivElement) => EAnyElementBuilder;
  createCard: (container: HTMLElement, uuid: EElementUuid) => void;
}

export const ELEMENT_REGISTRY: readonly ElementEntry[] = [
  {
    label: "Animated Image",
    type: EElementType.ANIMATED_IMAGE,
    createBuilder: (container) => new EAnimatedImageElementBuilder(container),
    createCard: (container, uuid) => new EAnimatedImageElementCard(container, uuid),
  },
  {
    label: "Graphics",
    type: EElementType.GRAPHICS,
    createBuilder: (container) => new EGraphicsElementBuilder(container),
    createCard: (container, uuid) => new EGraphicsElementCard(container, uuid),
  },
  {
    label: "Image",
    type: EElementType.IMAGE,
    createBuilder: (container) => new EImageElementBuilder(container),
    createCard: (container, uuid) => new EImageElementCard(container, uuid),
  },
  {
    label: "Nine Slice",
    type: EElementType.NINE_SLICE,
    createBuilder: (container) => new ENineSliceElementBuilder(container),
    createCard: (container, uuid) => new ENineSliceElementCard(container, uuid),
  },
  {
    label: "Progress",
    type: EElementType.PROGRESS,
    createBuilder: (container) => new EProgressElementBuilder(container),
    createCard: (container, uuid) => new EProgressElementCard(container, uuid),
  },
  {
    label: "Scene",
    type: EElementType.SCENE,
    createBuilder: (container) => new ESceneElementBuilder(container),
    createCard: (container, uuid) => new ESceneElementCard(container, uuid),
  },
  {
    label: "Text",
    type: EElementType.TEXT,
    createBuilder: (container) => new ETextElementBuilder(container),
    createCard: (container, uuid) => new ETextElementCard(container, uuid),
  },
];

export const DEFAULT_BUILDER_TYPE = EElementType.IMAGE;
