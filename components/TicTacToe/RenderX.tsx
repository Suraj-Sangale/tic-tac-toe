/**
 * Renders an animated X symbol
 * Uses SVG with stroke-dasharray animation for drawing effect
 */

interface RenderXProps {
  animate?: boolean;
}

export const RenderX = ({ animate = true }: RenderXProps) => (
  <svg
    viewBox="0 0 100 100"
    className="w-full h-full"
    style={{ filter: "drop-shadow(0 0 8px rgba(255, 100, 100, 0.8))" }}
  >
    <line
      x1="20"
      y1="20"
      x2="80"
      y2="80"
      stroke="currentColor"
      strokeWidth="8"
      strokeLinecap="round"
      style={{
        strokeDasharray: "141.42",
        strokeDashoffset: animate ? "141.42" : "0",
        animation: animate ? "drawXLine1 0.4s ease-out forwards" : "none",
      }}
    />
    <line
      x1="80"
      y1="20"
      x2="20"
      y2="80"
      stroke="currentColor"
      strokeWidth="8"
      strokeLinecap="round"
      style={{
        strokeDasharray: "141.42",
        strokeDashoffset: animate ? "141.42" : "0",
        animation: animate
          ? "drawXLine2 0.4s ease-out 0.2s forwards"
          : "none",
      }}
    />
  </svg>
);

