import React, { useEffect, useMemo, useRef, useState } from 'react';
import { getExampleNumber, type CountryCode } from 'libphonenumber-js';
import mobileNumberExamples from 'libphonenumber-js/examples.mobile.json';

export interface CountryCallingCode {
  iso2: string;
  name: string;
  dialCode: string;
}

const getCountryFlag = (iso2: string) => String.fromCodePoint(
  ...iso2.toUpperCase().split('').map((character) => 127397 + character.charCodeAt(0))
);

const CountryFlag = ({ iso2 }: { iso2: string }) => (
  <span aria-hidden="true" className="inline-flex w-5 shrink-0 items-center justify-center text-base leading-none">
    {getCountryFlag(iso2)}
  </span>
);

// A handful of markets get curated Azerbaijani names since they're the most
// commonly selected here; everything else uses its English short name
// (ISO 3166-1) to avoid guessing at translations.
const CURATED_NAMES: Record<string, string> = {
  AZ: 'Azərbaycan',
  TR: 'Türkiyə',
  RU: 'Rusiya',
  GE: 'Gürcüstan',
  IR: 'İran',
  US: 'ABŞ',
  GB: 'Böyük Britaniya',
  DE: 'Almaniya',
  FR: 'Fransa',
  UA: 'Ukrayna',
  KZ: 'Qazaxıstan',
  AE: 'BƏƏ',
  SA: 'Səudiyyə Ərəbistanı',
  IT: 'İtaliya',
  NL: 'Niderland',
  PL: 'Polşa',
  CN: 'Çin',
  IN: 'Hindistan',
};

// (iso2, dial code) pairs covering essentially every ITU-assigned country
// code, sourced from the standard E.164 country calling code table.
const RAW_CODES: [string, string][] = [
  ['AF', '+93'], ['AL', '+355'], ['DZ', '+213'], ['AS', '+1684'], ['AD', '+376'],
  ['AO', '+244'], ['AI', '+1264'], ['AG', '+1268'], ['AR', '+54'], ['AM', '+374'],
  ['AW', '+297'], ['AU', '+61'], ['AT', '+43'], ['AZ', '+994'], ['BS', '+1242'],
  ['BH', '+973'], ['BD', '+880'], ['BB', '+1246'], ['BY', '+375'], ['BE', '+32'],
  ['BZ', '+501'], ['BJ', '+229'], ['BM', '+1441'], ['BT', '+975'], ['BO', '+591'],
  ['BA', '+387'], ['BW', '+267'], ['BR', '+55'], ['IO', '+246'], ['BN', '+673'],
  ['BG', '+359'], ['BF', '+226'], ['BI', '+257'], ['KH', '+855'], ['CM', '+237'],
  ['CA', '+1'], ['CV', '+238'], ['KY', '+1345'], ['CF', '+236'], ['TD', '+235'],
  ['CL', '+56'], ['CN', '+86'], ['CO', '+57'], ['KM', '+269'], ['CG', '+242'],
  ['CD', '+243'], ['CK', '+682'], ['CR', '+506'], ['CI', '+225'], ['HR', '+385'],
  ['CU', '+53'], ['CW', '+599'], ['CY', '+357'], ['CZ', '+420'], ['DK', '+45'],
  ['DJ', '+253'], ['DM', '+1767'], ['DO', '+1809'], ['EC', '+593'], ['EG', '+20'],
  ['SV', '+503'], ['GQ', '+240'], ['ER', '+291'], ['EE', '+372'], ['SZ', '+268'],
  ['ET', '+251'], ['FK', '+500'], ['FO', '+298'], ['FJ', '+679'], ['FI', '+358'],
  ['FR', '+33'], ['GF', '+594'], ['PF', '+689'], ['GA', '+241'], ['GM', '+220'],
  ['GE', '+995'], ['DE', '+49'], ['GH', '+233'], ['GI', '+350'], ['GR', '+30'],
  ['GL', '+299'], ['GD', '+1473'], ['GP', '+590'], ['GU', '+1671'], ['GT', '+502'],
  ['GN', '+224'], ['GW', '+245'], ['GY', '+592'], ['HT', '+509'], ['HN', '+504'],
  ['HK', '+852'], ['HU', '+36'], ['IS', '+354'], ['IN', '+91'], ['ID', '+62'],
  ['IR', '+98'], ['IQ', '+964'], ['IE', '+353'], ['IM', '+44'], ['IL', '+972'],
  ['IT', '+39'], ['JM', '+1876'], ['JP', '+81'], ['JE', '+44'], ['JO', '+962'],
  ['KZ', '+7'], ['KE', '+254'], ['KI', '+686'], ['KP', '+850'], ['KR', '+82'],
  ['KW', '+965'], ['KG', '+996'], ['LA', '+856'], ['LV', '+371'], ['LB', '+961'],
  ['LS', '+266'], ['LR', '+231'], ['LY', '+218'], ['LI', '+423'], ['LT', '+370'],
  ['LU', '+352'], ['MO', '+853'], ['MG', '+261'], ['MW', '+265'], ['MY', '+60'],
  ['MV', '+960'], ['ML', '+223'], ['MT', '+356'], ['MH', '+692'], ['MQ', '+596'],
  ['MR', '+222'], ['MU', '+230'], ['MX', '+52'], ['FM', '+691'], ['MD', '+373'],
  ['MC', '+377'], ['MN', '+976'], ['ME', '+382'], ['MS', '+1664'], ['MA', '+212'],
  ['MZ', '+258'], ['MM', '+95'], ['NA', '+264'], ['NR', '+674'], ['NP', '+977'],
  ['NL', '+31'], ['NC', '+687'], ['NZ', '+64'], ['NI', '+505'], ['NE', '+227'],
  ['NG', '+234'], ['NU', '+683'], ['MK', '+389'], ['NO', '+47'], ['OM', '+968'],
  ['PK', '+92'], ['PW', '+680'], ['PS', '+970'], ['PA', '+507'], ['PG', '+675'],
  ['PY', '+595'], ['PE', '+51'], ['PH', '+63'], ['PL', '+48'], ['PT', '+351'],
  ['PR', '+1787'], ['QA', '+974'], ['RE', '+262'], ['RO', '+40'], ['RU', '+7'],
  ['RW', '+250'], ['WS', '+685'], ['SM', '+378'], ['ST', '+239'], ['SA', '+966'],
  ['SN', '+221'], ['RS', '+381'], ['SC', '+248'], ['SL', '+232'], ['SG', '+65'],
  ['SX', '+1721'], ['SK', '+421'], ['SI', '+386'], ['SB', '+677'], ['SO', '+252'],
  ['ZA', '+27'], ['SS', '+211'], ['ES', '+34'], ['LK', '+94'], ['SD', '+249'],
  ['SR', '+597'], ['SE', '+46'], ['CH', '+41'], ['SY', '+963'], ['TW', '+886'],
  ['TJ', '+992'], ['TZ', '+255'], ['TH', '+66'], ['TL', '+670'], ['TG', '+228'],
  ['TO', '+676'], ['TT', '+1868'], ['TN', '+216'], ['TR', '+90'], ['TM', '+993'],
  ['TC', '+1649'], ['TV', '+688'], ['UG', '+256'], ['UA', '+380'], ['AE', '+971'],
  ['GB', '+44'], ['US', '+1'], ['UY', '+598'], ['UZ', '+998'], ['VU', '+678'],
  ['VA', '+39'], ['VE', '+58'], ['VN', '+84'], ['VG', '+1284'], ['VI', '+1340'],
  ['YE', '+967'], ['ZM', '+260'], ['ZW', '+263'], ['AX', '+358'], ['XK', '+383'],
];

