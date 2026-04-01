import { useState, useRef, useEffect, useCallback } from 'react';
import './learning.css';

const GROUPS = [
  {
    label: 'Selectors',
    items: [
      { id: 'nesting', label: 'CSS Nesting' },
      { id: 'has',     label: ':has()' },
      { id: 'scope',   label: '@scope' },
    ],
  },
  {
    label: 'Layout',
    items: [
      { id: 'container', label: 'Container Queries' },
      { id: 'logical',   label: 'Logical Properties' },
    ],
  },
  {
    label: 'Color',
    items: [
      { id: 'colormix', label: 'color-mix()' },
      { id: 'oklch',    label: 'oklch() / oklab()' },
    ],
  },
  {
    label: 'Cascade',
    items: [
      { id: 'layer',    label: '@layer' },
      { id: 'property', label: '@property' },
    ],
  },
  {
    label: 'Typography',
    items: [
      { id: 'textwrap', label: 'text-wrap' },
    ],
  },
];

const ALL_IDS = GROUPS.flatMap(g => g.items.map(i => i.id));

function CodeBlock({ label, children }) {
  return (
    <div className="flex-1 min-w-0">
      <span className="text-[9px] font-bold uppercase tracking-wider text-white/20 mb-1 block">{label}</span>
      <pre className="p-3 rounded-lg bg-white/3 border border-white/6 overflow-x-auto text-[11.5px] leading-[1.6] text-white/50 font-mono h-full">
        <code>{children}</code>
      </pre>
    </div>
  );
}

function Card({ id, title, year, description, children, code, html }) {
  return (
    <section id={id} className="scroll-mt-6">
      <div className="p-5 rounded-xl bg-panel border border-panel-border">
        <div className="flex items-center gap-2.5 mb-1">
          <h2 className="text-[15px] font-bold text-white/90">{title}</h2>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-accent-bg text-accent border border-accent-border">
            {year}
          </span>
        </div>
        <p className="text-[12px] text-white/40 mb-4">{description}</p>
        <div className="mb-3">{children}</div>
        <div className="flex gap-3 mt-3">
          <CodeBlock label="HTML">{html}</CodeBlock>
          <CodeBlock label="CSS">{code}</CodeBlock>
        </div>
      </div>
    </section>
  );
}

function NestingDemo() {
  return (
    <Card
      id="nesting"
      title="CSS Nesting"
      year={2023}
      description="Native nesting with & — just like Sass, zero build step."
      html={`<button class="btn">
  Hover me <span>&rarr;</span>
</button>`}
      code={`.btn {
  border: 2px solid green;
  background: transparent;

  & span {
    transition: transform 0.2s;
  }

  &:hover {
    background: green / 15%;

    & span {
      transform: translateX(4px);
    }
  }

  &:active { scale: 0.96; }
}`}
    >
      <div className="demo-nesting">
        <button>
          Hover me <span>&rarr;</span>
        </button>
      </div>
    </Card>
  );
}

function HasDemo() {
  return (
    <Card
      id="has"
      title=":has() Selector"
      year={2023}
      description="The parent selector CSS never had. Style ancestors based on children."
      html={`<div class="card">
  <label>
    <input type="checkbox" />
    Enable feature
  </label>
  <div class="status">
    Status: check the box above
  </div>
</div>`}
      code={`.card:has(input:checked) {
  border-color: green;
  background: green / 8%;

  & .status {
    background: green / 15%;
    color: green;
  }
}`}
    >
      <div className="demo-has">
        <div className="card">
          <label>
            <input type="checkbox" />
            Enable feature
          </label>
          <div className="status">Status: check the box above</div>
        </div>
      </div>
    </Card>
  );
}

