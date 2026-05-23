"use client";

const INPUT_CLS = "w-full font-outfit text-[17px] font-semibold text-ink bg-paper border border-[1.5px] border-accent rounded-[10px] outline-none transition-all [padding:16px_20px_16px_50px] shadow-[0_0_0_4px_rgba(201,149,43,0.12),0_4px_12px_-4px_var(--shadow)] focus:border-accent-deep focus:shadow-[0_0_0_4px_rgba(138,105,25,0.18),0_4px_12px_-4px_var(--shadow)] placeholder:text-ink-fade placeholder:font-medium";

export default function SearchInput({
  value,
  onChange,
  onKeyDown,
  onFocus,
  onBlur,
  placeholder,
  autoComplete,
  className = "",
  children,
  "aria-expanded": ariaExpanded,
  "aria-controls": ariaControls,
  "aria-activedescendant": ariaActiveDescendant,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  placeholder?: string;
  autoComplete?: string;
  className?: string;
  children?: React.ReactNode;
  "aria-expanded"?: boolean;
  "aria-controls"?: string;
  "aria-activedescendant"?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      <span className="absolute left-[18px] top-1/2 -translate-y-1/2 text-[20px] text-accent-deep pointer-events-none">⚲</span>
      <input
        type="text"
        role="combobox"
        className={INPUT_CLS}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-label={placeholder}
        aria-autocomplete="list"
        aria-expanded={ariaExpanded}
        aria-controls={ariaControls}
        aria-activedescendant={ariaActiveDescendant}
      />
      {children}
    </div>
  );
}
