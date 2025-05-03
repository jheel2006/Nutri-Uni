import React from "react";

export function MultiSelect({ options, selected, onChange }) {
  const toggleOption = (value) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={(e) => {
            e.preventDefault();
            toggleOption(opt.value);
          }}
          className={`px-3 py-1 rounded-full border text-sm ${
            selected.includes(opt.value)
              ? "bg-[#ebf6f7] border-[#008B9E]"
              : "bg-[#ebf6f7] border-gray-300"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
