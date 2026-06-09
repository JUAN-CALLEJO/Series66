// Inline SVG brand-marks for the regulatory bodies referenced by the exam.
// Rendered as vectors (no external files) so they work offline and in the
// single-file build. These identify the standards the content aligns to;
// the app is independent and not affiliated with or endorsed by these bodies.

export function FinraLogo({ height = 26 }) {
  return (
    <svg height={height} viewBox="0 0 132 32" role="img" aria-label="FINRA" fill="none">
      <rect width="132" height="32" rx="6" fill="#0a2540" />
      <text x="12" y="22" fontFamily="Inter, Arial, sans-serif" fontSize="17" fontWeight="800" letterSpacing="1.5" fill="#ffffff">FINRA</text>
      <circle cx="118" cy="16" r="6" fill="#f5a623" />
    </svg>
  );
}

export function NasaaLogo({ height = 26 }) {
  return (
    <svg height={height} viewBox="0 0 140 32" role="img" aria-label="NASAA" fill="none">
      <rect width="140" height="32" rx="6" fill="#0e3b5c" />
      <rect x="10" y="10" width="12" height="12" rx="2" fill="#3aa0ff" />
      <text x="30" y="22" fontFamily="Inter, Arial, sans-serif" fontSize="16" fontWeight="800" letterSpacing="1.2" fill="#ffffff">NASAA</text>
    </svg>
  );
}

export function SecLogo({ height = 26 }) {
  return (
    <svg height={height} viewBox="0 0 150 32" role="img" aria-label="U.S. SEC" fill="none">
      <rect width="150" height="32" rx="6" fill="#13294b" />
      <circle cx="20" cy="16" r="9" fill="none" stroke="#c9a227" strokeWidth="1.5" />
      <text x="20" y="20" textAnchor="middle" fontFamily="Inter, Arial, sans-serif" fontSize="9" fontWeight="800" fill="#c9a227">SEC</text>
      <text x="36" y="14" fontFamily="Inter, Arial, sans-serif" fontSize="8.5" fontWeight="700" letterSpacing="0.3" fill="#ffffff">U.S. SECURITIES &amp;</text>
      <text x="36" y="25" fontFamily="Inter, Arial, sans-serif" fontSize="8.5" fontWeight="700" letterSpacing="0.3" fill="#ffffff">EXCHANGE COMM.</text>
    </svg>
  );
}

export function TrustStrip({ compact = false }) {
  return (
    <div className={`trust-strip${compact ? ' compact' : ''}`}>
      <span className="trust-label">Content aligned to the official standards of</span>
      <div className="trust-logos">
        <NasaaLogo height={compact ? 22 : 26} />
        <FinraLogo height={compact ? 22 : 26} />
        <SecLogo height={compact ? 22 : 26} />
      </div>
      {!compact && (
        <span className="trust-disclaimer">
          Independent study tool. Not affiliated with, authorized, or endorsed by NASAA, FINRA, or the U.S. SEC.
        </span>
      )}
    </div>
  );
}
