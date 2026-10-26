export function PageFallback() {
  return (
    <div className="page" aria-busy="true">
      <p role="status">Loading…</p>
    </div>
  );
}
