import React, { useEffect, useRef, useState } from 'react';

export interface CountryCallingCode {
  iso2: string;
  name: string;
  dialCode: string;
  flag: string;
}

export const COUNTRY_CALLING_CODES: CountryCallingCode[] = [
  { iso2: 'AZ', name: 'Azərbaycan', dialCode: '+994', flag: '🇦🇿' },
  { iso2: 'TR', name: 'Türkiyə', dialCode: '+90', flag: '🇹🇷' },
  { iso2: 'RU', name: 'Rusiya', dialCode: '+7', flag: '🇷🇺' },
  { iso2: 'GE', name: 'Gürcüstan', dialCode: '+995', flag: '🇬🇪' },
  { iso2: 'IR', name: 'İran', dialCode: '+98', flag: '🇮🇷' },
  { iso2: 'US', name: 'ABŞ', dialCode: '+1', flag: '🇺🇸' },
  { iso2: 'GB', name: 'Böyük Britaniya', dialCode: '+44', flag: '🇬🇧' },
  { iso2: 'DE', name: 'Almaniya', dialCode: '+49', flag: '🇩🇪' },
  { iso2: 'FR', name: 'Fransa', dialCode: '+33', flag: '🇫🇷' },
  { iso2: 'UA', name: 'Ukrayna', dialCode: '+380', flag: '🇺🇦' },
  { iso2: 'KZ', name: 'Qazaxıstan', dialCode: '+7', flag: '🇰🇿' },
  { iso2: 'AE', name: 'BƏƏ', dialCode: '+971', flag: '🇦🇪' },
  { iso2: 'SA', name: 'Səudiyyə Ərəbistanı', dialCode: '+966', flag: '🇸🇦' },
  { iso2: 'IT', name: 'İtaliya', dialCode: '+39', flag: '🇮🇹' },
  { iso2: 'NL', name: 'Niderland', dialCode: '+31', flag: '🇳🇱' },
  { iso2: 'PL', name: 'Polşa', dialCode: '+48', flag: '🇵🇱' },
  { iso2: 'CN', name: 'Çin', dialCode: '+86', flag: '🇨🇳' },
  { iso2: 'IN', name: 'Hindistan', dialCode: '+91', flag: '🇮🇳' },
];

export const DEFAULT_COUNTRY_ISO2 = 'AZ';

interface PhoneNumberInputProps {
  countryIso2: string;
  onCountryChange: (iso2: string) => void;
  localNumber: string;
  onLocalNumberChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  selectClassName?: string;
  inputClassName?: string;
}

const PhoneNumberInput: React.FC<PhoneNumberInputProps> = ({
  countryIso2,
  onCountryChange,
  localNumber,
  onLocalNumberChange,
  placeholder,
  required,
  className = '',
  selectClassName = '',
  inputClassName = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const selectedCountry =
    COUNTRY_CALLING_CODES.find((c) => c.iso2 === countryIso2) ||
    COUNTRY_CALLING_CODES.find((c) => c.iso2 === DEFAULT_COUNTRY_ISO2)!;

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className={`flex gap-2 ${className}`}>
      <div ref={wrapperRef} className="relative shrink-0">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className={`flex h-full items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-100 ${selectClassName}`}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <span className="text-base leading-none">{selectedCountry.flag}</span>
          <span>{selectedCountry.dialCode}</span>
          <svg className={`h-3 w-3 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <ul
            role="listbox"
            className="absolute left-0 top-full z-50 mt-2 max-h-64 w-64 overflow-y-auto rounded-xl border border-slate-100 bg-white p-1.5 shadow-2xl shadow-slate-300/30"
          >
            {COUNTRY_CALLING_CODES.map((country) => (
              <li key={country.iso2}>
                <button
                  type="button"
                  role="option"
                  aria-selected={country.iso2 === selectedCountry.iso2}
                  onClick={() => {
                    onCountryChange(country.iso2);
                    setIsOpen(false);
                  }}
                  className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold transition-colors ${
                    country.iso2 === selectedCountry.iso2
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-base leading-none">{country.flag}</span>
                  <span className="flex-1 truncate">{country.name}</span>
                  <span className="text-slate-400">{country.dialCode}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <input
        type="tel"
        required={required}
        value={localNumber}
        onChange={(e) => onLocalNumberChange(e.target.value.replace(/[^\d\s]/g, ''))}
        placeholder={placeholder}
        className={inputClassName}
      />
    </div>
  );
};

export default PhoneNumberInput;