// English short names (ISO 3166-1) for every entry not curated above.
const ENGLISH_NAMES: Record<string, string> = {
  AF: 'Afghanistan', AL: 'Albania', DZ: 'Algeria', AS: 'American Samoa', AD: 'Andorra',
  AO: 'Angola', AI: 'Anguilla', AG: 'Antigua and Barbuda', AR: 'Argentina', AM: 'Armenia',
  AW: 'Aruba', AU: 'Australia', AT: 'Austria', BS: 'Bahamas', BH: 'Bahrain',
  BD: 'Bangladesh', BB: 'Barbados', BY: 'Belarus', BE: 'Belgium', BZ: 'Belize',
  BJ: 'Benin', BM: 'Bermuda', BT: 'Bhutan', BO: 'Bolivia', BA: 'Bosnia and Herzegovina',
  BW: 'Botswana', BR: 'Brazil', IO: 'British Indian Ocean Territory', BN: 'Brunei',
  BG: 'Bulgaria', BF: 'Burkina Faso', BI: 'Burundi', KH: 'Cambodia', CM: 'Cameroon',
  CA: 'Canada', CV: 'Cape Verde', KY: 'Cayman Islands', CF: 'Central African Republic',
  TD: 'Chad', CL: 'Chile', CO: 'Colombia', KM: 'Comoros', CG: 'Congo',
  CD: 'Congo (DRC)', CK: 'Cook Islands', CR: 'Costa Rica', CI: "Cote d'Ivoire",
  HR: 'Croatia', CU: 'Cuba', CW: 'Curacao', CY: 'Cyprus', CZ: 'Czechia',
  DK: 'Denmark', DJ: 'Djibouti', DM: 'Dominica', DO: 'Dominican Republic',
  EC: 'Ecuador', EG: 'Egypt', SV: 'El Salvador', GQ: 'Equatorial Guinea',
  ER: 'Eritrea', EE: 'Estonia', SZ: 'Eswatini', ET: 'Ethiopia',
  FK: 'Falkland Islands', FO: 'Faroe Islands', FJ: 'Fiji', FI: 'Finland',
  GF: 'French Guiana', PF: 'French Polynesia', GA: 'Gabon', GM: 'Gambia',
  GH: 'Ghana', GI: 'Gibraltar', GR: 'Greece', GL: 'Greenland', GD: 'Grenada',
  GP: 'Guadeloupe', GU: 'Guam', GT: 'Guatemala', GN: 'Guinea', GW: 'Guinea-Bissau',
  GY: 'Guyana', HT: 'Haiti', HN: 'Honduras', HK: 'Hong Kong', HU: 'Hungary',
  IS: 'Iceland', ID: 'Indonesia', IQ: 'Iraq', IE: 'Ireland', IM: 'Isle of Man',
  IL: 'Israel', JM: 'Jamaica', JP: 'Japan', JE: 'Jersey', JO: 'Jordan',
  KE: 'Kenya', KI: 'Kiribati', KP: 'North Korea', KR: 'South Korea', KW: 'Kuwait',
  KG: 'Kyrgyzstan', LA: 'Laos', LV: 'Latvia', LB: 'Lebanon', LS: 'Lesotho',
  LR: 'Liberia', LY: 'Libya', LI: 'Liechtenstein', LT: 'Lithuania', LU: 'Luxembourg',
  MO: 'Macao', MG: 'Madagascar', MW: 'Malawi', MY: 'Malaysia', MV: 'Maldives',
  ML: 'Mali', MT: 'Malta', MH: 'Marshall Islands', MQ: 'Martinique',
  MR: 'Mauritania', MU: 'Mauritius', MX: 'Mexico', FM: 'Micronesia',
  MD: 'Moldova', MC: 'Monaco', MN: 'Mongolia', ME: 'Montenegro', MS: 'Montserrat',
  MA: 'Morocco', MZ: 'Mozambique', MM: 'Myanmar', NA: 'Namibia', NR: 'Nauru',
  NP: 'Nepal', NC: 'New Caledonia', NZ: 'New Zealand', NI: 'Nicaragua',
  NE: 'Niger', NG: 'Nigeria', NU: 'Niue', MK: 'North Macedonia', NO: 'Norway',
  OM: 'Oman', PK: 'Pakistan', PW: 'Palau', PS: 'Palestine', PA: 'Panama',
  PG: 'Papua New Guinea', PY: 'Paraguay', PE: 'Peru', PH: 'Philippines',
  PT: 'Portugal', PR: 'Puerto Rico', QA: 'Qatar', RE: 'Reunion', RO: 'Romania',
  RW: 'Rwanda', WS: 'Samoa', SM: 'San Marino', ST: 'Sao Tome and Principe',
  SN: 'Senegal', RS: 'Serbia', SC: 'Seychelles', SL: 'Sierra Leone', SG: 'Singapore',
  SX: 'Sint Maarten', SK: 'Slovakia', SI: 'Slovenia', SB: 'Solomon Islands',
  SO: 'Somalia', ZA: 'South Africa', SS: 'South Sudan', ES: 'Spain',
  LK: 'Sri Lanka', SD: 'Sudan', SR: 'Suriname', SE: 'Sweden', CH: 'Switzerland',
  SY: 'Syria', TW: 'Taiwan', TJ: 'Tajikistan', TZ: 'Tanzania', TH: 'Thailand',
  TL: 'Timor-Leste', TG: 'Togo', TO: 'Tonga', TT: 'Trinidad and Tobago',
  TN: 'Tunisia', TM: 'Turkmenistan', TC: 'Turks and Caicos Islands', TV: 'Tuvalu',
  UG: 'Uganda', UY: 'Uruguay', UZ: 'Uzbekistan', VU: 'Vanuatu', VA: 'Vatican City',
  VE: 'Venezuela', VN: 'Vietnam', VG: 'British Virgin Islands', VI: 'U.S. Virgin Islands',
  YE: 'Yemen', ZM: 'Zambia', ZW: 'Zimbabwe', AX: 'Aland Islands', XK: 'Kosovo',
};

