export type FilterOption = {
  label: string;
  value: string;
};

export type FilterConfig<T = string> = {
  key: string;
  type: "search" | "select";
  value: T;
  placeholder?: string;
  options?: FilterOption[];
  onChange: (value: T) => void;
};


 export interface FilterBarProps {
  filters: FilterConfig<any>[];
  onReset?: () => void;
  
}
