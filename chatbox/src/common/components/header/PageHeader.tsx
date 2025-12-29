import React from "react";
import type {PageHeaderProps} from "../../types/header.types"

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  actions,
  rightContent
}) => {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      {/* Left */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-sm text-gray-500">
            {subtitle}
          </p>
        )}
      </div>

      {/* Right */}
         <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {rightContent}
        {actions}
      </div>
    </div>
  );
};

export default PageHeader;
