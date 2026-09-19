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

export interface QRGradientConfig {
  enabled: boolean;
  type: 'linear' | 'radial';
  rotation: number; // 0 to 360
  colorStops: { offset: number; color: string }[];
}

export type QRFrameType =
  | 'none'
  | 'scan-me-bottom'
  | 'scan-me-top'
  | 'polaroid'
  | 'balloon'
  | 'ticket'
  | 'phone'
  | 'pill';

export interface QRDesignerConfig {
  frameType: QRFrameType;
  frameText: string;
  frameSubtext?: string;
  frameBgColor: string;
  frameTextColor: string;
  frameAccentColor: string;
  showIcon: boolean;
}

export interface QRStyleConfig {
  fgColor: string;
  bgColor: string;
  dotType: DotType;
  cornerSquareType: CornerSquareType;
  cornerDotType: CornerDotType;
  cornerSquareColor?: string;
  cornerDotColor?: string;
  gradient?: QRGradientConfig;
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
  | 'designer'
  | 'scanner'
  | 'dynamic'
  | 'bio'
  | 'analytics'
  | 'history'
  | 'favorites'
  | 'settings'
  | 'profile'
  | 'help'
  | 'about';

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type?: 'success' | 'info' | 'error' | 'warning';
}

// Brand Profile Kit
export interface BrandKit {
  id: string;
  name: string;
  logoUrl?: string;
  dotColor: string;
  dotType: DotType;
  cornerSquareColor: string;
  cornerSquareType: CornerSquareType;
  cornerDotColor: string;
  cornerDotType: CornerDotType;
  backgroundColor: string;
  errorCorrection: ErrorCorrectionLevel;
  isDefault?: boolean;
  createdAt: string;
}

// Dynamic Editable QR Codes
export interface DynamicQRCode {
  id: string;
  slug: string;
  title: string;
  destinationUrl: string;
  description?: string;
  category?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  totalScans: number;
  lastScannedAt?: string;
  customQrStyle?: QRStyleConfig;
}

// Scan Event for Analytics
export interface ScanEvent {
  id: string;
  dynamicCodeId: string;
  codeTitle: string;
  timestamp: string;
  deviceType: 'iOS' | 'Android' | 'Desktop' | 'Other';
  browser: string;
  country: string;
  city: string;
}

// vCard / Link-in-Bio Digital Landing Page
export interface BioCustomLink {
  id: string;
  title: string;
  url: string;
  icon?: string;
  highlight?: boolean;
}

export interface LinkInBioProfile {
  id: string;
  slug: string;
  name: string;
  title: string;
  company?: string;
  bio: string;
  avatarUrl?: string;
  theme: 'cyan' | 'purple' | 'emerald' | 'amber' | 'sunset' | 'dark';
  phone?: string;
  email?: string;
  whatsapp?: string;
  website?: string;
  github?: string;
  linkedin?: string;
  twitter?: string;
  instagram?: string;
  facebook?: string;
  customLinks: BioCustomLink[];
  updatedAt: string;
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
