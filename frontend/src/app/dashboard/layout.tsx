import type { ReactNode } from 'react';
import DashboardClientLayout from './DashboardClientLayout';

export const instant = false;

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <DashboardClientLayout>{children}</DashboardClientLayout>;
}
