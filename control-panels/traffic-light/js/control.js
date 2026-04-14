/**
 * Jericho Traffic Management System — Control Panel JS
 * Handles mode buttons, per-intersection light selection, and API calls.
 */

(function () {
    'use strict';

    // ── Local state ─────────────────────────────────────────────────────────
    // lightState[intersection][direction] = 'red' | 'yellow' | 'green' | 'off'
    const lightState = {};

    // Populate initial state from the DOM
    document.querySelectorAll('.light-circle[data-active="true"]').forEach(el => {
        const { intersection, direction, state } = el.dataset;
        if (!lightState[intersection]) lightState[intersection] = {};
        lightState[intersection][direction] = state;
    });

    // ── Helpers ──────────────────────────────────────────────────────────────

    function updateCirclesForDirection(intersection, direction, state) {
        const circles = document.querySelectorAll(
            `.light-circle[data-intersection="${intersection}"][data-direction="${direction}"]`
        );
        circles.forEach(c => {
            c.classList.remove('inactive', 'active-red', 'active-yellow', 'active-green', 'active-off');
            if (c.dataset.state === state) {
                c.classList.add(`active-${state}`);
                c.dataset.active = 'true';
            } else {
                c.classList.add('inactive');
                c.dataset.active = 'false';
            }
        });
    }

    function updateAllCircles(stateMap) {
        // stateMap: {intersection: {direction: state}}
        Object.entries(stateMap).forEach(([int, dirs]) => {
            Object.entries(dirs).forEach(([dir, state]) => {
                updateCirclesForDirection(int, dir, state);
            });
        });
    }

    function setModeStatus(label, badgeClass) {
        const badge = document.getElementById('mode-badge');
        const modeLabel = document.getElementById('mode-label');
        if (badge) {
            badge.className = `badge ${badgeClass}`;
            badge.textContent = label;
        }
        if (modeLabel) {
            modeLabel.textContent = label;
        }
        updateTimestamp();
    }

    function updateTimestamp() {
        const el = document.getElementById('last-updated');
        if (el) {
            const now = new Date();
            el.textContent = now.toLocaleTimeString();
        }
    }

    function appendLog(message, type = 'info') {
        const panel = document.getElementById('system-log');
        if (!panel) return;
        const line = document.createElement('div');
        line.className = `log-line-${type}`;
        const ts = new Date().toLocaleTimeString();
        line.textContent = `[${ts}] ${message}`;
        panel.appendChild(line);
        panel.scrollTop = panel.scrollHeight;
    }

    async function postApi(payload) {
        try {
            const resp = await fetch('/traffic-light/api.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
            return await resp.json();
        } catch (err) {
            appendLog(`API error: ${err.message}`, 'err');
            return null;
        }
    }

    // ── Mode buttons ─────────────────────────────────────────────────────────

    function bindModeButtons() {
        const btnNormal = document.getElementById('btn-mode-normal');
        const btnBlink  = document.getElementById('btn-mode-blink');
        const btnOff    = document.getElementById('btn-mode-off');

        if (btnNormal) {
            btnNormal.addEventListener('click', async () => {
                appendLog('Requesting mode: NORMAL CYCLE …', 'info');
                const data = await postApi({ action: 'mode', mode: 'normal' });
                if (data) {
                    setModeStatus('NORMAL CYCLE', 'bg-success');
                    // Restore a typical normal-cycle state (all NS=green, EW=red)
                    const allInts = [...new Set(
                        [...document.querySelectorAll('.light-circle')].map(c => c.dataset.intersection)
                    )];
                    const newState = {};
                    allInts.forEach(int => {
                        newState[int] = { NS: 'green', EW: 'red' };
                    });
                    updateAllCircles(newState);
                    appendLog('Mode set: NORMAL CYCLE', 'ok');
                }
            });
        }

        if (btnBlink) {
            btnBlink.addEventListener('click', async () => {
                appendLog('Requesting mode: ALL BLINK RED …', 'info');
                const data = await postApi({ action: 'mode', mode: 'blink_red' });
                if (data) {
                    setModeStatus('ALL BLINK RED', 'bg-danger');
                    const allInts = [...new Set(
                        [...document.querySelectorAll('.light-circle')].map(c => c.dataset.intersection)
                    )];
                    const newState = {};
                    allInts.forEach(int => {
                        newState[int] = { NS: 'red', EW: 'red' };
                    });
                    updateAllCircles(newState);
                    appendLog('Mode set: ALL BLINK RED', 'ok');
                }
            });
        }

        if (btnOff) {
            btnOff.addEventListener('click', async () => {
                appendLog('Requesting mode: ALL LIGHTS OFF …', 'info');
                const data = await postApi({ action: 'mode', mode: 'off' });
                if (data) {
                    setModeStatus('ALL LIGHTS OFF', 'bg-secondary');
                    const allInts = [...new Set(
                        [...document.querySelectorAll('.light-circle')].map(c => c.dataset.intersection)
                    )];
                    const newState = {};
                    allInts.forEach(int => {
                        newState[int] = { NS: 'off', EW: 'off' };
                    });
                    updateAllCircles(newState);
                    appendLog('Mode set: ALL LIGHTS OFF', 'ok');
                }
            });
        }
    }

    // ── Individual light circles ──────────────────────────────────────────────

    function bindLightCircles() {
        document.querySelectorAll('.light-circle[data-state]').forEach(circle => {
            circle.addEventListener('click', () => {
                const { intersection, direction, state } = circle.dataset;
                if (!lightState[intersection]) lightState[intersection] = {};
                // Optimistically update UI
                lightState[intersection][direction] = state;
                updateCirclesForDirection(intersection, direction, state);
            });
        });
    }

    // ── Apply buttons ─────────────────────────────────────────────────────────

    function bindApplyButtons() {
        document.querySelectorAll('.btn-apply-int').forEach(btn => {
            btn.addEventListener('click', async () => {
                const intersection = btn.dataset.intersection;
                const state = lightState[intersection] || {};
                appendLog(`Applying ${intersection} …`, 'info');

                const results = await Promise.all(
                    Object.entries(state).map(([direction, lightVal]) =>
                        postApi({
                            action: 'set_light',
                            intersection,
                            direction,
                            state: lightVal,
                        })
                    )
                );

                if (results.every(r => r !== null)) {
                    appendLog(`${intersection} updated OK`, 'ok');
                } else {
                    appendLog(`${intersection} update failed`, 'err');
                }
            });
        });
    }

    // ── Init ─────────────────────────────────────────────────────────────────

    document.addEventListener('DOMContentLoaded', () => {
        bindModeButtons();
        bindLightCircles();
        bindApplyButtons();
        updateTimestamp();
        appendLog('Control panel initialized. Session authenticated.', 'info');
    });

})();
