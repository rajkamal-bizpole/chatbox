export interface StatItem {
  key: string;
  label: string;
  value: number;
  icon: React.ReactNode;
  className?: string;
}

export interface StatsBarProps {
  items: StatItem[];
}
