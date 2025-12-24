# Low-End Mobile Performance Profiling & Optimization

## Goals

- Maintain 30+ FPS on low-end devices
- Keep memory usage under 80% of device capacity
- Eliminate visible jank and input lag
- Keep battery drain within acceptable thresholds

## Metrics & Instrumentation

- FPS via `requestAnimationFrame`
- Long tasks (CPU blocking) via `PerformanceObserver('longtask')`
- Memory via `performance.memory` (Chrome-only; optional)
- Battery via `navigator.getBattery()` (optional; may be unavailable)
- Frame time samples (approximate GPU/render cost)

Data is emitted from the iframe to the parent via `postMessage('PERF_METRICS')`. Aggregation is handled in the canvas and can be exported.

## How to Run a Profiling Session

1. Start the app and generate a representative set of screens.
2. Interact with each screen for ~60 seconds:
   - Scroll content; trigger transitions; open/close lists; interact with charts.
3. Export metrics:
   - Open DevTools console and run: `exportPerf()`
   - Save the returned JSON as `perf-session.json`
4. Repeat with different device profiles:
   - Chrome dev tools throttling presets (CPU 6x, network 3G)
   - Real device: Android Go, older iPhones, entry-level devices

## Adaptive Quality

- Detection uses `deviceMemory`, `hardwareConcurrency`, and `connection.effectiveType`
- Low-quality mode:
  - Disables `backdrop-blur` and heavy shadows
  - Removes animations and transitions
  - Applies `content-visibility: auto` to main sections
  - Skips loading remote web fonts (uses system fonts)

## Bottleneck Analysis

- Rendering jank: count of long tasks and average frame time
- Memory spikes: JS heap samples trend
- Network: font loading avoided on low devices; images lazy-rendered by browser
- Background impact: long tasks reset per interval for hotspot detection

## Optimization Techniques Implemented

- Adaptive quality class with CSS overrides
- Conditional font loading to reduce network and layout cost
- Reduced visual effects on low-end devices
- rAF-based FPS measurement, long task observer, memory and battery sampling

## Validation Checklist

- 30+ FPS sustained during interactions (check `fps`)
- Average frame time is stable and within target range (`avgFrameTime`)
- Long task count low; total duration minimal (`longTasks`, `longTaskTotal`)
- Memory usage not approaching limits (`memory.used` vs `memory.limit`)
- Battery drain acceptable on real devices (subject to availability of battery API)

## Report Template

### Before vs After Summary

- Device: {model}
- Network: {profile}
- CPU Throttle: {x}
- FPS: {before} → {after}
- Avg frame time (ms): {before} → {after}
- Long tasks (count / total ms): {before} → {after}
- Memory (used/limit MB): {before} → {after}
- Battery (level change over 10 min): {before} → {after}

### Observations

- {notes on jank hotspots, transitions, areas improved}

### Follow-ups

- {remaining optimizations, component-specific fixes, asset pipeline adjustments}
