import React from 'react';
import { C, cardStyle } from '../services/theme';
import Avatar from './Avatar';
import StarRating from './StarRating';
import Badge from './Badge';
import type {  User  } from '../types';

interface StudentCardProps { student: User; actionEl?: React.ReactNode; }

export default function StudentCard({ student, actionEl }: StudentCardProps) {
  return (
    <div className="cardHover" style={{ ...cardStyle(), display: "flex", gap: 14, alignItems: "flex-start" }}>
      <Avatar name={student.name} size={44} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
          <div>
            <p style={{ fontWeight: 700, fontSize: 15, color: C.tx, margin: 0 }}>{student.name}</p>
            <p style={{ fontSize: 12, color: C.txS, margin: "2px 0 0" }}>{student.department} · Sem {student.semester}</p>
          </div>
          <StarRating rating={student.averageRating} />
        </div>
        <p style={{ fontSize: 13, color: C.txM, margin: "6px 0 10px", lineHeight: 1.5 }}>{student.bio}</p>
        {student.mutualCourses && student.mutualCourses.length > 0 && (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
            {student.mutualCourses.map(c => <Badge key={c} label={c} color={C.purple} />)}
          </div>
        )}
        {actionEl}
      </div>
    </div>
  );
}
