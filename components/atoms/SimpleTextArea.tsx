import React from "react";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/atoms/textarea";

type SimpleTextAreaProps = {
  label: string;
  onChange: (v: string) => void;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const SimpleTextArea: React.FC<SimpleTextAreaProps> = ({
  label,
  className,
  ...props
}) => {
  return (
    <label className="block w-full mb-4">
      <div className="text-xs text-gray-600 dark:text-gray-300 mb-1">
        {label}
      </div>

      <Textarea
        {...props}
        className={cn(
          `
          w-full resize-none rounded-md px-3 py-2 text-sm
          border border-gray-300 bg-white text-gray-900 placeholder-gray-400
          shadow-sm transition-colors

          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
          focus-visible:ring-offset-white

          dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500
          dark:focus-visible:ring-offset-gray-900
        `,
          className
        )}
      />
    </label>
  );
};

export default SimpleTextArea;
