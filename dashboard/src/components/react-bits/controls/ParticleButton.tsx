import { AlertCircle, Check, LoaderCircle } from "lucide-react";
import {
  type ButtonHTMLAttributes,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";

type Status = "idle" | "pending" | "success" | "error";
export interface ParticleButtonProps
  extends Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    "onClick" | "children"
  > {
  children: ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => unknown;
  pendingLabel?: ReactNode;
  successLabel?: ReactNode;
  errorLabel?: ReactNode;
  successDuration?: number;
  errorDuration?: number;
  onError?: (error: unknown) => void;
}
export function ParticleButton({
  children,
  onClick,
  pendingLabel = "Saving…",
  successLabel = "Saved",
  errorLabel = "Try again",
  successDuration = 1600,
  errorDuration = 3200,
  onError,
  className = "",
  disabled,
  ...props
}: ParticleButtonProps) {
  const [status, setStatus] = useState<Status>("idle");
  const run = useRef(0);
  const timer = useRef<number | undefined>(undefined);
  useEffect(
    () => () => {
      run.current++;
      window.clearTimeout(timer.current);
    },
    [],
  );
  const settle = (next: "success" | "error") => {
    setStatus(next);
    timer.current = window.setTimeout(
      () => setStatus("idle"),
      next === "success" ? successDuration : errorDuration,
    );
  };
  const handleClick: ButtonHTMLAttributes<HTMLButtonElement>["onClick"] = (
    event,
  ) => {
    if (status === "pending") return;
    const result = onClick?.(event as React.MouseEvent<HTMLButtonElement>);
    if (event.defaultPrevented) return;
    if (result && typeof (result as PromiseLike<unknown>).then === "function") {
      const current = ++run.current;
      setStatus("pending");
      Promise.resolve(result).then(
        () => {
          if (run.current === current) settle("success");
        },
        (error: unknown) => {
          if (run.current === current) {
            settle("error");
            onError?.(error);
          }
        },
      );
    } else settle("success");
  };
  const content =
    status === "pending" ? (
      <>
        <LoaderCircle className="rb-spin" size={16} />
        {pendingLabel}
      </>
    ) : status === "success" ? (
      <>
        <Check size={16} />
        {successLabel}
      </>
    ) : status === "error" ? (
      <>
        <AlertCircle size={16} />
        {errorLabel}
      </>
    ) : (
      children
    );
  return (
    <button
      {...props}
      aria-busy={status === "pending" || undefined}
      className={`rb-particle-button ${className}`}
      disabled={disabled || status === "pending"}
      onClick={handleClick}
      type="button"
    >
      {content}
    </button>
  );
}
export default ParticleButton;
