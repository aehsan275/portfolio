import { useId } from 'react';

export function GeometryMark({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      aria-hidden="true"
    >
      <path d="m24 3 6 6h9v9l6 6-6 6v9h-9l-6 6-6-6H9v-9l-6-6 6-6V9h9Z" />
      <path d="m24 10 14 14-14 14-14-14Z" />
      <path d="M18 18h12v12H18Z" />
    </svg>
  );
}
export function GeometricBand({
  className = '',
  vertical = false,
}: {
  className?: string;
  vertical?: boolean;
}) {
  const id = useId();
  return (
    <svg className={className} aria-hidden="true">
      <defs>
        <pattern
          id={id}
          width={vertical ? 20 : 40}
          height={vertical ? 40 : 20}
          patternUnits="userSpaceOnUse"
        >
          <g
            transform={vertical ? 'translate(20 0) rotate(90)' : undefined}
            fill="none"
            strokeWidth=".7"
          >
            <path d="M0 0h40v20H0Z" stroke="#84917c" />
            <path
              d="m10 1 3 3h4v4l3 2-3 3v4h-4l-3 3-3-3H3v-4l-3-3 3-2V4h4Zm20 0 3 3h4v4l3 2-3 3v4h-4l-3 3-3-3h-4v-4l-3-3 3-2V4h4Z"
              stroke="#517565"
            />
            <path d="m10 5 5 5-5 5-5-5Zm20 0 5 5-5 5-5-5ZM17 0l6 20M17 20 23 0" stroke="#b06d4e" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

function SkylineMosque() {
  return (
    <g
      className="v-skyline-mosque"
      transform="translate(125 104)"
      stroke="#8b735b"
      strokeWidth="1"
      fill="#ead4b0"
    >
      <path d="M0 216V35h13v181M267 216V35h13v181" />
      <path d="M-4 35h21V24H-4Zm267 0h21V24h-21ZM-2 24q-5-17 8-23 14 6 9 23M265 24q-5-17 8-23 14 6 9 23M6 1v-10m267 10v-10" />
      <path d="M28 216V105h224v111ZM23 105h234M100 105V88h80v17M100 88c-8-32 24-37 40-64 16 27 48 32 40 64ZM140 24V12M52 105c-5-20 11-26 20-40 9 14 25 20 20 40M188 105c-5-20 11-26 20-40 9 14 25 20 20 40" />
      {[45, 91, 137, 183, 229].map((x, i) => (
        <path
          key={x}
          d={`M${x - 13} 216v-65q0-15 13-${i === 2 ? 24 : 17} 13 ${i === 2 ? 9 : 2} 13 ${i === 2 ? 24 : 17}v65Z`}
          fill="#b29c7c"
          fillOpacity=".35"
        />
      ))}
      <path d="M0 192h280M20 216h240M-12 216h304" fill="none" />
    </g>
  );
}
function Minar() {
  return (
    <g
      className="v-minar"
      transform="translate(483 135) scale(.6)"
      stroke="#6d7d6b"
      strokeWidth="1.1"
      fill="#d2ddce"
    >
      <path d="M-49 308q5-51 27-68l8-182h28l8 182q22 17 27 68Z" />
      <path
        d="M-49 308q22-52 49-53 27 1 49 53M-35 308q9-47 35-53 26 6 35 53M-22 240h44M-19 218h38M-18 190h36M-17 161h34M-16 132h32M-15 103h30M-14 75h28"
        fill="none"
      />
      <path d="M-18 58h36v-8h-36ZM-12 50V23h24v27M-12 23q0-16 12-20 12 4 12 20M0 3V-7" />
      <path d="M-7 239 0 58l7 181M-57 308h114M-64 315H64" fill="none" />
      <path d="M-8 45V29M0 45V26M8 45V29" />
    </g>
  );
}
function GardenPavilion() {
  return (
    <g
      className="v-garden-pavilion"
      transform="translate(1055 159)"
      stroke="#68796e"
      strokeWidth="1.4"
      fill="none"
    >
      <path d="M0 151V50h124v101Z" fill="#d6d3b7" />
      <path d="M-8 50h140v-8H-8ZM20 42C16 16 45 14 62-7c17 21 46 23 42 49Z" fill="#b6c7b6" />
      <path d="M62-7v-12m-67 170h134M10 151V67h104v84M22 151V98q0-20 16-30 16 10 16 30v53m16 0V98q0-20 16-30 16 10 16 30v53" />
      <path d="M12 42V20m100 22V20M7 20h10m90 0h10" />
    </g>
  );
}
function TraditionalBalcony({
  x,
  y,
  width,
  green = false,
}: {
  x: number;
  y: number;
  width: number;
  green?: boolean;
}) {
  const wood = green ? '#426858' : '#906b4e';
  const dark = green ? '#2d4d43' : '#674c3e';
  return (
    <g className="v-traditional-balcony" transform={`translate(${x} ${y})`} strokeLinejoin="round">
      <path d={`M-8-13h${width + 16}l7 9H-15Z`} fill={dark} stroke="none" />
      <path d={`M-4-4h${width + 8}v48H-4Z`} fill={wood} stroke={dark} strokeWidth="1" />
      {[0, 1, 2].map((i) => {
        const bay = (width - 12) / 3;
        const left = 6 + i * bay;
        return (
          <g key={i}>
            <path
              d={`M${left} 26V9q0-9 ${bay / 2 - 4}-12 ${bay / 2 - 4} 3 ${bay / 2 - 4} 12v17Z`}
              fill="#c7c5a0"
              stroke={dark}
              strokeWidth="1"
            />
            <path
              d={`M${left + 3} 26V10q0-6 ${bay / 2 - 7}-9 ${bay / 2 - 7} 3 ${bay / 2 - 7} 9v16Z`}
              fill={dark}
              stroke="none"
            />
            <path
              d={`M${left + bay / 2 - 4} 3v23M${left + 3} 15h${bay - 14}`}
              fill="none"
              stroke={wood}
              strokeWidth="1.6"
            />
          </g>
        );
      })}
      <rect
        x="-7"
        y="28"
        width={width + 14}
        height="19"
        fill={wood}
        stroke={dark}
        strokeWidth="1"
      />
      {Array.from({ length: Math.max(4, Math.floor(width / 12)) }, (_, i) => {
        const left = i * (width / Math.max(4, Math.floor(width / 12)));
        return <path key={i} d={`m${left} 30 5 7-5 7-5-7Z`} fill="#d1b68b" stroke="none" />;
      })}
      <path
        d={`M-11 26h${width + 22}v4H-11ZM-13 47h${width + 26}v5H-13Z`}
        fill={dark}
        stroke="none"
      />
      <path d={`M4 52h12v12l-7-4ZM${width - 16} 52h12l-5 8-7 4Z`} fill={wood} stroke="none" />
      <path
        d={`M-8-10h${width + 16}M-9 49h${width + 18}`}
        stroke="#d5bd91"
        strokeWidth="1"
        fill="none"
      />
    </g>
  );
}

function RooftopShop({ x, kind }: { x: number; kind: 'kites' | 'tea' | 'books' }) {
  const wall = kind === 'kites' ? '#dfc58f' : kind === 'tea' ? '#d8b7a1' : '#c4d1bf';
  return (
    <g
      className={'v-rooftop-shop v-shop-' + kind}
      transform={`translate(${x} 210)`}
      stroke="#7f7861"
      strokeWidth=".8"
      fill={wall}
    >
      <path d="M0 0h174v110H0Z" />
      <TraditionalBalcony x={0} y={-30} width={174} green={kind !== 'tea'} />
      <path d="M-5 29h184v10H-5Z" fill="#9bad91" />
      <path d="M12 110V46h150v64" fill="#e8e0c9" />
      <path d="M8 110V45h8v65m142 0V45h8v65" fill="#426c58" stroke="none" />
      {kind === 'books' ? (
        <>
          <path d="M12 78h150M84 46v64M20 52v22m7-22v22m6-22v22m8-22v22m7-22v22m7-22v22m9-22v22m9-22v22M93 52v22m7-22v22m8-22v22m7-22v22m8-22v22m7-22v22m9-22v22m6-22v22M19 84v22m9-22v22m8-22v22m8-22v22m7-22v22m9-22v22m9-22v22m28-22v22m8-22v22m9-22v22m10-22v22m9-22v22m9-22v22" />
        </>
      ) : kind === 'kites' ? (
        <>
          <path d="M12 48h150M87 48v62" />
          {[37, 74, 112, 147].map((v, i) => (
            <g key={v}>
              <path
                d={`M${v} 51v8m0 0-12 14 12 16 12-16Z`}
                fill={['#b75f47', '#799d8c', '#c3a34e', '#839ba9'][i]}
              />
              <path d={`M${v} 59v30`} />
            </g>
          ))}
        </>
      ) : (
        <>
          <path d="M12 91h150v8H12Z" fill="#9b8e70" />
          <path
            d="M28 91V64h24v27M24 64h32l-4-6H28ZM29 71h22M36 58V48m53 43V77h16v14m-16-11h20q8 6-4 7m21 4V77h16v14m0-11h5q7 6-5 7"
            fill="none"
          />
          <path d="M90 71q-5-6 0-12m37 12q-5-6 0-12" opacity=".6" />
        </>
      )}
      <path d="M-5 110h184" />
    </g>
  );
}
const houses = [
  { x: -20, w: 125, h: 100, c: '#dfae82' },
  { x: 100, w: 110, h: 126, c: '#c4d8c6' },
  { x: 360, w: 100, h: 82, c: '#edc4ad' },
  { x: 535, w: 125, h: 145, c: '#e6c475' },
  { x: 630, w: 100, h: 83, c: '#b7cbd0' },
  { x: 865, w: 145, h: 110, c: '#e3ad99' },
  { x: 970, w: 80, h: 135, c: '#dbc790' },
  { x: 1200, w: 130, h: 148, c: '#c8d7c3' },
  { x: 1324, w: 140, h: 100, c: '#e4b4a0' },
  { x: 210, w: 76, h: 90, c: '#d7bd94' },
  { x: 286, w: 70, h: 116, c: '#c1c9b2' },
  { x: 452, w: 78, h: 86, c: '#d6bba7' },
  { x: 738, w: 112, h: 120, c: '#c7b78d' },
  { x: 1090, w: 104, h: 108, c: '#c3cdb9' },
  { x: 1427, w: 88, h: 153, c: '#dbbd91' },
  { x: 1515, w: 82, h: 142, c: '#bed0bf' },
  { x: 1594, w: 106, h: 176, c: '#d7b89c' },
  { x: 1695, w: 70, h: 108, c: '#c2cdd0' },
  { x: 1760, w: 98, h: 152, c: '#dbca96' },
  { x: 1853, w: 76, h: 198, c: '#c7cbb1' },
  { x: 1926, w: 115, h: 126, c: '#dcae98' },
];
const backHouses = [
  { x: -35, w: 100, h: 210, c: '#d0baa0' },
  { x: 72, w: 82, h: 166, c: '#bdc7b6' },
  { x: 326, w: 94, h: 150, c: '#d8c5a5' },
  { x: 562, w: 82, h: 164, c: '#b9c6c0' },
  { x: 770, w: 72, h: 158, c: '#d2b6a3' },
  { x: 1140, w: 78, h: 158, c: '#c8c1a1' },
  { x: 1390, w: 90, h: 200, c: '#c1cbb9' },
  { x: 1484, w: 72, h: 186, c: '#cec0a0' },
  { x: 1642, w: 84, h: 207, c: '#b9c7bc' },
  { x: 1785, w: 76, h: 182, c: '#d3bfa8' },
  { x: 1953, w: 94, h: 204, c: '#c4c8b2' },
];

function Planter({
  x,
  y,
  size = 1,
  hanging = false,
}: {
  x: number;
  y: number;
  size?: number;
  hanging?: boolean;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${size})`} strokeWidth=".8">
      {hanging && <path d="M-14 0 0-40 14 0" fill="none" stroke="#80755b" />}
      <path d="M-15-1h30l-4 20H-10Z" fill="#b87653" stroke="#936344" />
      <path d="M-17-3h34v5h-34Z" fill="#d19a6e" stroke="#936344" />
      {[-1, 1].map((direction) => (
        <g key={direction} transform={`scale(${direction} 1)`} fill="#557c50" stroke="#456946">
          <path d="M0 0Q-2-18 5-32M0-7Q14-23 23-20M1-14Q-13-28-20-23M0-2Q20-9 27-3" fill="none" />
          <path d="M3-20Q-2-35 8-37Q14-28 3-20ZM10-16Q16-30 26-23Q25-13 10-16ZM-6-20Q-21-32-24-20Q-17-13-6-20ZM12-5Q26-15 31-5Q23 3 12-5Z" />
          {hanging && (
            <path
              d="M8-3Q29 10 20 30Q31 23 26 14M21 19q-13-7-12 3t11 8"
              fill="none"
              strokeWidth="2"
            />
          )}
        </g>
      ))}
    </g>
  );
}

export function LahoreSkyline() {
  return (
    <svg
      className="v-rooftops"
      viewBox="0 0 2000 320"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
    >
      <defs>
        <pattern id="rooftop-brick" width="24" height="12" patternUnits="userSpaceOnUse">
          <path
            d="M0 0h24M0 6h24M12 0v6M0 6v6M24 6v6"
            fill="none"
            stroke="#8b604a"
            strokeWidth=".7"
            opacity=".32"
          />
        </pattern>
      </defs>
      <g opacity=".24" fill="#9cae98">
        <path d="M0 320V185h140v40h140V176h140v55h120V194h160v33h110V170h150v54h170v-35h150v42h160v-27h100v116Z" />
        <path d="M1440 320V192h100v28h85v-49h115v41h95v-30h95v28h110v110Z" />
      </g>
      <g className="v-back-street" opacity=".9">
        {backHouses.map((house, i) => (
          <g
            key={house.x}
            className="v-back-house"
            transform={`translate(${house.x} ${320 - house.h})`}
            fill={house.c}
            stroke="#8b816b"
            strokeWidth=".7"
          >
            <path d={`M0 0h${house.w}v${house.h}H0Z`} />
            <path d={`M-4-6h${house.w + 8}v6H-4ZM4 4h${house.w - 8}`} fill="#b5a88c" />
            {[18, 58, 98]
              .filter((y) => y < house.h - 25)
              .map((y) => (
                <g key={y}>
                  <path
                    d={`M14 ${y}h18v24H14ZM${house.w - 32} ${y}h18v24h-18Z`}
                    fill={i % 2 ? '#718c7c' : '#8d9b90'}
                  />
                  <path d={`M23 ${y}v24M${house.w - 23} ${y}v24`} stroke="#c7cdb3" />
                </g>
              ))}
            {i % 2 === 0 && <path d={`M8 ${house.h - 28}h${house.w - 16}v8H8Z`} fill="#a58d70" />}
          </g>
        ))}
      </g>
      <SkylineMosque />
      <Minar />
      {houses.map((r, i) => (
        <g
          key={r.x}
          className="v-rooftop-house"
          transform={`translate(${r.x} ${320 - r.h})`}
          stroke="#716a4c"
          strokeWidth=".8"
          fill={r.c}
        >
          <rect width={r.w} height={r.h} />
          <path
            d={`M0 0h9v${r.h}H0ZM${r.w - 8} 0h8v${r.h}h-8Z`}
            fill="#866c50"
            fillOpacity=".16"
            stroke="none"
          />
          {i % 3 === 0 && (
            <rect
              x="9"
              y="3"
              width={r.w - 17}
              height={r.h - 3}
              fill="url(#rooftop-brick)"
              stroke="none"
            />
          )}
          <path
            d={`M9 9h${r.w - 17}M9 13h${r.w - 17}`}
            fill="none"
            stroke="#f3dfb6"
            strokeWidth="2"
          />
          <path d={`M-4-9h${r.w + 8}V0H-4ZM4-18h12v9h13v-9h12v9h13v-9h12v9h13v-9h12v9h13v-9`} />
          <path
            d={`M22 62V35q0-12 12-19 12 7 12 19v27ZM${r.w - 42} 62V35q0-12 12-19 12 7 12 19v27Z`}
            fill="#8b9d89"
            fillOpacity=".35"
          />
          <g stroke="#466856" fill="#507761">
            <path
              d={`M23 62V36q0-10 11-16 11 6 11 16v26ZM${r.w - 41} 62V36q0-10 11-16 11 6 11 16v26Z`}
            />
            <path
              d={`M34 26v36M${r.w - 30} 26v36M26 42h16M26 48h16M26 54h16M${r.w - 38} 42h16M${r.w - 38} 48h16M${r.w - 38} 54h16`}
              stroke="#93a58a"
              strokeWidth=".7"
            />
          </g>
          <path d={`M16 69h36v5H16ZM${r.w - 48} 69h36v5h-36Z`} fill="#b09877" stroke="none" />
          {r.h > 150 && (
            <g fill="#718879" stroke="#637b68" strokeWidth=".7">
              <rect x="17" y="96" width="20" height="26" />
              <rect x={r.w - 37} y="96" width="20" height="26" />
              <path d={`M27 96v26M${r.w - 27} 96v26`} stroke="#c4cfb5" />
              <path d={`M${r.w / 2 - 13} ${r.h}v-33q13-16 26 0v33Z`} fill="#5c7462" />
            </g>
          )}
          {i % 3 === 1 && <TraditionalBalcony x={12} y={47} width={r.w - 24} green={i % 2 === 0} />}
          {i % 2 === 0 && <Planter x={r.w - 22} y={-12} size={0.65} />}
          {i % 3 === 0 && (
            <>
              <rect x="24" y="-38" width="35" height="28" rx="4" fill="#8c9b8b" />
              <path d="M27-31h29M27-24h29M28-10V0M55-10V0" />
            </>
          )}
          {i % 3 === 1 && <path d={`M${r.w - 21}-9v-40m-16 8h32m-24-7v16m16-16v16`} fill="none" />}
        </g>
      ))}
      <GardenPavilion />
      <RooftopShop x={665} kind="kites" />
      <RooftopShop x={855} kind="tea" />
      <RooftopShop x={1230} kind="books" />
      <RooftopShop x={1465} kind="tea" />
      <RooftopShop x={1770} kind="kites" />
      <g className="v-rooftop-garden">
        <Planter x={213} y={278} size={1.05} hanging />
        <Planter x={434} y={306} size={0.9} />
        <Planter x={658} y={303} size={0.8} />
        <Planter x={1045} y={282} size={1.15} hanging />
        <Planter x={1197} y={305} size={1.1} />
        <Planter x={1414} y={304} size={0.85} />
        <Planter x={1672} y={304} size={0.9} />
        <Planter x={1980} y={303} size={1.05} hanging />
      </g>
      <g fill="none" stroke="#80735c" strokeWidth=".8">
        <path d="M210 191q83 29 150 47M1004 199q103 33 197-27" />
        <path d="m1025 205 2 12 18 3 3-11m10 2-1 17 21 3 3-17" fill="#e7ce9f" stroke="#b6a37f" />
        <path d="m1088 215-1 11 17-1 1-12" fill="#b7c7b0" />
      </g>
      <g
        className="v-rickshaw"
        transform="translate(565 289)"
        stroke="#617461"
        strokeWidth=".8"
        fill="#b7c49d"
      >
        <path d="M0 8h39v18H0ZM5 8V0h25l7 8" />
        <path d="M22 8V0m2 3h6l5 5H24Z" fill="#d4dfcf" />
        <circle cx="8" cy="27" r="4" fill="#6b7664" />
        <circle cx="32" cy="27" r="4" fill="#6b7664" />
      </g>
      <g stroke="#747451" strokeWidth=".75" fill="none">
        <path d="M875 213q40 27 83 0" />
        <path d="M886 219l7 6 7-4m15 3 6 5 5-6" stroke="#ad5c47" strokeWidth="3" />
      </g>
    </svg>
  );
}