export const COUNTRY_CALLING_CODES: CountryCallingCode[] = RAW_CODES.map(([iso2, dialCode]) => ({
  iso2,
  dialCode,
  name: CURATED_NAMES[iso2] || ENGLISH_NAMES[iso2] || iso2,
}));

export const DEFAULT_COUNTRY_ISO2 = 'AZ';

const PREFERRED_ISO2 = ['AZ', 'TR', 'RU', 'GE', 'US', 'GB'];

const getLocalNumberExample = (country: CountryCallingCode) => {
  if (country.iso2 === 'AZ') return '50 123 45 67';

  const example = getExampleNumber(country.iso2 as CountryCode, mobileNumberExamples);
  if (!example) return '';

  const internationalExample = example.formatInternational();
  const dialCodeDigits = country.dialCode.replace(/\D/g, '');
  const internationalDigits = internationalExample.replace(/\D/g, '');
  if (!internationalDigits.startsWith(dialCodeDigits)) return example.nationalNumber;

  let removedDigits = 0;
  let localNumberStart = 0;
  while (localNumberStart < internationalExample.length && removedDigits < dialCodeDigits.length) {
    if (/\d/.test(internationalExample[localNumberStart])) removedDigits += 1;
    localNumberStart += 1;
  }

  return internationalExample.slice(localNumberStart).trim();
};

