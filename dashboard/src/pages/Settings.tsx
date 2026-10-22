import * as Icons from "lucide-react";
import { useState } from "react";
import * as UI from "../components/ui";
import { useDashboardStore } from "../state/useDashboardStore";

export function SettingsPage() {
  const theme = useDashboardStore((s) => s.theme);
  const setTheme = useDashboardStore((s) => s.setTheme);
  const motion = useDashboardStore((s) => s.demoMotion);
  const setMotion = useDashboardStore((s) => s.setMotion);
  const compact = useDashboardStore((s) => s.compactDashboard);
  const setCompactDashboard = useDashboardStore((s) => s.setCompactDashboard);
  const performanceMode = useDashboardStore((s) => s.performanceMode);
  const setPerformanceMode = useDashboardStore((s) => s.setPerformanceMode);
  const [saved, setSaved] = useState("");
  return (
    <>
      <UI.PageTitle
        eyebrow="PREFERENCES"
        title="Settings"
        description="Customize this browser’s local demo experience."
      />
      <div className="settings-layout">
        <div className="settings-nav">
          <a className="active" href="#appearance">
            <Icons.Moon size={15} />
            Appearance
          </a>
          <a href="#dashboard">
            <Icons.Grid2X2 size={15} />
            Dashboard
          </a>
          <a href="#accessibility">
            <Icons.CircleHelp size={15} />
            Accessibility
          </a>
          <a href="#demo">
            <Icons.Sparkles size={15} />
            Demo data
          </a>
          <a href="#integrations">
            <Icons.Boxes size={15} />
            Integrations
          </a>
        </div>
        <div className="settings-content">
          <UI.Card id="appearance" className="settings-card">
            <div className="settings-card-heading">
              <div className="settings-icon">
                <Icons.Moon size={17} />
              </div>
              <div>
                <h2>Appearance</h2>
                <p>Choose how OpenCluster looks in this browser.</p>
              </div>
            </div>
            <div className="setting-row">
              <div>
                <b>Theme</b>
                <small>
                  Dark is the recommended command-center appearance.
                </small>
              </div>
              <div className="theme-options">
                {(["dark", "light", "system"] as const).map((value) => (
                  <button
                    type="button"
                    key={value}
                    className={theme === value ? "selected" : ""}
                    onClick={() => setTheme(value)}
                  >
                    {value[0].toUpperCase() + value.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="setting-row">
              <div>
                <b>Reduce motion</b>
                <small>Suppress interface animations for this browser.</small>
              </div>
              <button
                type="button"
                className={`toggle ${!motion ? "on" : ""}`}
                role="switch"
                aria-checked={!motion}
                aria-label="Reduce motion"
                onClick={() => setMotion(!motion)}
              >
                <span />
              </button>
            </div>
          </UI.Card>
          <UI.Card id="dashboard" className="settings-card">
            <div className="settings-card-heading">
              <div className="settings-icon">
                <Icons.Grid2X2 size={17} />
              </div>
              <div>
                <h2>Dashboard</h2>
                <p>Adjust information density for the home overview.</p>
              </div>
            </div>
            <div className="setting-row">
              <div>
                <b>Compact dashboard cards</b>
                <small>Use a denser layout for wide monitors.</small>
              </div>
              <button
                type="button"
                className={`toggle ${compact ? "on" : ""}`}
                role="switch"
                aria-checked={compact}
                aria-label="Compact dashboard cards"
                onClick={() => setCompactDashboard(!compact)}
              >
                <span />
              </button>
            </div>
            <div className="setting-row">
              <div>
                <b>Performance mode</b>
                <small>Reduce blur and decorative motion effects.</small>
              </div>
              <button
                type="button"
                className={`toggle ${performanceMode ? "on" : ""}`}
                role="switch"
                aria-checked={performanceMode}
                aria-label="Performance mode"
                onClick={() => setPerformanceMode(!performanceMode)}
              >
                <span />
              </button>
            </div>
          </UI.Card>
          <UI.Card id="accessibility" className="settings-card">
            <div className="settings-card-heading">
              <div className="settings-icon">
                <Icons.CircleHelp size={17} />
              </div>
              <div>
                <h2>Accessibility</h2>
                <p>Interaction and display options.</p>
              </div>
            </div>
            <div className="setting-row">
              <div>
                <b>Keyboard shortcuts</b>
                <small>Use ⌘K or Ctrl+K to open page search.</small>
              </div>
              <kbd>⌘ K</kbd>
            </div>
            <div className="setting-row">
              <div>
                <b>Color and status</b>
                <small>
                  Status always includes a text label with its indicator.
                </small>
              </div>
              <Icons.Check size={16} className="accent-icon" />
            </div>
          </UI.Card>
          <UI.Card id="demo" className="settings-card">
            <div className="settings-card-heading">
              <div className="settings-icon">
                <Icons.Sparkles size={17} />
              </div>
              <div>
                <h2>Demo data</h2>
                <p>Local sample data with non-sensitive browser preferences.</p>
              </div>
            </div>
            <div className="demo-setting-note">
              <Icons.CircleAlert size={15} />
              <span>
                Cluster and node data resets when this page is reloaded. Only
                appearance and layout preferences are stored in this browser.
              </span>
            </div>
            <div className="setting-row">
              <div>
                <b>Reset demo data</b>
                <small>Restore the original sample clusters and nodes.</small>
              </div>
              <UI.Button
                onClick={() => {
                  localStorage.removeItem("opencluster-demo-preferences");
                  window.location.reload();
                }}
              >
                Reset sample data
              </UI.Button>
            </div>
          </UI.Card>
          <UI.Card id="integrations" className="settings-card">
            <div className="settings-card-heading">
              <div className="settings-icon">
                <Icons.Boxes size={17} />
              </div>
              <div>
                <h2>Integrations</h2>
                <p>Connection settings for future OpenCluster capabilities.</p>
              </div>
            </div>
            <div className="integration-placeholder">
              <span className="integration-pip" />
              <div>
                <b>Control plane API</b>
                <small>Not connected · integration not implemented</small>
              </div>
              <span className="availability-pill planned">Unavailable</span>
            </div>
            <div className="integration-placeholder">
              <span className="integration-pip" />
              <div>
                <b>GitHub</b>
                <small>Not connected · integration not implemented</small>
              </div>
              <span className="availability-pill planned">Unavailable</span>
            </div>
          </UI.Card>
          <UI.Button
            variant="primary"
            className="save-settings"
            onClick={() => {
              setSaved("Preferences are saved automatically in this browser.");
              window.setTimeout(() => setSaved(""), 2500);
            }}
          >
            Save preferences
          </UI.Button>
          {saved && (
            <span role="status" className="save-message">
              {saved}
            </span>
          )}
        </div>
      </div>
    </>
  );
}
