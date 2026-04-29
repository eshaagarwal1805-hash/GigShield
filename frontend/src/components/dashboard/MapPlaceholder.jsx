// frontend/src/components/dashboard/MapPlaceholder.jsx
export default function MapPlaceholder({ small = false }) {
  return (
    <div className={`db-map-placeholder ${small ? "db-map-placeholder--small" : ""}`}>
      <svg viewBox="0 0 400 220" xmlns="http://www.w3.org/2000/svg" className="db-map-svg">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <line
            key={`v${i}`}
            x1={i * 50}
            y1="0"
            x2={i * 50}
            y2="220"
            stroke="rgba(42,108,44,0.1)"
            strokeWidth="1"
          />
        ))}
        {[0, 1, 2, 3, 4].map((i) => (
          <line
            key={`h${i}`}
            x1="0"
            y1={i * 55}
            x2="400"
            y2={i * 55}
            stroke="rgba(42,108,44,0.1)"
            strokeWidth="1"
          />
        ))}
        <path
          d="M0,110 Q100,90 200,110 Q300,130 400,110"
          stroke="rgba(42,108,44,0.2)"
          strokeWidth="3"
          fill="none"
        />
        <path
          d="M200,0 Q210,55 200,110 Q190,165 200,220"
          stroke="rgba(42,108,44,0.2)"
          strokeWidth="3"
          fill="none"
        />
        <path
          d="M0,60 Q80,55 160,65 Q240,75 320,60 Q360,55 400,60"
          stroke="rgba(42,108,44,0.12)"
          strokeWidth="2"
          fill="none"
        />
        <path
          d="M0,160 Q100,155 200,165 Q300,175 400,160"
          stroke="rgba(42,108,44,0.12)"
          strokeWidth="2"
          fill="none"
        />
        <path
          d="M80,0 Q85,110 80,220"
          stroke="rgba(42,108,44,0.1)"
          strokeWidth="1.5"
          fill="none"
        />
        <path
          d="M320,0 Q315,110 320,220"
          stroke="rgba(42,108,44,0.1)"
          strokeWidth="1.5"
          fill="none"
        />
        <ellipse cx="200" cy="110" rx="60" ry="40" fill="rgba(42,108,44,0.18)" />
        <ellipse cx="200" cy="110" rx="30" ry="20" fill="rgba(42,108,44,0.25)" />
        <ellipse cx="310" cy="75" rx="35" ry="25" fill="rgba(172,244,164,0.3)" />
        <ellipse cx="95" cy="155" rx="28" ry="20" fill="rgba(168,56,54,0.15)" />
        <ellipse cx="340" cy="165" rx="22" ry="16" fill="rgba(172,244,164,0.2)" />
        <circle cx="200" cy="110" r="8" fill="#2a6c2c" />
        <circle cx="200" cy="110" r="16" fill="rgba(42,108,44,0.2)" />
        <circle cx="200" cy="110" r="26" fill="rgba(42,108,44,0.08)" />
        <circle
          cx="310"
          cy="75"
          r="5"
          fill="#acf4a4"
          stroke="#2a6c2c"
          strokeWidth="1.5"
        />
        <circle
          cx="95"
          cy="155"
          r="5"
          fill="rgba(168,56,54,0.7)"
          stroke="#a83836"
          strokeWidth="1.5"
        />
      </svg>
    </div>
  );
}