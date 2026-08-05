import React, { useEffect, useMemo, useState } from 'react';
import { AdminPage, type AdminUser } from '../api/adminUsers';
import AdminUnifiedRequests from './AdminUnifiedRequests';
import AdminServiceRequests from './AdminServiceRequests';
import AdminPartnershipRequests from './AdminPartnershipRequests';
import AdminVerificationInquiries from './AdminVerificationInquiries';
import { ContactProvider } from '@/contexts/ContactContext';
import { EmailProvider } from '@/contexts/EmailContext';
import { ServiceProvider } from '@/contexts/ServiceContext';
import { PartnershipProvider } from '@/contexts/PartnershipContext';

type InquiryType = 'contact' | 'service' | 'partnership' | 'verification';

const inquiryOptions: Array<{ value: InquiryType; label: string; page: AdminPage }> = [
  { value: 'contact', label: 'Ümumi müraciətlər', page: AdminPage.Requests },
  { value: 'service', label: 'Xidmət müraciətləri', page: AdminPage.ServiceRequests },
  { value: 'partnership', label: 'Tərəfdaşlıq müraciətləri', page: AdminPage.PartnershipRequests },
  { value: 'verification', label: 'Sənəd müraciətləri', page: AdminPage.Requests }
];

/**
 * A single workspace for every request source.  Each source keeps its own
 * existing API, status transitions and detail view; the type selector only
 * decides which existing workflow is shown.
 */
const AdminInquiries: React.FC<{ adminSession: AdminUser | null; onUnreadCountChange?: (count: number) => void }> = ({ adminSession, onUnreadCountChange }) => {
  const availableOptions = useMemo(() => inquiryOptions.filter((option) =>
    adminSession?.isSuperAdmin || Boolean(adminSession?.allowedPages.includes(option.page))
  ), [adminSession]);
  const [type, setType] = useState<InquiryType>('contact');

  useEffect(() => {
    if (availableOptions.length && !availableOptions.some((option) => option.value === type)) {
      setType(availableOptions[0].value);
    }
  }, [availableOptions, type]);

  if (!adminSession || availableOptions.length === 0) return null;

  return <section className="space-y-5 animate-in fade-in duration-300">
    <div className="flex flex-col gap-3 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Müraciət mərkəzi</p>
        <h2 className="mt-1 text-xl font-black text-slate-900">Müraciətlər</h2>
        <p className="mt-1 text-sm text-slate-500">Bütün müraciətlər bir yerdədir. Növ üzrə filtr edin.</p>
      </div>
      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
        Müraciət növü
        <select value={type} onChange={(event) => setType(event.target.value as InquiryType)} className="mt-1 block w-full min-w-56 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold normal-case tracking-normal text-slate-700 outline-none focus:border-emerald-500">
          {availableOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      </label>
    </div>

    {type === 'contact' && (
      <ContactProvider>
        <EmailProvider>
          <ServiceProvider>
            <PartnershipProvider>
              <AdminUnifiedRequests embedded onUnreadCountChange={onUnreadCountChange} />
            </PartnershipProvider>
          </ServiceProvider>
        </EmailProvider>
      </ContactProvider>
    )}
    {type === 'service' && <ServiceProvider><AdminServiceRequests embedded /></ServiceProvider>}
    {type === 'partnership' && <PartnershipProvider><AdminPartnershipRequests embedded /></PartnershipProvider>}
    {type === 'verification' && <AdminVerificationInquiries embedded />}
  </section>;
};

export default AdminInquiries;
