import { C } from '../services/theme';
import Badge from './Badge';

interface StatusBadgeProps { status: string; }

export default function StatusBadge({ status }: StatusBadgeProps) {
  const map: Record<string, { color: string; label: string }> = {
    available: { color: C.green, label: "Available" },
    borrowed: { color: C.amber, label: "Borrowed" },
    paused: { color: C.txM, label: "Paused" },
    pending: { color: C.amber, label: "Pending" },
    approved: { color: C.green, label: "Approved" },
    rejected: { color: C.red, label: "Rejected" },
    active: { color: C.green, label: "Active" },
    blocked: { color: C.red, label: "Blocked" },
    overdue: { color: C.red, label: "Overdue" },
    returned: { color: C.green, label: "Returned" },
    open: { color: C.cyan, label: "Open" },
    resolved: { color: C.green, label: "Resolved" },
    flagged: { color: C.red, label: "Flagged" },
    investigating: { color: C.amber, label: "Investigating" },
    public: { color: C.cyan, label: "Public" },
    private: { color: C.purple, label: "Private" },
  };
  const info = map[status] || { color: C.txM, label: status };
  return <Badge label={info.label} color={info.color} />;
}
