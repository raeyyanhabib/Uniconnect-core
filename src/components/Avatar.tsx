import { C } from '../services/theme';

interface AvatarProps { name?: string; size?: number; }

export default function Avatar({ name, size = 36 }: AvatarProps) {
  const initials = name ? name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "?";
  const colors = [C.cyanDk, "#5B21B6", "#065F46", "#92400E", "#1E40AF", "#831843"];
  const colorIndex = name ? name.charCodeAt(0) % colors.length : 0;
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: colors[colorIndex],
      display: "flex", alignItems: "center", justifyContent: "center",
      fontWeight: 700, fontSize: size * 0.35, color: "#fff", flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}
