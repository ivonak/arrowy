import { useState, useCallback, useRef, useEffect, useLayoutEffect, useMemo } from 'react';
import ArrowyPanel from './ArrowyPanel';
import { CodeModal } from '../../components/Modal';
import { useToast } from '../../components/Toast';
import {
  PARAM_KEYS, PARAM_GROUPS, ANCHOR_POINT_RATIOS,
  computePath, computeArrow, getEndpointAnchorBase, getControlAnchor,
} from './useArrowyRenderer';
import { generateJS, generateMinifiedJS } from './codegen';
import { usePanelCollapsed, PANEL_WIDTH } from '../../components/Panel';

const STORAGE_KEY = 'arrowy_state';

const DEFAULTS = {
  values: {
    min: { loopX:42, loopY:-33, e1X:28, e1Y:-41, e2X:28, e2Y:5, l1X:-64, l1Y:-10, l2X:-54, l2Y:79, exitX:11, exitY:40, x1X:58, x1Y:-47, x2X:80, x2Y:3 },
    max: { loopX:42, loopY:-21, e1X:-14, e1Y:-41, e2X:28, e2Y:5, l1X:-157, l1Y:-18, l2X:-76, l2Y:119, exitX:13, exitY:51, x1X:58, x1Y:-47, x2X:80, x2Y:-20 },
    scroll: { loopX:21, loopY:-30, e1X:-16, e1Y:-29, e2X:27, e2Y:-15, l1X:-73, l1Y:35, l2X:93, l2Y:62, exitX:-7, exitY:-10, x1X:-47, x1Y:-26, x2X:54, x2Y:-29 },
  },
  features: { responsive: true, scroll: true, dots: true, handles: true, endpoints: true },
  theme: 'dark',
  startPos: { x: 0, y: 0 },
  endPos: { x: 0, y: 0 },
  startAnchor: 'cc',
  endAnchor: 'cc',
  breakpoints: { minWidth: 992, growStart: 1280, maxWidth: 1920, scrollStart: 250, scrollHide: 180 },
  gridAnim: { speedA: 4.8, speedB: 5.2, speedC: 5.6, speedD: 6, opacityLow: 0.56, opacityHigh: 1 },
  style: { color1: '#98CB4F', color2: '#41A0AA', strokeWidth: 3, dashLen: 6, dashGap: 6, arrowSize: 18, arrowAngle: 36, arrowColor: '#98CB4F' },
  draw: { duration: 0.7, useGradient: true, color: '#98CB4F', strokeWidth: 3, opacity: 0.4 },
};

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}

function saveState(state) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
}

