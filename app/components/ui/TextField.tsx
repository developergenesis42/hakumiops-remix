import type { InputHTMLAttributes } from "react";
import React from "react";

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  name: string;
  label: string;
  type?: string;
  ariaLabel?: string;
  placeholder?: string;
  className?: string;
  required?: boolean;
  variant?: 'light' | 'dark';
}

const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  function TextField(
    {
      id,
      name,
      type = "text",
      required = false,
      placeholder,
      className,
      label,
      variant = 'light',
      ...rest
    },
    ref
  ) {
    const isDark = variant === 'dark';
    
    return (
      <div>
        {label && (
          <label
            htmlFor={id}
            className={`block mb-2 text-sm tracking-wide ${isDark ? 'text-gray-300' : 'text-slate-700'}`}
          >
            {label}{" "}
            {required && (
              <span
                title="This field is required"
                aria-label="required"
                className={isDark ? 'text-cyan-400' : 'text-cyan-600'}
              >
                *
              </span>
            )}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          name={name}
          type={type}
          required={required}
          placeholder={placeholder}
          className={[
            `block w-full rounded-md border p-3 text-sm transition placeholder:font-light focus:outline-none ${
              isDark 
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20' 
                : 'text-slate-700 border-slate-200 focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100'
            }`,
            className,
          ]
            .filter(Boolean)
            .join(" ")}
          {...rest}
        />
      </div>
    );
  }
);

export default TextField;
