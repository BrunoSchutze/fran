import logoUrl from "../assets/fran-logo.svg";

export default function FranLogo({
  height = 130,            // <- cambiá este valor para hacerlo más grande/alto
  style = {},
  className = ""
}) {
  return (
    <div
      className={className}
      style={{ display: "flex", justifyContent: "center", ...style }}
      aria-label="Fran Analytics"
    >
      <img
        src={logoUrl}
        alt="Fran Analytics"
        style={{ height, width: "auto", display: "block" }}
      />
    </div>
  );
}
