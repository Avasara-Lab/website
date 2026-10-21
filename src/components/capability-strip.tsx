const items = [
  "AI Agents",
  "Knowledge Systems",
  "Data Engineering",
  "Product Engineering",
  "AI Infrastructure",
  "Opportunity Intelligence",
];

export function CapabilityStrip() {
  const loop = [...items, ...items];
  return (
    <section className="border-y border-line bg-white" aria-label="Capabilities">
      <div className="marquee py-4">
        <div className="marquee-track px-6">
          {loop.map((item, index) => (
            <span key={`${item}-${index}`} className="font-display text-lg text-navy">
              {item}
              <span className="mx-6 text-cyan" aria-hidden="true">
                ·
              </span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