interface PhoneNumberInputProps {
  countryIso2: string;
  onCountryChange: (iso2: string) => void;
  localNumber: string;
  onLocalNumberChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  containerClassName?: string;
  inputClassName?: string;
}

const PhoneNumberInput: React.FC<PhoneNumberInputProps> = ({
  countryIso2,
  onCountryChange,
  localNumber,
  onLocalNumberChange,
  placeholder = '50 123 45 67',
  required,
  className = '',
  containerClassName = '',
  inputClassName = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const selectedCountry =
    COUNTRY_CALLING_CODES.find((c) => c.iso2 === countryIso2) ||
    COUNTRY_CALLING_CODES.find((c) => c.iso2 === DEFAULT_COUNTRY_ISO2)!;
  const countryPlaceholder = useMemo(
    () => getLocalNumberExample(selectedCountry) || placeholder,
    [selectedCountry.iso2, selectedCountry.dialCode, placeholder]
  );

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

  const { preferred, rest } = useMemo(() => {
    const preferredList = PREFERRED_ISO2
      .map((iso2) => COUNTRY_CALLING_CODES.find((c) => c.iso2 === iso2))
      .filter((c): c is CountryCallingCode => Boolean(c));
    const restList = COUNTRY_CALLING_CODES
      .filter((c) => !PREFERRED_ISO2.includes(c.iso2))
      .sort((a, b) => a.name.localeCompare(b.name));

    return { preferred: preferredList, rest: restList };
  }, []);

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <div
        className={`flex items-stretch overflow-hidden rounded-xl border transition-colors focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10 ${containerClassName || 'border-slate-200 bg-white'}`}
      >
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex shrink-0 items-center gap-1.5 border-r border-slate-200 px-3 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <CountryFlag iso2={selectedCountry.iso2} />
          <span>{selectedCountry.dialCode}</span>
          <svg className={`h-3 w-3 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <input
          type="tel"
          required={required}
          value={localNumber}
          onChange={(e) => onLocalNumberChange(e.target.value.replace(/[^\d\s]/g, ''))}
          placeholder={countryPlaceholder}
          className={`min-w-0 flex-1 bg-transparent outline-none ${inputClassName}`}
        />
      </div>

      {isOpen && (
        <div
          role="listbox"
          className="absolute left-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-xl border border-slate-100 bg-white shadow-2xl shadow-slate-300/30"
        >
          <div className="max-h-64 overflow-y-auto p-1.5">
            {preferred.map((country) => (
              <CountryOption key={country.iso2} country={country} selected={country.iso2 === selectedCountry.iso2} onSelect={() => { onCountryChange(country.iso2); setIsOpen(false); }} />
            ))}

            {preferred.length > 0 && rest.length > 0 && <div className="my-1 border-t border-slate-100" />}

            {rest.map((country) => (
              <CountryOption key={country.iso2} country={country} selected={country.iso2 === selectedCountry.iso2} onSelect={() => { onCountryChange(country.iso2); setIsOpen(false); }} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const CountryOption = ({ country, selected, onSelect }: { country: CountryCallingCode; selected: boolean; onSelect: () => void }) => (
  <button
    type="button"
    role="option"
    aria-selected={selected}
    onClick={onSelect}
    className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold transition-colors ${
      selected ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50'
    }`}
  >
    <CountryFlag iso2={country.iso2} />
    <span className="flex-1 truncate">{country.name}</span>
    <span className="text-slate-400">{country.dialCode}</span>
  </button>
);

export default PhoneNumberInput;
