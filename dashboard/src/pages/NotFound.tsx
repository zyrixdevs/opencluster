import * as Icons from "lucide-react";
import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="not-found">
      <div className="eyebrow">404 · PAGE NOT FOUND</div>
      <h1>This page isn’t in the demo</h1>
      <p>Choose a section from the sidebar to continue.</p>
      <Link to="/" className="button button-primary">
        Return home <Icons.ArrowRight size={14} />
      </Link>
    </div>
  );
}
