import React from 'react';
import {
  Globe,
  FileText,
  Wifi,
  Phone,
  Mail,
  MessageSquare,
  MessageCircle,
  Contact,
  MapPin,
  Calendar,
  Lock,
  EyeOff,
  Building,
  Briefcase,
} from 'lucide-react';
import {
  CalendarForm,
  EmailForm,
  LocationForm,
  QRCategory,
  SmsForm,
  VCardForm,
  WhatsAppForm,
  WifiForm,
} from '../types';

interface CategoryFormsProps {
  category: QRCategory;
  urlValue: string;
  onUrlChange: (val: string) => void;
  textValue: string;
  onTextChange: (val: string) => void;
  wifiForm: WifiForm;
  onWifiChange: (val: WifiForm) => void;
  phoneValue: string;
  onPhoneChange: (val: string) => void;
  emailForm: EmailForm;
  onEmailChange: (val: EmailForm) => void;
  smsForm: SmsForm;
  onSmsChange: (val: SmsForm) => void;
  whatsAppForm: WhatsAppForm;
  onWhatsAppChange: (val: WhatsAppForm) => void;
  vCardForm: VCardForm;
  onVCardChange: (val: VCardForm) => void;
  locationForm: LocationForm;
  onLocationChange: (val: LocationForm) => void;
  calendarForm: CalendarForm;
  onCalendarChange: (val: CalendarForm) => void;
  theme: 'dark' | 'light';
}

