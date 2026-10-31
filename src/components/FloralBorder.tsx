function CornerOrnament() {
  return (
    <g fill="none" strokeLinejoin="round">
      <path d="M0 42V9H50" stroke="var(--ornament-gold)" strokeWidth="0.8" />
      <g className="banner-knot" transform="translate(25 26)">
        <rect x="-12" y="-12" width="24" height="24" fill="var(--color-base-100)" />
        <path d="M-7-7H7V7H-7ZM0-10 10 0 0 10-10 0Z" stroke="var(--motif-0)" strokeWidth="0.85" />
        <path d="M0-4 4 0 0 4-4 0Z" stroke="var(--ornament-gold)" strokeWidth="0.75" />
      </g>
      <path
        d="m47 26 4-3 4 3-4 3Z"
        fill="var(--color-base-100)"
        stroke="var(--ornament-gold)"
        strokeWidth="0.7"
      />
    </g>
  );
}

export function FloralBorder() {
  return (
    <div className="floral-border" aria-hidden="true" data-motif="album-geometric-frame">
      <svg className="banner-inner" height="48" overflow="visible" focusable="false">
        <g className="banner-artwork">
          <CornerOrnament />
          <svg x="100%" width="72" height="48" overflow="visible">
            <g transform="scale(-1 1)">
              <CornerOrnament />
            </g>
          </svg>
          <svg x="50%" width="1" height="48" overflow="visible">
            <path
              className="banner-center"
              d="M-16 26 0 21 16 26 0 31Z"
              fill="var(--color-base-100)"
              stroke="var(--ornament-gold)"
              strokeWidth="0.65"
            />
          </svg>
        </g>
      </svg>
    </div>
  );
}
