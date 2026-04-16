import { Star } from 'lucide-react';
import { C } from '../services/theme';

interface StarRatingProps { rating?: number; size?: number; }

export default function StarRating({ rating = 0, size = 14 }: StarRatingProps) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} size={size} fill={i <= Math.round(rating) ? C.amber : "none"} color={i <= Math.round(rating) ? C.amber : C.txM} />
      ))}
      <span style={{ color: C.txS, fontSize: 12, marginLeft: 4 }}>{rating.toFixed(1)}</span>
    </div>
  );
}
