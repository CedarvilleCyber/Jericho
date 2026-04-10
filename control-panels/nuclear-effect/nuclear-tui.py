#!/usr/bin/env python3
"""
Nuclear Power Plant Control Panel TUI
Runs on headless Debian (terminal only, no display server required)
Dependencies: pip install rich
"""

import curses
import time
import random
import subprocess
import threading
import sys
from datetime import datetime

# ─────────────────────────────────────────────
#  CONFIGURATION — edit these to fit your setup
# ─────────────────────────────────────────────
SMOKE_COMMAND = "echo '[SMOKE TRIGGER] Activating smoke effect via GPIO/relay'"
# Replace with your actual trigger command, e.g.:
#   "python3 /home/pi/trigger_smoke.py"
#   "gpio write 7 1"
#   "curl http://192.168.1.50/trigger"

# ─────────────────────────────────────────────
#  PLANT STATE
# ─────────────────────────────────────────────
class PlantState:
    def __init__(self):
        self.reactor_temp   = 287.4   # °C
        self.coolant_flow   = 98.2    # %
        self.core_power     = 100.0   # % rated
        self.steam_pressure = 6.89    # MPa
        self.rod_position   = 92      # % withdrawn
        self.turbine_rpm    = 1800    # RPM
        self.grid_output    = 1145    # MWe
        self.containment_p  = 0.10    # kPa (gauge)

        self.scram_active   = False
        self.coolant_alarm  = False
        self.pressure_alarm = False
        self.meltdown_seq   = False
        self.smoke_fired    = False
        self.emergency_mode = False

        self.event_log      = []
        self.tick           = 0
        self.meltdown_step  = 0       # 0–100

    def log(self, msg):
        ts = datetime.now().strftime("%H:%M:%S")
        self.event_log.append(f"[{ts}] {msg}")
        if len(self.event_log) > 100:
            self.event_log.pop(0)

    def tick_normal(self):
        """Gentle random drift during normal operation."""
        self.reactor_temp   += random.uniform(-0.3, 0.3)
        self.coolant_flow   += random.uniform(-0.1, 0.1)
        self.coolant_flow    = max(95.0, min(100.0, self.coolant_flow))
        self.steam_pressure += random.uniform(-0.01, 0.01)
        self.steam_pressure  = max(6.5, min(7.2, self.steam_pressure))
        self.turbine_rpm    += random.randint(-5, 5)
        self.turbine_rpm     = max(1790, min(1810, self.turbine_rpm))
        self.grid_output     = int(self.core_power * 11.45 + random.uniform(-2, 2))

    def tick_meltdown(self):
        """Escalating meltdown sequence."""
        self.meltdown_step += 1
        s = self.meltdown_step

        self.reactor_temp   += random.uniform(8, 18)
        self.coolant_flow   -= random.uniform(0.5, 1.2)
        self.coolant_flow    = max(0, self.coolant_flow)
        self.steam_pressure += random.uniform(0.05, 0.15)
        self.core_power     += random.uniform(0.2, 0.8)
        self.containment_p  += random.uniform(0.5, 2.0)

        if s == 5:
            self.log("⚠  COOLANT FLOW ANOMALY DETECTED")
            self.coolant_alarm = True
        if s == 12:
            self.log("⚠  PRIMARY LOOP PRESSURE RISING")
            self.pressure_alarm = True
        if s == 20:
            self.log("🔴 SCRAM SIGNAL — AUTOMATIC ROD INSERTION")
            self.scram_active = True
            self.rod_position = max(0, self.rod_position - 60)
        if s == 28:
            self.log("🔴 SCRAM FAILURE — RODS DID NOT FULLY INSERT")
        if s == 35:
            self.log("🔴 CORE TEMPERATURE EXCEEDS DESIGN LIMIT (350°C)")
        if s == 45:
            self.log("🔴 COOLANT BOILING — VOID COEFFICIENT POSITIVE")
        if s == 55:
            self.log("🔴 FUEL CLADDING BREACH — RADIATION SPIKE")
            self.emergency_mode = True
        if s == 65:
            self.log("🔴 CONTAINMENT PRESSURE CRITICAL")
        if s == 75:
            self.log("💥 STEAM EXPLOSION — CONTAINMENT BREACHED")
        if s >= 80 and not self.smoke_fired:
            self.log("☢  INITIATING EXTERNAL RELEASE SEQUENCE")
            self.fire_smoke()

    def fire_smoke(self):
        """Execute the physical smoke trigger."""
        self.smoke_fired = True
        self.log("🚨 SMOKE EFFECT TRIGGERED")
        try:
            subprocess.Popen(
                SMOKE_COMMAND,
                shell=True,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL
            )
        except Exception as e:
            self.log(f"   Trigger error: {e}")

