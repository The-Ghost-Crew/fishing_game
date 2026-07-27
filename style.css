/* ===== Fisher — token system =====
   Palette: deep pond teal (#12302E), mist green (#3F6E63), lantern gold (#E8B04B),
            driftwood brown (#2E2019), foam white (#F4F1E6)
   Type: Fraunces (display) / Nunito (UI + body) / JetBrains Mono (numbers)
   Signature: an ambient rippling water surface + the reel panel rising up
              from the waterline like something surfacing on the line.
*/

:root {
  --pond-deep: #0E2624;
  --pond-mid: #1B4640;
  --pond-light: #3F6E63;
  --wood: #2E2019;
  --wood-light: #4A362A;
  --gold: #E8B04B;
  --gold-dim: #C68F35;
  --foam: #F4F1E6;
  --danger: #C1543F;
  --font-display: 'Fraunces', serif;
  --font-body: 'Nunito', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}

* { box-sizing: border-box; }

html, body {
  margin: 0;
  height: 100%;
  font-family: var(--font-body);
  color: var(--foam);
  background: var(--pond-deep);
  -webkit-user-select: none;
  user-select: none;
}

#app {
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ---- Topbar ---- */
#topbar {
  position: relative;
  z-index: 5;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  background: rgba(46, 32, 25, 0.72);
  backdrop-filter: blur(6px);
  border-bottom: 1px solid rgba(232, 176, 75, 0.25);
}

#gameTitle {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 22px;
  margin: 0;
  letter-spacing: 0.02em;
  color: var(--foam);
  flex-shrink: 0;
}

.stats-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.stat-chip {
  font-family: var(--font-mono);
  font-size: 13px;
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(232, 176, 75, 0.2);
  border-radius: 999px;
  padding: 5px 10px;
  white-space: nowrap;
}

.icon-inline {
  width: 14px;
  height: 14px;
  vertical-align: -2px;
  margin-right: 1px;
}

.icon-fish {
  width: 24px;
  height: auto;
  vertical-align: -7px;
  margin-right: 4px;
}

/* ---- Buttons ---- */
.btn {
  font-family: var(--font-body);
  font-weight: 700;
  font-size: 14px;
  border: none;
  border-radius: 12px;
  padding: 10px 16px;
  cursor: pointer;
  background: var(--wood-light);
  color: var(--foam);
  transition: transform 0.12s ease, filter 0.12s ease;
}
.btn:hover { filter: brightness(1.1); }
.btn:active { transform: scale(0.97); }
.btn:disabled { opacity: 0.4; cursor: not-allowed; }
.btn:focus-visible { outline: 2px solid var(--gold); outline-offset: 2px; }

.btn-accent {
  background: var(--gold);
  color: var(--wood);
}
.btn-accent:disabled { background: #8a7550; color: rgba(46,32,25,0.6); }

.full-width { width: 100%; }

.danger-btn {
  background: transparent;
  color: var(--danger);
  border: 1px solid rgba(193, 84, 63, 0.5);
  font-size: 12px;
  padding: 6px 10px;
}

/* ---- Pond scene ---- */
#pond {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  padding: 24px 16px 40px;
  background:
    linear-gradient(180deg, rgba(63,110,99,0.35) 0%, rgba(14,38,36,0) 40%),
    repeating-linear-gradient(180deg, rgba(244,241,230,0.03) 0px, rgba(244,241,230,0.03) 2px, transparent 2px, transparent 26px),
    linear-gradient(160deg, var(--pond-mid) 0%, var(--pond-deep) 70%);
  overflow: hidden;
}

.ripple {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(244,241,230,0.10) 0%, rgba(244,241,230,0) 70%);
  animation: drift 14s ease-in-out infinite;
  pointer-events: none;
}
.ripple-a { width: 340px; height: 340px; top: 8%; left: -6%; animation-duration: 16s; }
.ripple-b { width: 260px; height: 260px; top: 35%; right: -8%; animation-duration: 19s; animation-delay: -4s; }
.ripple-c { width: 200px; height: 200px; bottom: 10%; left: 20%; animation-duration: 13s; animation-delay: -8s; }

@keyframes drift {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(4%, 3%) scale(1.08); }
}

#rodPanel {
  position: relative;
  z-index: 2;
  align-self: stretch;
  max-width: 420px;
  margin: 0 auto 20px;
  background: rgba(46, 32, 25, 0.65);
  border: 1px solid rgba(232, 176, 75, 0.2);
  border-radius: 14px;
  padding: 10px 14px;
}
#rodName { font-family: var(--font-display); font-size: 15px; }

.durability-track {
  margin-top: 6px;
  height: 6px;
  border-radius: 999px;
  background: rgba(0,0,0,0.35);
  overflow: hidden;
}
.durability-fill {
  height: 100%;
  width: 100%;
  background: var(--gold);
  transition: width 0.3s ease;
}
.durability-fill.durability-broken { background: var(--danger); }