export const CategoryForms: React.FC<CategoryFormsProps> = ({
  category,
  urlValue,
  onUrlChange,
  textValue,
  onTextChange,
  wifiForm,
  onWifiChange,
  phoneValue,
  onPhoneChange,
  emailForm,
  onEmailChange,
  smsForm,
  onSmsChange,
  whatsAppForm,
  onWhatsAppChange,
  vCardForm,
  onVCardChange,
  locationForm,
  onLocationChange,
  calendarForm,
  onCalendarChange,
  theme,
}) => {
  const inputClass = `w-full px-3.5 py-2.5 rounded-xl text-sm transition outline-none ${
    theme === 'dark'
      ? 'bg-slate-900/80 border border-slate-700/70 text-slate-100 placeholder-slate-500 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30'
      : 'bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600/30'
  }`;

  const labelClass = `block text-xs font-semibold uppercase tracking-wider mb-1.5 ${
    theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
  }`;

  return (
    <div className="space-y-4">
      {/* 1. URL */}
      {category === 'url' && (
        <div className="space-y-2">
          <label htmlFor="input-url" className={labelClass}>
            Website URL
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Globe className="w-4 h-4 text-cyan-400" />
            </div>
            <input
              id="input-url"
              type="url"
              value={urlValue}
              onChange={(e) => onUrlChange(e.target.value)}
              placeholder="https://example.com"
              className={`${inputClass} pl-10`}
              autoFocus
            />
          </div>
          <p className="text-xs text-slate-500">
            Enter a web address. Readers will open this link directly in their browser.
          </p>
        </div>
      )}

      {/* 2. Plain Text */}
      {category === 'text' && (
        <div className="space-y-2">
          <label htmlFor="input-text" className={labelClass}>
            Plain Text Content
          </label>
          <div className="relative">
            <textarea
              id="input-text"
              rows={4}
              value={textValue}
              onChange={(e) => onTextChange(e.target.value)}
              placeholder="Type or paste any text, notes, or instructions here..."
              className={inputClass}
              autoFocus
            />
          </div>
          <div className="flex justify-between items-center text-xs text-slate-500">
            <span>Standard ASCII or UTF-8 text</span>
            <span>{textValue.length} characters</span>
          </div>
        </div>
      )}

      {/* 3. Wi-Fi */}
      {category === 'wifi' && (
        <div className="space-y-3.5">
          <div>
            <label htmlFor="wifi-ssid" className={labelClass}>
              Network Name (SSID)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Wifi className="w-4 h-4 text-cyan-400" />
              </div>
              <input
                id="wifi-ssid"
                type="text"
                value={wifiForm.ssid}
                onChange={(e) => onWifiChange({ ...wifiForm, ssid: e.target.value })}
                placeholder="My Home Wi-Fi"
                className={`${inputClass} pl-10`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="wifi-password" className={labelClass}>
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4 text-cyan-400" />
                </div>
                <input
                  id="wifi-password"
                  type="text"
                  value={wifiForm.password}
                  onChange={(e) => onWifiChange({ ...wifiForm, password: e.target.value })}
                  placeholder="Network password"
                  disabled={wifiForm.encryption === 'nopass'}
                  className={`${inputClass} pl-10 disabled:opacity-50`}
                />
              </div>
            </div>

            <div>
              <label htmlFor="wifi-encryption" className={labelClass}>
                Security Type
              </label>
              <select
                id="wifi-encryption"
                value={wifiForm.encryption}
                onChange={(e) =>
                  onWifiChange({
                    ...wifiForm,
                    encryption: e.target.value as 'WPA' | 'WEP' | 'nopass',
                  })
                }
                className={inputClass}
              >
                <option value="WPA">WPA / WPA2 / WPA3</option>
                <option value="WEP">WEP</option>
                <option value="nopass">None (Open Network)</option>
              </select>
            </div>
          </div>

          <label className="flex items-center gap-2 text-xs font-medium cursor-pointer select-none text-slate-300">
            <input
              id="wifi-hidden"
              type="checkbox"
              checked={wifiForm.hidden}
              onChange={(e) => onWifiChange({ ...wifiForm, hidden: e.target.checked })}
              className="rounded border-slate-700 text-cyan-500 focus:ring-cyan-400/40 w-4 h-4"
            />
            <span className="flex items-center gap-1.5">
              <EyeOff className="w-3.5 h-3.5 text-slate-400" />
              Hidden network (SSID is not broadcasted)
            </span>
          </label>
        </div>
      )}

      {/* 4. Phone */}
      {category === 'phone' && (
        <div className="space-y-2">
          <label htmlFor="input-phone" className={labelClass}>
            Phone Number
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Phone className="w-4 h-4 text-cyan-400" />
            </div>
            <input
              id="input-phone"
              type="tel"
              value={phoneValue}
              onChange={(e) => onPhoneChange(e.target.value)}
              placeholder="+1 (555) 019-2834"
              className={`${inputClass} pl-10`}
            />
          </div>
          <p className="text-xs text-slate-500">
            Include country code for international compatibility (e.g. +1, +44, +91).
          </p>
        </div>
      )}

      {/* 5. Email */}
      {category === 'email' && (
        <div className="space-y-3">
          <div>
            <label htmlFor="email-address" className={labelClass}>
              Recipient Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4 text-cyan-400" />
              </div>
              <input
                id="email-address"
                type="email"
                value={emailForm.email}
                onChange={(e) => onEmailChange({ ...emailForm, email: e.target.value })}
                placeholder="contact@company.com"
                className={`${inputClass} pl-10`}
              />
            </div>
          </div>

          <div>
            <label htmlFor="email-subject" className={labelClass}>
              Subject Line
            </label>
            <input
              id="email-subject"
              type="text"
              value={emailForm.subject}
              onChange={(e) => onEmailChange({ ...emailForm, subject: e.target.value })}
              placeholder="Inquiry regarding services"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="email-body" className={labelClass}>
              Message Body (Optional)
            </label>
            <textarea
              id="email-body"
              rows={2}
              value={emailForm.body}
              onChange={(e) => onEmailChange({ ...emailForm, body: e.target.value })}
              placeholder="Hello, I would like to get in touch..."
              className={inputClass}
            />
          </div>
        </div>
      )}

      {/* 6. SMS */}
      {category === 'sms' && (
        <div className="space-y-3">
          <div>
            <label htmlFor="sms-phone" className={labelClass}>
              Recipient Phone Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <MessageSquare className="w-4 h-4 text-cyan-400" />
              </div>
              <input
                id="sms-phone"
                type="tel"
                value={smsForm.phone}
                onChange={(e) => onSmsChange({ ...smsForm, phone: e.target.value })}
                placeholder="+1 (555) 019-2834"
                className={`${inputClass} pl-10`}
              />
            </div>
          </div>

          <div>
            <label htmlFor="sms-message" className={labelClass}>
              Pre-filled Message
            </label>
            <textarea
              id="sms-message"
              rows={2}
              value={smsForm.message}
              onChange={(e) => onSmsChange({ ...smsForm, message: e.target.value })}
              placeholder="Hi! I am scanning your QR code to connect."
              className={inputClass}
            />
          </div>
        </div>
      )}

      {/* 7. WhatsApp */}
      {category === 'whatsapp' && (
        <div className="space-y-3">
          <div>
            <label htmlFor="wa-phone" className={labelClass}>
              WhatsApp Phone Number (with Country Code)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-400">
                <MessageCircle className="w-4 h-4 text-emerald-400" />
              </div>
              <input
                id="wa-phone"
                type="tel"
                value={whatsAppForm.phone}
                onChange={(e) => onWhatsAppChange({ ...whatsAppForm, phone: e.target.value })}
                placeholder="+1234567890"
                className={`${inputClass} pl-10`}
              />
            </div>
          </div>

          <div>
            <label htmlFor="wa-message" className={labelClass}>
              Pre-filled Message (Optional)
            </label>
            <textarea
              id="wa-message"
              rows={2}
              value={whatsAppForm.message}
              onChange={(e) => onWhatsAppChange({ ...whatsAppForm, message: e.target.value })}
              placeholder="Hello! Let's chat on WhatsApp."
              className={inputClass}
            />
          </div>
        </div>
      )}

      {/* 8. Contact / vCard */}
      {category === 'vcard' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="vcard-name" className={labelClass}>
                Full Name *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Contact className="w-4 h-4 text-cyan-400" />
                </div>
                <input
                  id="vcard-name"
                  type="text"
                  value={vCardForm.name}
                  onChange={(e) => onVCardChange({ ...vCardForm, name: e.target.value })}
                  placeholder="Arpan Goswami"
                  className={`${inputClass} pl-10`}
                />
              </div>
            </div>

            <div>
              <label htmlFor="vcard-phone" className={labelClass}>
                Phone Number
              </label>
              <input
                id="vcard-phone"
                type="tel"
                value={vCardForm.phone}
                onChange={(e) => onVCardChange({ ...vCardForm, phone: e.target.value })}
                placeholder="+1 555-0199"
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="vcard-email" className={labelClass}>
                Email Address
              </label>
              <input
                id="vcard-email"
                type="email"
                value={vCardForm.email}
                onChange={(e) => onVCardChange({ ...vCardForm, email: e.target.value })}
                placeholder="arpan@example.com"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="vcard-website" className={labelClass}>
                Website
              </label>
              <input
                id="vcard-website"
                type="text"
                value={vCardForm.website}
                onChange={(e) => onVCardChange({ ...vCardForm, website: e.target.value })}
                placeholder="https://arpangoswami.dev"
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="vcard-org" className={labelClass}>
                Organization / Company
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Building className="w-4 h-4 text-slate-400" />
                </div>
                <input
                  id="vcard-org"
                  type="text"
                  value={vCardForm.organization}
                  onChange={(e) => onVCardChange({ ...vCardForm, organization: e.target.value })}
                  placeholder="NOVA Innovations"
                  className={`${inputClass} pl-10`}
                />
              </div>
            </div>

            <div>
              <label htmlFor="vcard-title" className={labelClass}>
                Job Title
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Briefcase className="w-4 h-4 text-slate-400" />
                </div>
                <input
                  id="vcard-title"
                  type="text"
                  value={vCardForm.title || ''}
                  onChange={(e) => onVCardChange({ ...vCardForm, title: e.target.value })}
                  placeholder="Software Engineer"
                  className={`${inputClass} pl-10`}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 9. Location */}
      {category === 'location' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="loc-lat" className={labelClass}>
                Latitude
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <MapPin className="w-4 h-4 text-cyan-400" />
                </div>
                <input
                  id="loc-lat"
                  type="text"
                  value={locationForm.latitude}
                  onChange={(e) => onLocationChange({ ...locationForm, latitude: e.target.value })}
                  placeholder="37.7749"
                  className={`${inputClass} pl-10`}
                />
              </div>
            </div>

            <div>
              <label htmlFor="loc-lng" className={labelClass}>
                Longitude
              </label>
              <input
                id="loc-lng"
                type="text"
                value={locationForm.longitude}
                onChange={(e) => onLocationChange({ ...locationForm, longitude: e.target.value })}
                placeholder="-122.4194"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label htmlFor="loc-query" className={labelClass}>
              Or Location Search Query / Address
            </label>
            <input
              id="loc-query"
              type="text"
              value={locationForm.query || ''}
              onChange={(e) => onLocationChange({ ...locationForm, query: e.target.value })}
              placeholder="e.g. Empire State Building, New York"
              className={inputClass}
            />
          </div>
        </div>
      )}

      {/* 10. Calendar */}
      {category === 'calendar' && (
        <div className="space-y-3">
          <div>
            <label htmlFor="cal-title" className={labelClass}>
              Event Title *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Calendar className="w-4 h-4 text-cyan-400" />
              </div>
              <input
                id="cal-title"
                type="text"
                value={calendarForm.title}
                onChange={(e) => onCalendarChange({ ...calendarForm, title: e.target.value })}
                placeholder="Product Launch & Keynote"
                className={`${inputClass} pl-10`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="cal-start-date" className={labelClass}>
                Start Date
              </label>
              <input
                id="cal-start-date"
                type="date"
                value={calendarForm.startDate}
                onChange={(e) => onCalendarChange({ ...calendarForm, startDate: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="cal-start-time" className={labelClass}>
                Start Time
              </label>
              <input
                id="cal-start-time"
                type="time"
                value={calendarForm.startTime}
                onChange={(e) => onCalendarChange({ ...calendarForm, startTime: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="cal-end-date" className={labelClass}>
                End Date (Optional)
              </label>
              <input
                id="cal-end-date"
                type="date"
                value={calendarForm.endDate}
                onChange={(e) => onCalendarChange({ ...calendarForm, endDate: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="cal-end-time" className={labelClass}>
                End Time (Optional)
              </label>
              <input
                id="cal-end-time"
                type="time"
                value={calendarForm.endTime}
                onChange={(e) => onCalendarChange({ ...calendarForm, endTime: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label htmlFor="cal-location" className={labelClass}>
              Location / Video Link
            </label>
            <input
              id="cal-location"
              type="text"
              value={calendarForm.location}
              onChange={(e) => onCalendarChange({ ...calendarForm, location: e.target.value })}
              placeholder="Conference Hall A / Google Meet"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="cal-desc" className={labelClass}>
              Description
            </label>
            <textarea
              id="cal-desc"
              rows={2}
              value={calendarForm.description}
              onChange={(e) => onCalendarChange({ ...calendarForm, description: e.target.value })}
              placeholder="Agenda and details for attendees..."
              className={inputClass}
            />
          </div>
        </div>
      )}
    </div>
  );
};