# ─────────────────────────────────────────────
#  COLOUR PAIRS  (curses)
# ─────────────────────────────────────────────
C_NORMAL   = 1
C_GREEN    = 2
C_YELLOW   = 3
C_RED      = 4
C_CYAN     = 5
C_WHITE_B  = 6
C_MAGENTA  = 7
C_RED_B    = 8   # bright red (blink candidate)

def init_colors():
    curses.start_color()
    curses.use_default_colors()
    curses.init_pair(C_NORMAL,  curses.COLOR_WHITE,   -1)
    curses.init_pair(C_GREEN,   curses.COLOR_GREEN,   -1)
    curses.init_pair(C_YELLOW,  curses.COLOR_YELLOW,  -1)
    curses.init_pair(C_RED,     curses.COLOR_RED,     -1)
    curses.init_pair(C_CYAN,    curses.COLOR_CYAN,    -1)
    curses.init_pair(C_WHITE_B, curses.COLOR_WHITE,   -1)
    curses.init_pair(C_MAGENTA, curses.COLOR_MAGENTA, -1)
    curses.init_pair(C_RED_B,   curses.COLOR_RED,     curses.COLOR_BLACK)

# ─────────────────────────────────────────────
#  DRAWING HELPERS
# ─────────────────────────────────────────────
def safe_addstr(win, y, x, text, attr=curses.A_NORMAL):
    """addstr that silently ignores out-of-bounds."""
    h, w = win.getmaxyx()
    if y < 0 or y >= h or x < 0:
        return
    if x + len(text) > w:
        text = text[:w - x]
    try:
        win.addstr(y, x, text, attr)
    except curses.error:
        pass

def bar(value, max_val, width=20, warn=80, crit=95):
    """Return (bar_str, colour_pair) for a progress bar."""
    pct = min(value / max_val, 1.0)
    filled = int(pct * width)
    bar_str = "█" * filled + "░" * (width - filled)
    pct100 = pct * 100
    if pct100 >= crit:
        col = C_RED
    elif pct100 >= warn:
        col = C_YELLOW
    else:
        col = C_GREEN
    return bar_str, col

