import { forwardRef } from "react";
import type { ComponentRef } from "react";

import { useUIKit } from "../../provider/use-ui-kit";
import { resolvePalette } from "../../utils/resolve-palette";
import { StyledCard, StyledCardBody, StyledCardFooter, StyledCardHeader } from "./card.styled";
import type { CardBodyProps, CardFooterProps, CardHeaderProps, CardProps } from "./card-types";

type CardRef = ComponentRef<typeof StyledCard>;

/**
 * Rounded, padded, semantically-elevated container. Sits one layer
 * above `<Surface>` — Surface owns the color palette; Card layers
 * padding + radius + gap on top and adds a small compound API
 * (Card + Card.Header + Card.Body + Card.Footer) for the two most
 * common card layouts.
 *
 * ```tsx
 * // Simple
 * <Card>
 *   <Text variant="h4">Notification</Text>
 *   <Text>You have 3 unread messages.</Text>
 * </Card>
 *
 * // Compound
 * <Card>
 *   <Card.Header>
 *     <Text>Title</Text>
 *     <Button size="sm">Action</Button>
 *   </Card.Header>
 *   <Card.Body>
 *     <Text>Body copy.</Text>
 *   </Card.Body>
 *   <Card.Footer>
 *     <Button variant="ghost">Cancel</Button>
 *     <Button>Confirm</Button>
 *   </Card.Footer>
 * </Card>
 * ```
 *
 * ### Composition rationale
 *
 * Card reads the `surfaceColors` palette (same source Surface uses)
 * so a Card + a raised Surface share a background when the consumer
 * overrides the palette globally. It does NOT render `<Surface>`
 * internally — that would add a wrapper element to the tree with no
 * behavioral benefit. We resolve the palette + apply the background
 * inline (two lines) instead.
 */
const CardBase = forwardRef<CardRef, CardProps>(function Card(
  { level = "raised", surfaceColors, testID, children, ...rest },
  ref
) {
  const { tokens } = useUIKit();
  const palette = resolvePalette(tokens.surfaceColors, surfaceColors);
  const rootId = testID ?? "card";
  return (
    <StyledCard ref={ref} testID={rootId} backgroundColor={palette[level]} {...rest}>
      {children}
    </StyledCard>
  );
});

function CardHeader({ testID = "card-header", children, ...rest }: CardHeaderProps) {
  return (
    <StyledCardHeader testID={testID} {...rest}>
      {children}
    </StyledCardHeader>
  );
}

function CardBody({ testID = "card-body", children, ...rest }: CardBodyProps) {
  return (
    <StyledCardBody testID={testID} {...rest}>
      {children}
    </StyledCardBody>
  );
}

function CardFooter({ testID = "card-footer", children, ...rest }: CardFooterProps) {
  return (
    <StyledCardFooter testID={testID} {...rest}>
      {children}
    </StyledCardFooter>
  );
}

/**
 * Compound export. `CardBase` is the raw `forwardRef` component;
 * we attach `.Header` / `.Body` / `.Footer` as static properties
 * so consumers reach them via `Card.Header` without needing to
 * import each slot separately.
 */
type CardComponent = typeof CardBase & {
  Header: typeof CardHeader;
  Body: typeof CardBody;
  Footer: typeof CardFooter;
};

const CardWithSlots = CardBase as CardComponent;
CardWithSlots.Header = CardHeader;
CardWithSlots.Body = CardBody;
CardWithSlots.Footer = CardFooter;

export const Card = CardWithSlots;

export type {
  CardBodyProps,
  CardFooterProps,
  CardHeaderProps,
  CardLevel,
  CardProps,
} from "./card-types";