function ContainerDemo() {
  return (
    <Card
      id="container"
      title="Container Queries"
      year={2023}
      description="Respond to parent size, not viewport. Drag the bottom-right corner to resize."
      html={`<div class="sidebar">
  <div class="card">
    <div class="thumb"></div>
    <div class="text">
      Resize me...
    </div>
  </div>
</div>`}
      code={`.sidebar {
  container-type: inline-size;
}

@container (min-width: 340px) {
  .card {
    flex-direction: row;
  }
}`}
    >
      <div className="demo-container">
        <div className="resize-box">
          <div className="inner-card">
            <div className="thumb" />
            <div className="text">
              Resize the dashed container — the layout switches from vertical to horizontal at 340px.
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

function ColorMixDemo() {
  return (
    <Card
      id="colormix"
      title="color-mix()"
      year={2023}
      description="Mix any two colors at any ratio in any color space. Replaces Sass lighten()/darken()."
      html={`<div class="swatch"></div>
<div class="swatch"></div>
<div class="swatch"></div>
<!-- each swatch shows a different
     mix ratio -->`}
      code={`background: color-mix(
  in oklch,
  var(--green) 40%,
  var(--purple)
);`}
    >
      <div className="demo-colormix">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded" style={{ background: 'oklch(70% 0.25 145)' }} />
            <span className="text-[11px] text-white/40">Green</span>
          </div>
          <span className="text-[11px] text-white/20">&harr;</span>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded" style={{ background: 'oklch(60% 0.25 300)' }} />
            <span className="text-[11px] text-white/40">Purple</span>
          </div>
        </div>
        <div className="swatches">
          <div className="swatch" data-pct="0%" />
          <div className="swatch" data-pct="20%" />
          <div className="swatch" data-pct="40%" />
          <div className="swatch" data-pct="50%" />
          <div className="swatch" data-pct="60%" />
          <div className="swatch" data-pct="80%" />
          <div className="swatch" data-pct="100%" />
        </div>
      </div>
    </Card>
  );
}

function LayerDemo() {
  return (
    <Card
      id="layer"
      title="@layer"
      year={2022}
      description="Explicit cascade ordering. Layer order beats specificity — no more !important wars."
      html={`<div class="box">
  I'm blue — @layer override
  wins over @layer base
</div>`}
      code={`@layer base, override;

@layer base {
  .box { background: red; }
}

@layer override {
  .box { background: blue; }
  /* wins — later layer, regardless
     of selector specificity */
}`}
    >
      <div className="demo-layer">
        <div className="box">
          I&apos;m blue — <code className="text-white/70">@layer override</code> wins over <code className="text-white/70">@layer base</code>
        </div>
      </div>
    </Card>
  );
}

function PropertyDemo() {
  return (
    <Card
      id="property"
      title="@property"
      year={2024}
      description="Register custom properties with a type, so the browser can animate them."
      html={`<div class="gradient-box"></div>
<!-- no JS needed — the browser
     animates the custom property
     because @property declares
     its type as <angle> -->`}
      code={`@property --hue {
  syntax: '<angle>';
  inherits: false;
  initial-value: 0deg;
}

.gradient {
  background: linear-gradient(
    135deg,
    oklch(65% 0.2 var(--hue)),
    oklch(70% 0.2 calc(var(--hue) + 60deg))
  );
  animation: hue-rotate 4s linear infinite;
}

@keyframes hue-rotate {
  to { --hue: 360deg; }
}`}
    >
      <div className="demo-property">
        <div className="gradient-box" />
      </div>
    </Card>
  );
}

function TextWrapDemo() {
  return (
    <Card
      id="textwrap"
      title="text-wrap: balance / pretty"
      year={2023}
      description="Browser auto-balances line lengths in headings. No more orphan words."
      html={`<div class="balanced">
  <h3>A very long heading that
      wraps across multiple
      lines evenly</h3>
</div>
<div class="unbalanced">
  <h3>A very long heading that
      wraps across multiple
      lines evenly</h3>
</div>`}
      code={`h1 { text-wrap: balance; }
p  { text-wrap: pretty; }`}
    >
      <div className="demo-textwrap">
        <div className="columns">
          <div className="balanced">
            <span className="tag">text-wrap: balance</span>
            <h3>A very long heading that wraps across multiple lines evenly</h3>
          </div>
          <div className="unbalanced">
            <span className="tag">text-wrap: auto (default)</span>
            <h3>A very long heading that wraps across multiple lines evenly</h3>
          </div>
        </div>
      </div>
    </Card>
  );
}

function OklchDemo() {
  return (
    <Card
      id="oklch"
      title="oklch() / oklab()"
      year={2023}
      description="Perceptually uniform color spaces. Same lightness steps look even — unlike HSL."
      html={`<div class="ramp oklch-ramp">
  <div class="step"></div>
  <div class="step"></div>
  <!-- 7 steps, 30%–90% lightness -->
</div>
<div class="ramp hsl-ramp">
  <div class="step"></div>
  <div class="step"></div>
  <!-- 7 steps, 15%–75% lightness -->
</div>`}
      code={`/* Perceptually uniform steps */
oklch(30% 0.15 250)
oklch(40% 0.15 250)
oklch(50% 0.15 250)
/* ... vs HSL uneven jumps */
hsl(220 60% 15%)
hsl(220 60% 25%)
hsl(220 60% 35%)`}
    >
      <div className="demo-oklch">
        <div className="ramp-label">oklch — even perceptual steps</div>
        <div className="ramp oklch-ramp">
          {Array.from({ length: 7 }, (_, i) => <div key={i} className="step" />)}
        </div>
        <div className="mt-4" />
        <div className="ramp-label">hsl — uneven perceptual jumps</div>
        <div className="ramp hsl-ramp">
          {Array.from({ length: 7 }, (_, i) => <div key={i} className="step" />)}
        </div>
      </div>
    </Card>
  );
}

function LogicalDemo() {
  const [rtl, setRtl] = useState(false);

  return (
    <Card
      id="logical"
      title="Logical Properties"
      year={2022}
      description="margin-inline, padding-block, border-inline-start — works for LTR and RTL automatically."
      html={`<div class="layout" dir="ltr">
  <div class="layout-header">
    Header
  </div>
  <div class="layout-body">
    <div class="layout-item">
      First item
    </div>
  </div>
</div>
<!-- toggle dir="rtl" to flip -->`}
      code={`/* Instead of margin-left / padding-top */
margin-inline: auto;
padding-block: 1rem;
border-inline-start: 2px solid blue;
/* Flips automatically in RTL */`}
    >
      <div className="demo-logical">
        <button
          onClick={() => setRtl(r => !r)}
          className="mb-3 px-3 py-1.5 rounded-md text-[11px] font-semibold bg-white/6 border border-white/8 text-white/50 hover:bg-white/10 hover:text-white/70 cursor-pointer transition-all"
        >
          Toggle direction: <span className="text-accent">{rtl ? 'RTL' : 'LTR'}</span>
        </button>
        <div className="layout" dir={rtl ? 'rtl' : 'ltr'}>
          <div className="layout-header">{rtl ? 'عنوان' : 'Header'}</div>
          <div className="layout-body">
            <div className="layout-item">{rtl ? 'العنصر الأول' : 'First item'}</div>
            <div className="layout-item">{rtl ? 'العنصر الثاني' : 'Second item'}</div>
            <div className="layout-item">{rtl ? 'العنصر الثالث' : 'Third item'}</div>
          </div>
        </div>
      </div>
    </Card>
  );
}

function ScopeDemo() {
  return (
    <Card
      id="scope"
      title="@scope"
      year={2024}
      description="Scoped styles without Shadow DOM. Limited to Chrome/Edge for now."
      html={`<div class="card">
  <p>Inside scope — styled.</p>
  <div class="card-footer">
    <p>Inside exclusion — not
       styled.</p>
  </div>
</div>`}
      code={`@scope (.card) to (.card-footer) {
  p {
    color: teal;
    font-weight: 500;
  }
  /* Matches p inside .card
     but NOT inside .card-footer */
}`}
    >
      <div className="demo-scope">
        <div className="outer-card">
          <p>This paragraph is inside the scope — styled teal.</p>
          <div className="inner-footer">
            <p>This paragraph is inside the exclusion boundary — not styled.</p>
          </div>
        </div>
        <p className="text-[10px] text-white/25 mt-3">
          Chrome/Edge only. Firefox/Safari pending.
        </p>
      </div>
    </Card>
  );
}

const DEMO_MAP = {
  nesting: NestingDemo,
  has: HasDemo,
  container: ContainerDemo,
  colormix: ColorMixDemo,
  layer: LayerDemo,
  property: PropertyDemo,
  textwrap: TextWrapDemo,
  oklch: OklchDemo,
  logical: LogicalDemo,
  scope: ScopeDemo,
};

function useActiveSection(scrollRef) {
  const [active, setActive] = useState(ALL_IDS[0]);

  const update = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;
    const offset = container.scrollTop + 120;
    let current = ALL_IDS[0];
    for (const id of ALL_IDS) {
      const el = document.getElementById(id);
      if (el && el.offsetTop <= offset) current = id;
    }
    setActive(current);
  }, [scrollRef]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    container.addEventListener('scroll', update, { passive: true });
    return () => container.removeEventListener('scroll', update);
  }, [scrollRef, update]);

  return active;
}

export default function LearningTool() {
  const scrollRef = useRef(null);
  const active = useActiveSection(scrollRef);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="fixed inset-0 flex bg-[#0a0c16]">
      <nav className="w-[200px] shrink-0 h-full overflow-y-auto border-r border-white/5 py-6 px-4 flex flex-col gap-5">
        <div className="mb-1">
          <h1 className="text-[13px] font-bold text-white/80">Modern CSS</h1>
          <p className="text-[10px] text-white/25 mt-0.5">Post-2022 features</p>
        </div>
        {GROUPS.map((group) => (
          <div key={group.label}>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-accent/70 mb-1.5 block">
              {group.label}
            </span>
            <div className="flex flex-col">
              {group.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollTo(item.id)}
                  className={`text-left text-[12.5px] py-[5px] px-2 -mx-2 rounded-md cursor-pointer transition-all select-none ${
                    active === item.id
                      ? 'text-white/90 bg-white/6 font-medium'
                      : 'text-white/40 hover:text-white/65 hover:bg-white/3'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <main ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-8 pt-8 pb-20">
          <div className="flex flex-col gap-5">
            {ALL_IDS.map((id) => {
              const Demo = DEMO_MAP[id];
              return <Demo key={id} />;
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