def box(win, y, x, h, w, title="", color=C_CYAN):
    """Draw a simple box with optional title."""
    attr = curses.color_pair(color) | curses.A_BOLD
    # corners & sides
    safe_addstr(win, y,       x,       "┌" + "─"*(w-2) + "┐", attr)
    safe_addstr(win, y+h-1,   x,       "└" + "─"*(w-2) + "┘", attr)
    for row in range(1, h-1):
        safe_addstr(win, y+row, x,       "│", attr)
        safe_addstr(win, y+row, x+w-1,  "│", attr)
    if title:
        t = f" {title} "
        safe_addstr(win, y, x + (w - len(t))//2, t, attr)

# ─────────────────────────────────────────────
#  MAIN DRAW
# ─────────────────────────────────────────────
def draw(stdscr, state: PlantState):
    stdscr.erase()
    H, W = stdscr.getmaxyx()
    now  = datetime.now().strftime("%Y-%m-%d  %H:%M:%S")
    tick = state.tick

    # ── Header ──────────────────────────────────────────────────────────
    header = "▓▓  NORTHFIELD NUCLEAR GENERATING STATION — UNIT 2 CONTROL ROOM  ▓▓"
    hcol = C_RED if state.emergency_mode else C_CYAN
    safe_addstr(stdscr, 0, (W - len(header))//2, header,
                curses.color_pair(hcol) | curses.A_BOLD)
    safe_addstr(stdscr, 1, 2, f"LOCAL TIME: {now}", curses.color_pair(C_NORMAL))

    status_txt = "⚠ EMERGENCY" if state.emergency_mode else ("SCRAM" if state.scram_active else "NORMAL POWER")
    status_col = C_RED if state.emergency_mode else (C_YELLOW if state.scram_active else C_GREEN)
    safe_addstr(stdscr, 1, W-25, f"PLANT STATUS: {status_txt}",
                curses.color_pair(status_col) | curses.A_BOLD)

    # ── Reactor Core Panel ───────────────────────────────────────────────
    box(stdscr, 3, 1, 14, 38, "REACTOR CORE", C_CYAN)

    def metric(row, label, val, unit, warn=80, crit=95, max_val=None, invert=False):
        """Draw one metric line with a bar."""
        mv = max_val if max_val else 100
        pct = (val / mv) * 100
        if invert:
            pct = 100 - pct
        b, bc = bar(pct, 100, width=16, warn=warn, crit=crit)
        line = f"  {label:<18} {val:>7.1f} {unit}"
        safe_addstr(stdscr, row, 2, line, curses.color_pair(C_NORMAL))
        safe_addstr(stdscr, row, 40 - 17, b, curses.color_pair(bc))

    t  = state.reactor_temp
    tc = C_RED if t > 350 else (C_YELLOW if t > 320 else C_GREEN)
    safe_addstr(stdscr, 4,  2, f"  {'Core Temp':<18} {t:>7.1f} °C",
                curses.color_pair(C_NORMAL))
    b2, _ = bar(min(t/450*100, 100), 100, 16, warn=70, crit=85)
    safe_addstr(stdscr, 4, 23, b2, curses.color_pair(tc))

    cf = state.coolant_flow
    cfc = C_RED if cf < 50 else (C_YELLOW if cf < 85 else C_GREEN)
    safe_addstr(stdscr, 5, 2, f"  {'Coolant Flow':<18} {cf:>7.1f}  %",
                curses.color_pair(C_NORMAL))
    b3, _ = bar(cf, 100, 16, warn=20, crit=5)
    safe_addstr(stdscr, 5, 23, b3, curses.color_pair(cfc))

    metric(6,  "Core Power",     state.core_power,     " %",  warn=102, crit=110, max_val=120)
    metric(7,  "Steam Pressure", state.steam_pressure, "MPa", warn=75,  crit=90,  max_val=10)
    metric(8,  "Rod Position",   state.rod_position,   " %",  warn=95,  crit=99)
    metric(9,  "Turbine RPM",    state.turbine_rpm,    "rpm", warn=80,  crit=95,  max_val=2000)
    metric(10, "Grid Output",    state.grid_output,    "MWe", warn=80,  crit=95,  max_val=1400)
    metric(11, "Containment ΔP", state.containment_p,  "kPa", warn=50,  crit=80,  max_val=200)

    # Rod diagram
    rod_drawn = max(0, min(10, int(state.rod_position / 10)))
    safe_addstr(stdscr, 13, 2, "  Control Rods:", curses.color_pair(C_NORMAL))
    rod_str = "▐" * rod_drawn + "░" * (10 - rod_drawn)
    rcol = C_RED if rod_drawn > 9 else (C_YELLOW if rod_drawn > 6 else C_GREEN)
    safe_addstr(stdscr, 13, 18, f"[{rod_str}] {state.rod_position}%",
                curses.color_pair(rcol))

    # ── Alarms Panel ────────────────────────────────────────────────────
    box(stdscr, 3, 40, 14, 38, "ALARM ANNUNCIATOR", C_CYAN)
    alarms = [
        ("HIGH COOLANT TEMP",    state.reactor_temp > 330),
        ("LOW COOLANT FLOW",     state.coolant_alarm),
        ("HIGH STEAM PRESSURE",  state.pressure_alarm),
        ("SCRAM ACTUATED",       state.scram_active),
        ("ROD INSERTION FAIL",   state.scram_active and state.rod_position > 30),
        ("CORE OVERPOWER",       state.core_power > 105),
        ("CONTAINMENT ISOL",     state.containment_p > 50),
        ("RADIATION HIGH",       state.meltdown_step > 50),
        ("FUEL DAMAGE",          state.meltdown_step > 55),
        ("EMERGENCY COOLING",    state.emergency_mode),
        ("SITE EMERGENCY",       state.meltdown_step > 70),
        ("RELEASE INITIATED",    state.smoke_fired),
    ]
    blink = (tick % 2 == 0)
    for i, (name, active) in enumerate(alarms):
        ay = 4 + i
        if active:
            attr = curses.color_pair(C_RED) | curses.A_BOLD | (curses.A_BLINK if blink else 0)
            safe_addstr(stdscr, ay, 42, f"▐ ⚠ {name:<28} ▌", attr)
        else:
            safe_addstr(stdscr, ay, 42, f"▐   {name:<28} ▌",
                        curses.color_pair(C_NORMAL) | curses.A_DIM)

    # ── Meltdown Progress (hidden until triggered) ───────────────────────
    if state.meltdown_seq:
        box(stdscr, 17, 1, 4, 77, "CORE DAMAGE PROGRESSION", C_RED)
        pct = min(state.meltdown_step, 100)
        b_md = "█" * int(pct * 0.73) + "░" * (73 - int(pct * 0.73))
        mcol = C_RED if pct > 60 else (C_YELLOW if pct > 30 else C_GREEN)
        safe_addstr(stdscr, 18, 3, f"  [{b_md}] {pct:3d}%",
                    curses.color_pair(mcol) | curses.A_BOLD)
        phase = "NORMAL" if pct < 20 else ("FUEL DAMAGE" if pct < 50 else
                ("CLADDING BREACH" if pct < 70 else ("MELTDOWN" if pct < 90 else "RELEASE")))
        safe_addstr(stdscr, 19, 3, f"  Phase: {phase}",
                    curses.color_pair(mcol) | curses.A_BOLD)

    # ── Event Log ────────────────────────────────────────────────────────
    log_top = 22 if state.meltdown_seq else 18
    log_h   = H - log_top - 3
    box(stdscr, log_top, 1, log_h + 2, 77, "OPERATOR EVENT LOG", C_CYAN)
    visible = state.event_log[-(log_h):]
    for i, entry in enumerate(visible):
        col = C_RED if "🔴" in entry or "💥" in entry or "☢" in entry or "🚨" in entry \
              else (C_YELLOW if "⚠" in entry else C_NORMAL)
        safe_addstr(stdscr, log_top + 1 + i, 3, entry[:73],
                    curses.color_pair(col))

    # ── Footer / Key Bindings ────────────────────────────────────────────
    keys = "[M] Trigger Meltdown Sequence   [S] Manual Smoke Trigger   [R] Reset   [Q] Quit"
    safe_addstr(stdscr, H-1, (W - len(keys))//2, keys,
                curses.color_pair(C_CYAN) | curses.A_BOLD)

    stdscr.refresh()

# ─────────────────────────────────────────────
#  MAIN LOOP
# ─────────────────────────────────────────────
def main(stdscr):
    curses.curs_set(0)
    stdscr.nodelay(True)
    stdscr.timeout(500)          # refresh every 500 ms
    init_colors()

    state = PlantState()
    state.log("Unit 2 at 100% rated thermal power — all systems nominal")
    state.log("Operator login: trainee@nggs-unit2")

    while True:
        state.tick += 1

        # ── Input ────────────────────────────────────────────────────────
        try:
            key = stdscr.getch()
        except Exception:
            key = -1

        if key in (ord('q'), ord('Q')):
            break

        elif key in (ord('m'), ord('M')) and not state.meltdown_seq:
            state.meltdown_seq = True
            state.log("⚠  MELTDOWN SEQUENCE INITIATED BY OPERATOR")

        elif key in (ord('s'), ord('S')) and not state.smoke_fired:
            state.log("🚨 MANUAL SMOKE TRIGGER ACTIVATED BY OPERATOR")
            state.fire_smoke()

        elif key in (ord('r'), ord('R')):
            state.__init__()
            state.log("System reset by operator.")
            state.log("Unit 2 at 100% rated thermal power — all systems nominal")

        # ── Physics tick ─────────────────────────────────────────────────
        if state.meltdown_seq:
            state.tick_meltdown()
        else:
            state.tick_normal()

        # ── Draw ─────────────────────────────────────────────────────────
        draw(stdscr, state)


if __name__ == "__main__":
    try:
        curses.wrapper(main)
    except KeyboardInterrupt:
        pass
    print("\nControl panel closed.")