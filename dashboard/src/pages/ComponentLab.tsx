import { useReducedMotion } from "framer-motion";
import { Activity, ArrowRight, BellRing, Sparkles } from "lucide-react";
import { lazy, Suspense, useMemo, useRef, useState } from "react";
import {
  BellButton,
  BellToggle,
  LatticeLoader,
  ParticleButton,
  PromptBar,
  StatusMark,
  SwipeRow,
  SwitchButton,
} from "../components/react-bits/controls";
import BlurText from "../components/react-bits/text/BlurText";
import CountUp from "../components/react-bits/text/CountUp";
import SplitText from "../components/react-bits/text/SplitText";
import {
  AccountMenu,
  AIContextMeter,
  AnimatedBeam,
  AnimatedThemeToggler,
  DateRangeCalendar,
  TimezonePlanner,
} from "../components/react-bits/utilities";
import { Card, PageTitle } from "../components/ui";
import { useDashboardStore } from "../state/useDashboardStore";

// ORIGINAL (preserved, not deleted — disabled by comment): const CrystalizedBall = lazy(() => import("../components/react-bits/visuals/CrystalizedBall"));
const LaserFlow = lazy(
  () => import("../components/react-bits/visuals/LaserFlow"),
);

export function ComponentLabPage() {
  const reducedMotion = useReducedMotion();
  const performanceMode = useDashboardStore((state) => state.performanceMode);
  const setTheme = useDashboardStore((state) => state.setTheme);
  const displayName = useDashboardStore((state) => state.displayName);
  const setDisplayName = useDashboardStore((state) => state.setDisplayName);
  const [notifications, setNotifications] = useState(
    () => localStorage.getItem("opencluster.notifications") !== "false",
  );
  const [promptNote, setPromptNote] = useState("");
  const [promptText, setPromptText] = useState("");
  const [reviewed, setReviewed] = useState(false);
  const [range, setRange] = useState(() => {
    const today = new Date();
    const to = today.toISOString().slice(0, 10);
    return { from: `${to.slice(0, 8)}01`, to };
  });
  const [localTheme, setLocalTheme] = useState<"light" | "dark">(() =>
    document.documentElement.dataset.theme === "dark" ? "dark" : "light",
  );
  const beamRef = useRef<HTMLDivElement>(null);
  const beamFrom = useRef<HTMLDivElement>(null);
  const beamTo = useRef<HTMLDivElement>(null);
  const surfaceRef = useRef<HTMLDivElement>(null);
  const pauseVisuals = Boolean(reducedMotion || performanceMode);
  const promptTokens = Math.ceil(
    promptText.trim().split(/\s+/).filter(Boolean).length * 1.35,
  );
  const rangeDays = useMemo(() => {
    if (!range.from || !range.to) return 0;
    return Math.max(
      0,
      Math.round(
        (new Date(`${range.to}T00:00:00`).getTime() -
          new Date(`${range.from}T00:00:00`).getTime()) /
          86_400_000,
      ) + 1,
    );
  }, [range]);
  const changeNotifications = (enabled: boolean) => {
    setNotifications(enabled);
    localStorage.setItem("opencluster.notifications", String(enabled));
    window.dispatchEvent(new Event("opencluster:notifications-change"));
  };
  const changeTheme = (next: "light" | "dark") => {
    setLocalTheme(next);
    setTheme(next);
  };

  return (
    <div className="component-lab">
      <PageTitle
        eyebrow="INTERACTIVE COMPONENTS"
        title="Component Lab"
        description="Every supplied visual and control, collected in one local, interactive workspace. Demo actions stay in this browser."
      />
      <div className="component-lab-grid">
        <Card className="component-lab-card component-lab-wide">
          <div className="component-lab-heading">
            <span className="eyebrow">TEXT MOTION</span>
            <StatusMark status="success" label="Ready" />
          </div>
          <h2>
            <SplitText
              text="A calmer command center"
              tag="span"
              textAlign="left"
              splitType="words"
              effect="rise"
              delay={65}
              duration={0.7}
              trigger="view"
            />
          </h2>
          <BlurText
            text="Infrastructure signals, local records, and operator tools in one clear view."
            effect="focus"
            animateBy="words"
            delay={45}
            stepDuration={0.25}
            distance={10}
            className="component-lab-blur"
          />
          <div className="component-lab-inline">
            <CountUp
              from={0}
              to={128}
              mode="roll"
              duration={1.5}
              separator=","
              trigger="view"
            />
            <span>sample events processed</span>
          </div>
        </Card>

        <Card className="component-lab-card">
          <div className="component-lab-heading">
            <span className="eyebrow">LOCAL PROFILE</span>
            <Sparkles size={16} />
          </div>
          <p>Change the name used by this browser workspace.</p>
          <AccountMenu
            accounts={[
              { id: "operator", name: displayName || "Operator" },
              { id: "admin", name: "Admin" },
              { id: "guest", name: "Guest" },
            ]}
            activeId={
              displayName === "Admin"
                ? "admin"
                : displayName === "Guest"
                  ? "guest"
                  : "operator"
            }
            onSelect={(account) => setDisplayName(account.name)}
            className="component-lab-account"
          />
        </Card>

        <Card className="component-lab-card">
          <div className="component-lab-heading">
            <span className="eyebrow">PREFERENCES</span>
            <BellRing size={16} />
          </div>
          <div className="component-lab-control-row">
            <span>Notification indicator</span>
            <BellToggle
              checked={notifications}
              onCheckedChange={changeNotifications}
            />
          </div>
          <BellButton
            subscribed={notifications}
            onSubscribedChange={changeNotifications}
            count={notifications ? 2 : 0}
          />
          <div className="component-lab-control-row">
            <span>Theme transition</span>
            <AnimatedThemeToggler
              theme={localTheme}
              onThemeChange={changeTheme}
              className="component-lab-icon-button"
            />
          </div>
          <SwitchButton theme={localTheme} onThemeChange={changeTheme} />
        </Card>

        <Card className="component-lab-card">
          <div className="component-lab-heading">
            <span className="eyebrow">LOCAL PROMPT NOTE</span>
            <Activity size={16} />
          </div>
          <p>Save a prompt as a local note. No AI service is connected.</p>
          <PromptBar
            placeholder="Write a local operations note…"
            onSend={(value) => {
              setPromptText(value);
              setPromptNote(value);
            }}
          />
          {promptNote && (
            <p className="component-lab-note" role="status">
              Saved locally: {promptNote}
            </p>
          )}
          <AIContextMeter
            segments={[
              {
                id: "prompt",
                label: "Current note estimate",
                tokens: promptTokens,
                color: "#9fe870",
              },
            ]}
            limit={8000}
            modelLabel="Local estimate · 8K limit"
            className="component-lab-meter"
          />
          <ParticleButton
            onClick={() =>
              setPromptNote((current) => current || "Workspace note saved.")
            }
            successLabel="Saved locally"
          >
            Save note
          </ParticleButton>
        </Card>

        <Card className="component-lab-card">
          <div className="component-lab-heading">
            <span className="eyebrow">DATE RANGE</span>
            <Activity size={16} />
          </div>
          <DateRangeCalendar
            from={range.from}
            to={range.to}
            onChange={setRange}
            className="component-lab-dates"
          />
          <p className="component-lab-note">
            Selected local range: {rangeDays} day{rangeDays === 1 ? "" : "s"}.
          </p>
          <div className="component-lab-control-row">
            <span>Motion sample</span>
            <LatticeLoader label="Decorative loading animation" />
          </div>
        </Card>

        <Card className="component-lab-card">
          <div className="component-lab-heading">
            <span className="eyebrow">TIMEZONES</span>
            <Activity size={16} />
          </div>
          <TimezonePlanner />
        </Card>

        <div className="component-lab-beam-wrap" ref={beamRef}>
          <Card className="component-lab-card component-lab-wide component-lab-beam">
            <AnimatedBeam
              containerRef={beamRef}
              fromRef={beamFrom}
              toRef={beamTo}
              curvature={32}
              duration={4}
            />
            <div className="component-lab-heading">
              <span className="eyebrow">ANIMATED BEAM</span>
              <ArrowRight size={16} />
            </div>
            <div className="component-lab-beam-nodes">
              <span ref={beamFrom}>Validated locally</span>
              <span ref={beamTo}>Ready for review</span>
            </div>
          </Card>
        </div>

        <Card className="component-lab-card component-lab-wide">
          <div className="component-lab-heading">
            <span className="eyebrow">SAFE INTERACTION PATTERNS</span>
            <StatusMark
              status={reviewed ? "success" : "warning"}
              label={reviewed ? "Reviewed" : "Needs review"}
            />
          </div>
          <SwipeRow
            label="Sample activity actions"
            actions={
              <button
                type="button"
                onClick={() => setReviewed((value) => !value)}
              >
                {reviewed ? "Reopen" : "Mark reviewed"}
              </button>
            }
            className="component-lab-swipe"
          >
            <div className="component-lab-swipe-content">
              <span>Sample node maintenance notice</span>
              <small>Drag left to reveal its local action</small>
            </div>
          </SwipeRow>
        </Card>

        <Card className="component-lab-card component-lab-wide">
          <div className="component-lab-heading">
            <span className="eyebrow">LASER VISUAL</span>
            <span>
              {pauseVisuals
                ? "Paused for motion/performance settings"
                : "Decorative sample"}
            </span>
          </div>
          <div className="component-lab-visuals">
            {/* ORIGINAL (preserved, not deleted — disabled by comment): <div className="component-lab-orb"><Suspense fallback={<LatticeLoader label="Loading crystal visual" />}><CrystalizedBall preset="eclipse" particleCount={1800} interactive={!pauseVisuals} paused={pauseVisuals} /></Suspense></div> */}
            <div className="component-lab-laser">
              <Suspense
                fallback={<LatticeLoader label="Loading laser visual" />}
              >
                <LaserFlow
                  surfaceRef={surfaceRef}
                  color="#9fe870"
                  theme={localTheme}
                  paused={pauseVisuals}
                  dpr={1}
                />
              </Suspense>
              <div className="component-lab-laser-surface" ref={surfaceRef}>
                Sample telemetry surface
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
