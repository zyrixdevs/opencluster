import { useQueryClient } from "@tanstack/react-query";
import * as Icons from "lucide-react";
import { useState } from "react";
import * as UI from "../components/ui";
import { useDashboardStore } from "../state/useDashboardStore";

export function SettingsPage() {
  const theme = useDashboardStore((s) => s.theme);
  const setTheme = useDashboardStore((s) => s.setTheme);
  const motion = useDashboardStore((s) => s.demoMotion);
  const setMotionMode = useDashboardStore((s) => s.setMotionMode);
  const motionMode = useDashboardStore((s) => s.motionMode);
  const compact = useDashboardStore((s) => s.compactDashboard);
  const setCompactDashboard = useDashboardStore((s) => s.setCompactDashboard);
  const setVisualQuality = useDashboardStore((s) => s.setVisualQuality);
  const visualQuality = useDashboardStore((s) => s.visualQuality);
  const displayName = useDashboardStore((s) => s.displayName);
  const setDisplayName = useDashboardStore((s) => s.setDisplayName);
  const cinematicMotion = useDashboardStore((s) => s.cinematicMotion);
  const demoDataset = useDashboardStore((s) => s.demoDataset);
  const setDemoDataset = useDashboardStore((s) => s.setDemoDataset);
  const resetDemoData = useDashboardStore((s) => s.resetDemoData);
  const queryClient = useQueryClient();
  const [saved, setSaved] = useState("");
  return (
    <>
      <UI.PageTitle
        eyebrow="PREFERENCES"
        title="Settings"
        description="Customize this local workspace. Preferences stay in this browser."
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
            Local data
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
                <b>Cinematic motion</b>
                <small>
                  Enable enhanced decorative motion when motion is allowed.
                </small>
              </div>
              <button
                type="button"
                className={`toggle ${cinematicMotion ? "on" : ""}`}
                role="switch"
                aria-checked={cinematicMotion}
                aria-label="Cinematic motion"
                onClick={() =>
                  setMotionMode(cinematicMotion ? "system" : "cinematic")
                }
              >
                <span />
              </button>
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
                onClick={() =>
                  setMotionMode(motionMode === "reduced" ? "system" : "reduced")
                }
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
              <select
                aria-label="Visual quality"
                value={visualQuality}
                onChange={(event) =>
                  setVisualQuality(
                    event.target.value as "auto" | "performance" | "high",
                  )
                }
              >
                <option value="auto">Automatic</option>
                <option value="performance">Performance</option>
                <option value="high">High</option>
              </select>
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
                <h2>Local data</h2>
                <p>
                  Records are stored in IndexedDB; display preferences use
                  localStorage.
                </p>
              </div>
            </div>
            <div className="demo-setting-note">
              <Icons.CircleAlert size={15} />
              <span>
                Seeded metrics are sample values. Cluster, node, workflow, and
                graph records persist in this browser. No credentials or secrets
                are stored.
              </span>
            </div>
            <div className="setting-row">
              <label htmlFor="display-name">
                <b>Home greeting</b>
                <small>Choose the local display name shown on Home.</small>
              </label>
              <input
                id="display-name"
                maxLength={40}
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
              />
            </div>
            <div className="setting-row">
              <label htmlFor="demo-dataset">
                <b>Seed dataset</b>
                <small>
                  Replace current cluster and node records with the selected
                  seed.
                </small>
              </label>
              <select
                id="demo-dataset"
                value={demoDataset}
                onChange={(event) => {
                  const next = event.target.value as
                    | "multi-cluster"
                    | "homelab-only";
                  if (
                    next !== demoDataset &&
                    window.confirm(
                      "Replace your current local clusters and nodes with this seed dataset?",
                    )
                  )
                    void setDemoDataset(next).catch(() =>
                      setSaved(
                        "The selected local dataset could not be saved.",
                      ),
                    );
                }}
              >
                <option value="multi-cluster">Multi-cluster demo</option>
                <option value="homelab-only">Homelab only</option>
              </select>
            </div>
            <div className="setting-row">
              <div>
                <b>Reset demo data and preferences</b>
                <small>
                  Restore the original sample content and default settings.
                </small>
              </div>
              <UI.Button
                onClick={async () => {
                  if (
                    window.confirm(
                      "Reset local clusters, nodes, workflows, graph layouts, and preferences? This cannot be undone.",
                    )
                  ) {
                    try {
                      await resetDemoData();
                      await queryClient.invalidateQueries();
                      setSaved("Sample records and preferences restored.");
                    } catch {
                      setSaved(
                        "Local reset failed. Your records were not confirmed as reset.",
                      );
                    }
                  }
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
              <span className="integration-pip active" />
              <div>
                <b>Browser-local provider</b>
                <small>
                  Connected · IndexedDB records, localStorage preferences
                </small>
              </div>
              <span className="availability-pill available">Active</span>
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