export default function ArrowyTool() {
  const saved = useMemo(() => loadState(), []);

  const [values, setValues] = useState(() => saved?.values ?? { ...DEFAULTS.values });
  const [activeTab, setActiveTab] = useState(() => saved?.activeTab ?? 'min');
  const [features, setFeatures] = useState(() => ({ ...DEFAULTS.features, ...(saved?.features ?? {}) }));
  const [theme, setTheme] = useState(() => saved?.theme ?? 'dark');
  const [startPos, setStartPos] = useState(() => saved?.startPos ?? { ...DEFAULTS.startPos });
  const [endPos, setEndPos] = useState(() => saved?.endPos ?? { ...DEFAULTS.endPos });
  const [startAnchor, setStartAnchor] = useState(() => saved?.endpointAnchors?.start ?? 'cc');
  const [endAnchor, setEndAnchor] = useState(() => saved?.endpointAnchors?.end ?? 'cc');
  const [breakpoints, setBreakpoints] = useState(() => saved?.breakpoints ?? { ...DEFAULTS.breakpoints });
  const [gridAnim, setGridAnim] = useState(() => saved?.gridAnim ?? { ...DEFAULTS.gridAnim });
  const [style, setStyle] = useState(() => saved?.style ?? { ...DEFAULTS.style });
  const [draw, setDraw] = useState(() => saved?.draw ?? { ...DEFAULTS.draw });
  const [codeModalOpen, setCodeModalOpen] = useState(false);
  const [panelCollapsed, togglePanel] = usePanelCollapsed();
  const [layoutVersion, setLayoutVersion] = useState(0);

  const startElRef = useRef(null);
  const endElRef = useRef(null);
  const mainPathRef = useRef(null);
  const arrowPathRef = useRef(null);
  const dragRef = useRef(null);
  const toast = useToast();

  useLayoutEffect(() => {
    setLayoutVersion(v => v + 1);
    const onResize = () => setLayoutVersion(v => v + 1);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    let raf;
    const start = performance.now();
    const tick = () => {
      setLayoutVersion(v => v + 1);
      if (performance.now() - start < 350) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [panelCollapsed]);

  const saveTimer = useRef(null);
  const debouncedSave = useCallback(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveState({
        values, activeTab, features, theme, startPos, endPos,
        endpointAnchors: { start: startAnchor, end: endAnchor },
        breakpoints, gridAnim, style, draw,
      });
    }, 200);
  }, [values, activeTab, features, theme, startPos, endPos, startAnchor, endAnchor, breakpoints, gridAnim, style, draw]);

  useEffect(() => { debouncedSave(); }, [debouncedSave]);

  const getAnchored = useCallback(() => {
    const sBase = getEndpointAnchorBase('start', startElRef.current, endElRef.current, startAnchor, endAnchor);
    const eBase = getEndpointAnchorBase('end', startElRef.current, endElRef.current, startAnchor, endAnchor);
    return {
      startX: sBase.x + startPos.x,
      startY: sBase.y + startPos.y,
      endX: eBase.x + endPos.x,
      endY: eBase.y + endPos.y,
    };
  }, [startPos, endPos, startAnchor, endAnchor]);

  const curveValues = values[activeTab] || values.min;
  const anchored = getAnchored();
  const pathData = computePath(anchored.startX, anchored.startY, anchored.endX, anchored.endY, curveValues);
  const arrowD = computeArrow(anchored.endX, anchored.endY, pathData.exit2X, pathData.exit2Y, style.arrowSize, style.arrowAngle);

  const tabs = useMemo(() => {
    const t = [];
    if (features.responsive) {
      t.push({ id: 'min', label: `Min (${breakpoints.minWidth}px)` });
      t.push({ id: 'max', label: `Max (${breakpoints.maxWidth}px)` });
    } else {
      t.push({ id: 'min', label: 'Base' });
    }
    if (features.scroll) t.push({ id: 'scroll', label: 'Scroll' });
    return t;
  }, [features.responsive, features.scroll, breakpoints.minWidth, breakpoints.maxWidth]);

  useEffect(() => {
    if (!tabs.find(t => t.id === activeTab)) setActiveTab(tabs[0]?.id || 'min');
  }, [tabs, activeTab]);

  // Mouse dragging
  useEffect(() => {
    const handleMove = (e) => {
      const d = dragRef.current;
      if (!d) return;
      const mx = e.clientX, my = e.clientY;
      if (d.type === 'endpoint') {
        const base = getEndpointAnchorBase(d.key, startElRef.current, endElRef.current, startAnchor, endAnchor);
        const next = { x: Math.round(mx - base.x), y: Math.round(my - base.y) };
        if (d.key === 'start') setStartPos(next);
        else setEndPos(next);
      } else {
        const anchor = getControlAnchor(d.key, anchored.startX, anchored.startY, anchored.endX, anchored.endY, curveValues);
        const nx = Math.round(mx - anchor.x), ny = Math.round(my - anchor.y);
        setValues(prev => ({
          ...prev,
          [activeTab]: { ...prev[activeTab], [d.key + 'X']: nx, [d.key + 'Y']: ny },
        }));
      }
    };
    const handleUp = () => {
      if (dragRef.current) {
        dragRef.current = null;
        document.body.classList.remove('cursor-grabbing');
      }
    };
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleUp);
    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleUp);
    };
  }, [startAnchor, endAnchor, anchored, curveValues, activeTab]);

  const startDrag = useCallback((type, key) => (e) => {
    e.preventDefault();
    dragRef.current = { type, key };
    document.body.classList.add('cursor-grabbing');
  }, []);

  const handleFeatureToggle = useCallback((key) => {
    setFeatures(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const handleReset = useCallback(() => {
    setValues(prev => ({ ...prev, [activeTab]: { ...DEFAULTS.values[activeTab] } }));
    toast?.('Reset to defaults');
  }, [activeTab, toast]);

  const handleCopyValues = useCallback(() => {
    navigator.clipboard.writeText(JSON.stringify(curveValues, null, 2));
    toast?.('Values copied!');
  }, [curveValues, toast]);

  const handlePreviewDraw = useCallback(() => {
    const pathEl = mainPathRef.current;
    const arrowEl = arrowPathRef.current;
    if (!pathEl) return;
    const pathLen = pathEl.getTotalLength();
    if (draw.color && !draw.useGradient) pathEl.setAttribute('stroke', draw.color);
    pathEl.setAttribute('stroke-width', draw.strokeWidth.toString());
    pathEl.style.opacity = draw.opacity.toString();
    if (arrowEl) arrowEl.style.opacity = '0';
    pathEl.style.transition = 'none';
    pathEl.style.strokeDasharray = `${pathLen}`;
    pathEl.style.strokeDashoffset = `${pathLen}`;
    pathEl.getBoundingClientRect();
    pathEl.style.transition = `stroke-dashoffset ${draw.duration}s ease-out`;
    pathEl.style.strokeDashoffset = '0';
    setTimeout(() => {
      pathEl.style.transition = 'none';
      pathEl.setAttribute('stroke', 'url(#lineGradient)');
      pathEl.setAttribute('stroke-width', style.strokeWidth.toString());
      pathEl.style.opacity = '1';
      pathEl.style.strokeDasharray = `${style.dashLen} ${style.dashGap}`;
      pathEl.style.strokeDashoffset = '0';
      if (arrowEl) {
        arrowEl.style.transition = 'opacity 0.3s ease-out';
        arrowEl.style.opacity = '1';
      }
    }, draw.duration * 1000 + 50);
  }, [draw, style]);

  const isLight = theme === 'light';
  const bgClass = isLight
    ? 'bg-gradient-to-br from-[#f4f7ff] via-[#eef3ff] to-[#e7eefb] text-gray-800'
    : 'bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] text-gray-200';

  // Grid animation CSS vars
  const gridAnimStyle = {
    '--grid-speed-a': `${gridAnim.speedA}s`,
    '--grid-speed-b': `${gridAnim.speedB}s`,
    '--grid-speed-c': `${gridAnim.speedC}s`,
    '--grid-speed-d': `${gridAnim.speedD}s`,
    '--grid-opacity-low': gridAnim.opacityLow,
    '--grid-opacity-high': gridAnim.opacityHigh,
    '--grid-opacity-mid': ((gridAnim.opacityLow + gridAnim.opacityHigh) / 2).toFixed(2),
    '--grid-dot-color': isLight ? 'rgba(15,23,42,0.09)' : 'rgba(255,255,255,0.06)',
    '--panel-width': panelCollapsed ? '0px' : '318px',
  };

  return (
    <div className={`h-full w-full min-h-screen overflow-hidden ${bgClass}`} style={gridAnimStyle}>
      {/* Canvas area */}
      <div className="fixed inset-0 z-[1] transition-[right] duration-300" style={{ right: panelCollapsed ? 0 : PANEL_WIDTH }} />

      {/* Anchor demo stage */}
      <div className="fixed z-[2] pointer-events-none" style={{
        left: `calc((100vw - ${panelCollapsed ? 0 : PANEL_WIDTH}px) / 2)`,
        top: '50%',
        transform: 'translate(-50%, -50%)',
        width: 'min(88vw, calc(100vw - 350px), 768px)',
        height: 'min(48vh, 360px)',
      }}>
        <div ref={startElRef} className="absolute rounded-3xl backdrop-blur-lg bg-white/6 border border-white/10 shadow-lg opacity-70"
          style={{ width: 'clamp(80px,12vw,130px)', height: 'clamp(54px,8vw,82px)', right: '8px', top: 'calc(50% + 120px)', transform: 'translateY(-50%)' }} />
        <div ref={endElRef} className="absolute rounded-3xl backdrop-blur-lg bg-white/6 border border-white/10 shadow-lg opacity-70"
          style={{ width: 'clamp(80px,12vw,130px)', height: 'clamp(54px,8vw,82px)', left: '8px', top: 'calc(50% - 220px)', transform: 'translateY(-50%)' }} />
      </div>

      {/* SVG layer */}
      <svg className="fixed inset-0 w-full h-full pointer-events-none z-[5] overflow-visible">
        <defs>
          <linearGradient id="lineGradient" gradientUnits="userSpaceOnUse"
            x1={anchored.endX} y1={anchored.endY} x2={anchored.startX} y2={anchored.startY}>
            <stop offset="0%" stopColor={style.color1} />
            <stop offset="100%" stopColor={style.color2} />
          </linearGradient>
        </defs>

        {/* Handle lines */}
        {features.handles && pathData.controlPoints.filter(p => p.anchor).map((p) => (
          <line key={`hl-${p.key}`} x1={p.anchor.x} y1={p.anchor.y} x2={p.x} y2={p.y}
            stroke={p.color} strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
        ))}

        {/* Main path */}
        <path ref={mainPathRef} d={pathData.pathD} fill="none" stroke="url(#lineGradient)"
          strokeWidth={style.strokeWidth} strokeLinecap="round" strokeLinejoin="round"
          strokeDasharray={`${style.dashLen} ${style.dashGap}`} />

        {/* Arrow */}
        <path ref={arrowPathRef} d={arrowD} fill="none" stroke={style.arrowColor}
          strokeWidth={style.strokeWidth} strokeLinecap="round" strokeLinejoin="round"
          strokeDasharray={`${style.dashLen} ${style.dashGap}`} />

        {/* Endpoint dots */}
        {features.endpoints && (
          <>
            <circle cx={anchored.startX} cy={anchored.startY} r="8" fill="#98CB4F" stroke="#fff" strokeWidth="2"
              style={{ pointerEvents: 'all', cursor: 'grab' }} onMouseDown={startDrag('endpoint', 'start')} />
            <circle cx={anchored.endX} cy={anchored.endY} r="8" fill="#41A0AA" stroke="#fff" strokeWidth="2"
              style={{ pointerEvents: 'all', cursor: 'grab' }} onMouseDown={startDrag('endpoint', 'end')} />
          </>
        )}

        {/* Control point dots */}
        {features.dots && pathData.controlPoints.map((p) => (
          <g key={`cp-${p.key}`}>
            <circle cx={p.x} cy={p.y} r="6" fill={p.color} stroke="#0d0f1a" strokeWidth="1.5"
              style={{ pointerEvents: 'all', cursor: 'grab' }} onMouseDown={startDrag('control', p.key)} />
            <text x={p.x + 10} y={p.y - 10} fontSize="10" fontFamily="-apple-system, sans-serif"
              fontWeight="600" opacity="0.7" fill={p.color} style={{ pointerEvents: 'none' }}>
              {p.name}
            </text>
          </g>
        ))}
      </svg>

      {/* Panel */}
      <ArrowyPanel
        collapsed={panelCollapsed}
        onToggleCollapsed={togglePanel}
        features={{ ...features, theme }}
        onFeatureToggle={handleFeatureToggle}
        onThemeToggle={() => setTheme(t => t === 'light' ? 'dark' : 'light')}
        gridAnim={gridAnim}
        onGridAnimChange={(key, val) => setGridAnim(prev => ({ ...prev, [key]: val }))}
        startAnchor={startAnchor}
        endAnchor={endAnchor}
        onStartAnchorChange={setStartAnchor}
        onEndAnchorChange={setEndAnchor}
        startOffset={startPos}
        endOffset={endPos}
        onStartOffsetChange={setStartPos}
        onEndOffsetChange={setEndPos}
        breakpoints={breakpoints}
        onBreakpointChange={(key, val) => setBreakpoints(prev => ({ ...prev, [key]: val }))}
        activeTab={activeTab}
        tabs={tabs}
        onTabChange={setActiveTab}
        curveValues={curveValues}
        onCurveChange={(key, val) => setValues(prev => ({
          ...prev,
          [activeTab]: { ...prev[activeTab], [key]: val },
        }))}
        style={style}
        onStyleChange={(key, val) => setStyle(prev => ({ ...prev, [key]: val }))}
        draw={draw}
        onDrawChange={(key, val) => setDraw(prev => ({ ...prev, [key]: val }))}
        onReset={handleReset}
        onCopyValues={handleCopyValues}
        onGetCode={() => setCodeModalOpen(true)}
        onPreviewDraw={handlePreviewDraw}
      />

      {/* Code Modal */}
      <CodeModal
        open={codeModalOpen}
        onClose={() => setCodeModalOpen(false)}
        title="Generated Code"
        readableCode={codeModalOpen ? generateReadableJSFromState() : ''}
        minifiedCode={codeModalOpen ? () => generateMinifiedJSFromState() : undefined}
      />
    </div>
  );

  function generateReadableJSFromState() {
    return generateJS({ values, features, breakpoints, style, draw });
  }

  function generateMinifiedJSFromState() {
    return generateMinifiedJS({ values, features, breakpoints, style, draw });
  }
}
