/**
 * Renders an animated O symbol
 * Uses SVG circle with stroke-dasharray animation for drawing effect
 */

interface RenderOProps {
  animate?: boolean;
}

export const RenderO = ({ animate = true }: RenderOProps) => (
  <svg
    viewBox="0 0 100 100"
    className="w-full h-full"
    style={{ filter: "drop-shadow(0 0 8px rgba(100, 150, 255, 0.8))" }}
  >
    <circle
      cx="50"
      cy="50"
      r="30"
      fill="none"
      stroke="currentColor"
      strokeWidth="8"
      strokeLinecap="round"
      style={{
        strokeDasharray: "283",
        strokeDashoffset: animate ? "283" : "0",
        animation: animate ? "drawOCircle 0.5s ease-out forwards" : "none",
      }}
    />
  </svg>
);

