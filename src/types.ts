export type QRCategory =
  | 'url'
  | 'text'
  | 'wifi'
  | 'phone'
  | 'email'
  | 'sms'
  | 'whatsapp'
  | 'vcard'
  | 'location'
  | 'calendar';

export type DotType =
  | 'dots'
  | 'rounded'
  | 'classy'
  | 'classy-rounded'
  | 'square'
  | 'extra-rounded';

export type CornerSquareType = 'dot' | 'square' | 'extra-rounded';
export type CornerDotType = 'dot' | 'square';
export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

export interface QRStyleConfig {
  fgColor: string;
  bgColor: string;
  dotType: DotType;
  cornerSquareType: CornerSquareType;
  cornerDotType: CornerDotType;
  errorCorrection: ErrorCorrectionLevel;
  margin: number;
  size: number;
  logoUrl?: string;
  logoSize: number; // 0.15 to 0.4
}

export type StylePresetKey =
  | 'classic'
  | 'midnight'
  | 'neon'
  | 'ocean'
  | 'sunset'
  | 'minimal';

export interface StylePreset {
  id: StylePresetKey;
  name: string;
  description: string;
  fgColor: string;
  bgColor: string;
  dotType: DotType;
  cornerSquareType: CornerSquareType;
  cornerDotType: CornerDotType;
  previewClass: string;
}

export interface QRHistoryItem {
  id: string;
  type: QRCategory;
  title: string;
  content: string;
  timestamp: number;
  isFavorite: boolean;
  style: QRStyleConfig;
}

export interface AppSettings {
  theme: 'dark' | 'light' | 'system';
  defaultSize: number;
  defaultPreset: StylePresetKey;
  defaultErrorCorrection: ErrorCorrectionLevel;
}

export type NavTab =
  | 'generator'
  | 'scanner'
  | 'history'
  | 'favorites'
  | 'settings'
  | 'help'
  | 'about';

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type?: 'success' | 'info' | 'error' | 'warning';
}

// Category Specific Inputs
export interface WifiForm {
  ssid: string;
  password: string;
  encryption: 'WPA' | 'WEP' | 'nopass';
  hidden: boolean;
}

export interface EmailForm {
  email: string;
  subject: string;
  body: string;
}

export interface SmsForm {
  phone: string;
  message: string;
}

export interface WhatsAppForm {
  phone: string;
  message: string;
}

export interface VCardForm {
  name: string;
  phone: string;
  email: string;
  organization: string;
  website: string;
  title?: string;
}

export interface LocationForm {
  latitude: string;
  longitude: string;
  label?: string;
  query?: string;
}

export interface CalendarForm {
  title: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  location: string;
  description: string;
}
