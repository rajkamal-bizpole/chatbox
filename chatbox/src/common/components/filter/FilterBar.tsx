import { Search, X } from "lucide-react";
import type  {FilterBarProps} from "../../types/filter.types"

const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onReset,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex flex-col lg:flex-row gap-4 items-center">
        {filters.map(filter => {
          /* -------- Search -------- */
          if (filter.type === "search") {
            return (
              <div key={filter.key} className="flex-1 relative">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  value={filter.value}
                  placeholder={filter.placeholder}
                onChange={e =>
  filter.onChange(e.target.value as any)
}

                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200
                    focus:border-[#e76458] focus:ring-2 focus:ring-[#e76458]/20"
                />
              </div>
            );
          }

          /* -------- Select -------- */
          if (filter.type === "select") {
            return (
              <select
                key={filter.key}
                value={filter.value}
                onChange={e =>
                  filter.onChange(e.target.value)
                }
                className="px-4 py-3 rounded-xl border border-gray-200 bg-white
                  focus:border-[#e76458] focus:ring-2 focus:ring-[#e76458]/20"
              >
                {filter.options?.map(opt => (
                  <option
                    key={opt.value}
                    value={opt.value}
                  >
                    {opt.label}
                  </option>
                ))}
              </select>
            );
          }

          return null;
        })}

        {/* -------- Reset -------- */}
        {onReset && (
          <button
            onClick={onReset}
            className="flex items-center gap-2 px-4 py-3 rounded-xl
              border border-gray-200 text-gray-600 hover:bg-gray-50"
          >
            <X size={16} />
            Reset
          </button>
        )}
      </div>
    </div>
  );
};

export default FilterBar;
