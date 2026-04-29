// frontend/src/components/common/Icon.jsx
export default function Icon({ name, fill = 0, className = "", style = {} }) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={{
        fontVariationSettings: `'FILL' ${fill}, 'wght' 400, 'GRAD' 0, 'opsz' 24`,
        ...style,
      }}
    >
      {name}
    </span>
  );
}