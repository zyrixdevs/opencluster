export interface LatticeLoaderProps {
  label?: string;
  size?: number;
  className?: string;
}
export function LatticeLoader({
  label = "Loading",
  size = 32,
  className = "",
}: LatticeLoaderProps) {
  return (
    <span
      aria-label={label}
      className={`rb-lattice-loader ${className}`}
      role="status"
      style={{ width: size, height: size }}
    >
      <span />
      <span />
      <span />
      <span />
    </span>
  );
}
export default LatticeLoader;
