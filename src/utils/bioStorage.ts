import { LinkInBioProfile } from '../types';

const BIO_STORAGE_KEY = 'nova_link_in_bio_profiles';

export const INITIAL_BIO_PROFILE: LinkInBioProfile = {
  id: 'bio-arpan-default',
  slug: 'arpan-goswami',
  name: 'Arpan Goswami',
  title: 'Full Stack & AI Engineer',
  company: 'NOVA Systems',
  bio: 'Building high-performance modern web apps, intelligent generative experiences, and sleek developer tools.',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=face',
  theme: 'cyan',
  phone: '+1 (555) 234-5678',
  email: 'exe.arpan45@gmail.com',
  whatsapp: '+15552345678',
  website: 'https://arpangoswami.dev',
  github: 'https://github.com/arpangoswami',
  linkedin: 'https://linkedin.com/in/arpangoswami',
  twitter: 'https://x.com/arpangoswami',
  facebook: 'https://facebook.com/arpan.dev',
  customLinks: [
    {
      id: 'link-1',
      title: 'Explore My Portfolio & Demos',
      url: 'https://arpangoswami.dev',
      highlight: true,
    },
    {
      id: 'link-2',
      title: 'Schedule a 1-on-1 Consultation',
      url: 'https://calendly.com',
      highlight: false,
    },
    {
      id: 'link-3',
      title: 'Star NOVA QR on GitHub',
      url: 'https://github.com',
      highlight: false,
    },
  ],
  updatedAt: new Date().toISOString(),
};

export function getStoredBioProfile(): LinkInBioProfile {
  try {
    const raw = localStorage.getItem(BIO_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // fallback
  }
  return INITIAL_BIO_PROFILE;
}

export function saveBioProfile(profile: LinkInBioProfile): LinkInBioProfile {
  const updated = { ...profile, updatedAt: new Date().toISOString() };
  try {
    localStorage.setItem(BIO_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
  return updated;
}
