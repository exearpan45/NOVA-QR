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

export function formatWifiPayload(form: WifiForm): string {
  const enc = form.encryption === 'nopass' ? 'nopass' : form.encryption;
  const ssid = form.ssid.replace(/([\\;,:"])/g, '\\$1');
  const password = form.password.replace(/([\\;,:"])/g, '\\$1');
  const hidden = form.hidden ? 'true' : 'false';
  return `WIFI:S:${ssid};T:${enc};P:${password};H:${hidden};;`;
}

export function formatPhonePayload(phone: string): string {
  const cleaned = phone.trim().replace(/[^\d+]/g, '');
  return `tel:${cleaned}`;
}

export function formatEmailPayload(form: EmailForm): string {
  const params: string[] = [];
  if (form.subject) params.push(`subject=${encodeURIComponent(form.subject)}`);
  if (form.body) params.push(`body=${encodeURIComponent(form.body)}`);
  const query = params.length > 0 ? `?${params.join('&')}` : '';
  return `mailto:${form.email.trim()}${query}`;
}

export function formatSmsPayload(form: SmsForm): string {
  const cleaned = form.phone.trim().replace(/[^\d+]/g, '');
  const body = form.message ? `?body=${encodeURIComponent(form.message)}` : '';
  return `sms:${cleaned}${body}`;
}

export function formatWhatsAppPayload(form: WhatsAppForm): string {
  const cleaned = form.phone.trim().replace(/[^\d]/g, '');
  const text = form.message ? `?text=${encodeURIComponent(form.message)}` : '';
  return `https://wa.me/${cleaned}${text}`;
}

export function formatVCardPayload(form: VCardForm): string {
  const lines: string[] = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${form.name.trim()}`,
    `N:${form.name.trim()};;;;`,
  ];
  if (form.organization) lines.push(`ORG:${form.organization.trim()}`);
  if (form.title) lines.push(`TITLE:${form.title.trim()}`);
  if (form.phone) lines.push(`TEL;TYPE=CELL:${form.phone.trim()}`);
  if (form.email) lines.push(`EMAIL:${form.email.trim()}`);
  if (form.website) {
    let url = form.website.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    lines.push(`URL:${url}`);
  }
  lines.push('END:VCARD');
  return lines.join('\n');
}

export function formatLocationPayload(form: LocationForm): string {
  const lat = form.latitude.trim();
  const lng = form.longitude.trim();
  if (lat && lng) {
    return `https://www.google.com/maps?q=${lat},${lng}`;
  }
  if (form.query) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(form.query)}`;
  }
  return '';
}

function toICalDate(dateStr: string, timeStr: string): string {
  if (!dateStr) return '';
  const cleanDate = dateStr.replace(/-/g, '');
  const cleanTime = (timeStr || '00:00').replace(/:/g, '') + '00';
  return `${cleanDate}T${cleanTime}`;
}

export function formatCalendarPayload(form: CalendarForm): string {
  const start = toICalDate(form.startDate, form.startTime);
  const end = toICalDate(form.endDate || form.startDate, form.endTime || form.startTime);

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//NOVA QR Generator//EN',
    'BEGIN:VEVENT',
    `SUMMARY:${form.title.trim()}`,
  ];
  if (start) lines.push(`DTSTART:${start}`);
  if (end) lines.push(`DTEND:${end}`);
  if (form.location) lines.push(`LOCATION:${form.location.trim()}`);
  if (form.description) lines.push(`DESCRIPTION:${form.description.trim()}`);
  lines.push('END:VEVENT', 'END:VCALENDAR');
  return lines.join('\n');
}

export interface DetectedQRInfo {
  category: QRCategory;
  title: string;
  displayValue: string;
  isLink: boolean;
  linkUrl?: string;
  details?: Record<string, string>;
}

export function detectPayloadType(raw: string): DetectedQRInfo {
  const text = raw.trim();

  // Wi-Fi
  if (text.startsWith('WIFI:')) {
    const ssidMatch = text.match(/S:([^;]+)/);
    const passMatch = text.match(/P:([^;]+)/);
    const typeMatch = text.match(/T:([^;]+)/);
    const ssid = ssidMatch ? ssidMatch[1] : 'Network';
    return {
      category: 'wifi',
      title: `Wi-Fi Network: ${ssid}`,
      displayValue: text,
      isLink: false,
      details: {
        SSID: ssid,
        Password: passMatch ? passMatch[1] : '(None)',
        Security: typeMatch ? typeMatch[1] : 'WPA',
      },
    };
  }

  // vCard
  if (text.includes('BEGIN:VCARD')) {
    const fnMatch = text.match(/FN:(.+)/i);
    const telMatch = text.match(/TEL.*:(.+)/i);
    const emailMatch = text.match(/EMAIL.*:(.+)/i);
    const orgMatch = text.match(/ORG.*:(.+)/i);
    const name = fnMatch ? fnMatch[1].trim() : 'Contact Card';
    return {
      category: 'vcard',
      title: `Contact: ${name}`,
      displayValue: text,
      isLink: false,
      details: {
        Name: name,
        Phone: telMatch ? telMatch[1].trim() : '',
        Email: emailMatch ? emailMatch[1].trim() : '',
        Company: orgMatch ? orgMatch[1].trim() : '',
      },
    };
  }

  // Calendar
  if (text.includes('BEGIN:VCALENDAR')) {
    const summaryMatch = text.match(/SUMMARY:(.+)/i);
    const locMatch = text.match(/LOCATION:(.+)/i);
    const title = summaryMatch ? summaryMatch[1].trim() : 'Calendar Event';
    return {
      category: 'calendar',
      title: `Event: ${title}`,
      displayValue: text,
      isLink: false,
      details: {
        Event: title,
        Location: locMatch ? locMatch[1].trim() : 'Not specified',
      },
    };
  }

  // WhatsApp
  if (text.startsWith('https://wa.me/')) {
    return {
      category: 'whatsapp',
      title: 'WhatsApp Chat',
      displayValue: text,
      isLink: true,
      linkUrl: text,
    };
  }

  // Email
  if (text.startsWith('mailto:')) {
    const emailOnly = text.replace('mailto:', '').split('?')[0];
    return {
      category: 'email',
      title: `Email: ${emailOnly}`,
      displayValue: text,
      isLink: true,
      linkUrl: text,
    };
  }

  // Phone
  if (text.startsWith('tel:')) {
    const phone = text.replace('tel:', '');
    return {
      category: 'phone',
      title: `Phone: ${phone}`,
      displayValue: text,
      isLink: true,
      linkUrl: text,
    };
  }

  // SMS
  if (text.startsWith('sms:') || text.startsWith('SMSTO:')) {
    const cleaned = text.replace(/^(sms:|SMSTO:)/i, '');
    return {
      category: 'sms',
      title: `SMS to: ${cleaned.split('?')[0]}`,
      displayValue: text,
      isLink: true,
      linkUrl: text,
    };
  }

  // Location / Geo
  if (text.startsWith('geo:') || text.includes('google.com/maps') || text.includes('maps.apple.com')) {
    return {
      category: 'location',
      title: 'Geographic Location',
      displayValue: text,
      isLink: text.startsWith('http'),
      linkUrl: text.startsWith('http') ? text : undefined,
    };
  }

  // Standard URL
  if (/^https?:\/\//i.test(text)) {
    return {
      category: 'url',
      title: 'Website Link',
      displayValue: text,
      isLink: true,
      linkUrl: text,
    };
  }

  // Plain Text
  return {
    category: 'text',
    title: 'Text Content',
    displayValue: text,
    isLink: false,
  };
}
