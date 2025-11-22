import React from "react";
import { Input } from "@/components/atoms/input";

type SimpleInputProps = {
  label: string;
  id?: string;
  value: string;
  onChange: (v: string) => void;
  type?: "text" | "email" | "password";
  placeholder?: string;
  name?: string;
};

const SimpleInput: React.FC<SimpleInputProps> = ({
  label,
  id,
  value,
  onChange,
  type = "text",
  placeholder,
  name,
}) => {
  return (
    <label className="block w-full mb-4">
      <div className="text-xs text-gray-300 mb-1">{label}</div>
      <Input
        name={name}
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        type={type}
        placeholder={placeholder}
        className="w-full bg-black/60 text-white placeholder-gray-400 border border-gray-700 rounded-md px-3 py-2"
        autoComplete={type === "email" ? "email" : "current-password"}
      />
    </label>
  );
};

export default SimpleInput;
