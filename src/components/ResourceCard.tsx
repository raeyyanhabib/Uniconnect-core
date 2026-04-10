import React from 'react';
import { C, cardStyle } from '../services/theme';
import StatusBadge from './StatusBadge';
import Badge from './Badge';
import type {  Resource  } from '../types';

interface ResourceCardProps { resource: Resource; actionEl?: React.ReactNode; }

export default function ResourceCard({ resource, actionEl }: ResourceCardProps) {
  const catColor: Record<string, string> = { Book: C.cyan, Equipment: C.amber, Notes: C.green };
  const color = catColor[resource.category] || C.txS;
  return (
    <div className="cardHover" style={cardStyle()}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div style={{ flex: 1 }}>
          <p style={{ fontWeight: 700, fontSize: 14, color: C.tx, margin: 0 }}>{resource.title}</p>
          <p style={{ fontSize: 12, color: C.txS, margin: "4px 0" }}>by {resource.ownerName || resource.owner}</p>
        </div>
        <StatusBadge status={resource.status} />
      </div>
      <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
        <Badge label={resource.category} color={color} />
        {resource.condition && <Badge label={`Condition: ${resource.condition}`} color={C.txS} />}
        {resource.maxBorrowDuration && <Badge label={`Max ${resource.maxBorrowDuration}d`} color={C.txM} />}
      </div>
      <p style={{ fontSize: 13, color: C.txM, margin: "0 0 12px", lineHeight: 1.5 }}>{resource.description}</p>
      {actionEl}
    </div>
  );
}