#dock {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.btn-cast {
  font-family: var(--font-display);
  font-size: 18px;
  padding: 16px 42px;
  border-radius: 999px;
  background: var(--gold);
  color: var(--wood);
  box-shadow: 0 6px 18px rgba(232, 176, 75, 0.3);
}
.btn-cast:hover { box-shadow: 0 8px 22px rgba(232, 176, 75, 0.45); }

#waitIndicator {
  font-style: italic;
  color: rgba(244,241,230,0.75);
  font-size: 14px;
}

.hidden { display: none !important; }

/* ---- Overlays ---- */
.overlay {
  position: fixed;
  inset: 0;
  z-index: 20;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  background: rgba(6, 16, 15, 0.55);
  touch-action: none;
}
#resultModal.overlay,
#shopModal.overlay {
  align-items: center;
}

.reel-card, .modal-box {
  width: 92%;
  max-width: 460px;
  background: var(--wood);
  border-top: 1px solid rgba(232,176,75,0.3);
  border-radius: 20px 20px 0 0;
  padding: 22px 20px 30px;
  animation: surface 0.35s cubic-bezier(0.2, 0.8, 0.3, 1);
}
.modal-box {
  border-radius: 18px;
  border: 1px solid rgba(232,176,75,0.25);
}

.reel-card {
  max-width: 340px;
  padding: 16px 16px 18px;
  border-radius: 16px;
  margin-bottom: 8vh;
}

@keyframes surface {
  from { transform: translateY(40px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.reel-hint {
  text-align: center;
  font-size: 12px;
  color: rgba(244,241,230,0.7);
  margin: 0 0 12px;
}

.reel-track {
  position: relative;
  height: 38px;
  background: rgba(0,0,0,0.4);
  border-radius: 9px;
  overflow: visible;
}
.reel-bar {
  position: absolute;
  top: 3px;
  bottom: 3px;
  background: var(--foam);
  border-radius: 7px;
  box-shadow: 0 0 12px rgba(244,241,230,0.5);
}
.fish-marker {
  position: absolute;
  top: 50%;
  width: 26px;
  height: auto;
  transform: translate(-50%, -50%);
  transition: left 0.05s linear;
  filter: drop-shadow(0 1px 2px rgba(0,0,0,0.45));
}

.progress-track {
  margin-top: 10px;
  height: 6px;
  border-radius: 999px;
  background: rgba(0,0,0,0.4);
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  width: 0%;
  background: var(--gold);
}

/* ---- Result modal ---- */
.result-box { text-align: center; }
.result-icon {
  width: 64px;
  height: auto;
  display: block;
  margin: 0 auto 10px;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.35));
}
#resultTitle {
  font-family: var(--font-display);
  margin: 0 0 8px;
  font-size: 22px;
}
#resultDetail {
  font-size: 14px;
  line-height: 1.5;
  color: rgba(244,241,230,0.85);
  margin: 0 0 18px;
}

/* ---- Shop ---- */
.shop-box { max-height: 82vh; display: flex; flex-direction: column; }
.shop-tabs { display: flex; gap: 6px; margin-bottom: 12px; }
.tab-btn {
  flex: 1;
  background: rgba(0,0,0,0.25);
  color: rgba(244,241,230,0.7);
  border: none;
  border-radius: 10px;
  padding: 8px 6px;
  font-family: var(--font-body);
  font-weight: 700;
  font-size: 12px;
  cursor: pointer;
}
.tab-btn.active { background: var(--gold); color: var(--wood); }

.tab-scroll { overflow-y: auto; flex: 1; margin-bottom: 14px; }

.shop-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid rgba(244,241,230,0.08);
}
.shop-item-info strong { font-size: 14px; }
.stat-row {
  font-family: var(--font-mono);
  font-size: 11px;
  color: rgba(244,241,230,0.6);
  margin-top: 3px;
}
.tag {
  font-size: 11px;
  background: rgba(0,0,0,0.3);
  border-radius: 999px;
  padding: 3px 8px;
  color: rgba(244,241,230,0.7);
}
.tag.locked { color: var(--danger); }
.empty-note { color: rgba(244,241,230,0.6); font-size: 13px; }
.warn { color: var(--danger); font-size: 13px; }

.shop-box h3 {
  font-family: var(--font-display);
  font-size: 14px;
  margin: 14px 0 4px;
  color: rgba(244,241,230,0.85);
}
.shop-box select {
  width: 100%;
  padding: 8px;
  border-radius: 8px;
  border: 1px solid rgba(232,176,75,0.3);
  background: rgba(0,0,0,0.25);
  color: var(--foam);
  font-family: var(--font-body);
}

@media (max-width: 380px) {
  #gameTitle { font-size: 18px; }
  .stat-chip { font-size: 11px; }
  .btn-cast { padding: 14px 30px; font-size: 16px; }
}

@media (prefers-reduced-motion: reduce) {
  .ripple { animation: none; }
  .reel-card, .modal-box { animation: none; }
}
