import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Knowledge Base Prompt for NOVA QR AI Assistant
const NOVA_KNOWLEDGE_SYSTEM_INSTRUCTION = `You are the official AI Assistant for NOVA QR, the ultimate Next-Generation QR Code Suite and Designer Studio.
You have comprehensive knowledge of all features, capabilities, and best practices in NOVA QR. Always be friendly, concise, helpful, and provide actionable step-by-step guidance.

NOVA QR FEATURES & KNOWLEDGE BASE:

1. CORE QR GENERATOR (10 Categories):
- URL: Direct web links with auto protocol detection (https://).
- Plain Text: ASCII and UTF-8 text messages, passwords, or notes.
- Wi-Fi: Connect directly without typing passwords. Supports SSID, Password, Encryption (WPA/WPA2, WEP, None), and Hidden network flags. Generates standard WIFI:S:... payload.
- Phone: tel: links that prompt phones to open the dialer with one tap.
- Email: mailto: links with recipient, subject line, and pre-composed email body.
- SMS: sms: links with recipient phone number and pre-composed SMS text.
- WhatsApp: wa.me links with international country code and pre-composed message.
- Contact (vCard 3.0): Digital business card including Full Name, Phone, Email, Organization/Company, Job Title, and Website.
- Location: Google Maps coordinates (Latitude, Longitude) or searchable venue queries.
- Calendar: iCalendar/vEvent standard format with Event Title, Start/End Dates & Times, Location, and Description.

2. CUSTOM QR DESIGNER STUDIO ("Studio Pro"):
- Custom Visual Frames: "SCAN ME" Pill, Ticket Stub with perforations, Modern Top Banner, Bottom Action Pill, Badge frame, Minimalist Outline, or No Frame.
- Frame Customization: Customizable CTA text (e.g., "VISIT OUR MENU", "CONNECT WIFI", "GET TICKET"), subtitle guidance, background colors, text colors, and accent borders.
- Matrix Patterns & Dots: Rounded dots, extra-rounded, square, classy, dots, and classy-rounded.
- Multi-Color Gradients: Linear 2-color gradient across QR dots with 360-degree rotation angle slider.
- Independent Corner Eyes: Customizable outer eye shapes (Square, Extra-Rounded, Dot) and inner eye dots with custom colors.
- Center Vector Stickers & Emblems: Star, Zap, Shield, Heart, Camera, Coffee, Gift, Music, Shopping Bag, etc.
- Custom Brand Logo Upload: Upload PNG, SVG, or JPEG logos with real-time scale adjustment (10% to 35% size).
- Export Formats: High-resolution PNG, JPEG, SVG vector graphics, and 1-click printable badge preview.

3. DYNAMIC QR CODES:
- What they are: QR codes with a short redirect slug where the destination URL can be changed anytime without reprinting the physical code.
- Features: Real-time destination editing, toggle Active/Paused status, scan counters, and optional expiry dates.

4. REAL-TIME SCANNER:
- Camera Scanner: Uses browser webcam/phone camera with live viewfinder and sound effect.
- File Image Scanner: Drag-and-drop or upload any QR code image (PNG, JPG, WEBP) to decode instantly with jsQR.
- Actions on Scan: Copy payload, open URL, or send directly to the Generator to re-style or save.

5. ANALYTICS DASHBOARD:
- Track scan metrics: Total scans, unique visitors, scan trends over time.
- Device breakdown (iOS, Android, Desktop, Mac, Windows).
- Browser breakdown (Chrome, Safari, Edge, Firefox).

6. LINK-IN-BIO CREATOR:
- Create custom mobile landing pages with profile avatar, bio, links (website, portfolio, store), and social badges.
- Automatically generates a linked QR code for the profile.

7. SCAN RELIABILITY & BEST PRACTICES (Scan Safety Score):
- Contrast Ratio: Always maintain high contrast between foreground and background (minimum 4.5:1 contrast ratio, WCAG AA compliant). Dark foreground on light background is universally supported.
- Error Correction Levels:
  - Low (L): 7% recovery (best for clean, high-density plain data).
  - Medium (M): 15% recovery (default standard).
  - Quartile (Q): 25% recovery (good for slight styling).
  - High (H): 30% recovery (MANDATORY when embedding logos or center stickers so data remains readable).
- Quiet Zone: Maintain a clean margin around the QR matrix (minimum 4 modules).
- Export Resolution Guide: 512px for screen avatars, 1024px for standard digital media, 2048px/4096px or SVG for physical print, flyers, signage, and billboards.

8. RETRY MECHANISM & ERROR RECOVERY:
- If QR code generation fails or API network requests time out, the user can click "Retry Generation" with auto-retry backoff, switch to the offline local engine, or click "Reset Safe Defaults".

Keep your answers directly focused on NOVA QR capabilities, formatted with clear markdown, bullet points, and practical advice.`;

// Gemini client initialization (lazy / safe)
let genAI: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  if (!genAI) {
    genAI = new GoogleGenAI({ apiKey });
  }
  return genAI;
}

// Fallback rule-based answering engine if Gemini API key is missing or network fails
function getOfflineKnowledgeAnswer(query: string): string {
  const q = query.toLowerCase();

  if (q.includes('wifi') || q.includes('wi-fi')) {
    return `### How to Create a Wi-Fi QR Code in NOVA QR:
1. In the **Generator** tab, click the **Wi-Fi** category icon.
2. Enter your **Network SSID** (Wi-Fi name).
3. Select your encryption type (usually **WPA/WPA2/WPA3**).
4. Enter your **Wi-Fi Password**.
5. If your network doesn't broadcast its name, check **Hidden Network**.
6. That's it! When guests scan the QR code with their phone camera, it prompts them to connect directly without typing the password.`;
  }

  if (q.includes('logo') || q.includes('sticker') || q.includes('brand')) {
    return `### How to Add a Logo to Your QR Code:
1. Open the **Designer** tab or the **Customize** panel in the Generator.
2. Under the **Stickers & Logo** section, choose a built-in vector emblem or click **Upload Image (PNG/SVG)**.
3. Use the **Logo Scale** slider to keep the logo between 15% and 25% of the total QR area.
4. **Pro-Tip**: NOVA QR automatically sets the error correction to **Level H (30%)** when a logo is detected, ensuring your QR code scans reliably even with the center covered!`;
  }

  if (q.includes('dynamic') || q.includes('edit url') || q.includes('change url')) {
    return `### What is a Dynamic QR Code?
A **Dynamic QR Code** uses a short redirect link that allows you to change where the code leads even **after** printing!
- **Edit anytime**: Update the target destination URL whenever you want.
- **Toggle status**: Pause or resume campaigns instantly.
- **Track analytics**: Monitor total scan counts and visitor trends in the **Analytics** tab.
- Access it by clicking the **Dynamic** tab in the navigation bar!`;
  }

  if (q.includes('print') || q.includes('resolution') || q.includes('svg') || q.includes('4k')) {
    return `### Best Export Formats for Printing:
- **SVG (Vector)**: The best choice for print! Scales infinitely to any billboard or banner size without pixelation.
- **4096px (Ultra 4K)**: Ideal for high-density 300 DPI business cards, brochures, and posters.
- **1024px**: Perfect for digital sharing, email signatures, and websites.
- You can also click **Print Badge** in the Custom Designer to print directly onto standard label sheets!`;
  }

  if (q.includes('scan') && (q.includes('safety') || q.includes('score') || q.includes('contrast') || q.includes('fail') || q.includes('not scanning'))) {
    return `### Scan Safety & Reliability Guide:
1. **High Contrast**: Always ensure a dark foreground against a light background (minimum 4.5:1 contrast ratio).
2. **Error Correction**: Use **Level H (30%)** if adding a logo; use **Level M or Q** for standard links.
3. **Margins / Quiet Zone**: Ensure at least 8px to 12px of clear space around the QR code edges.
4. **Data Length**: Keep URLs concise (shortened links produce cleaner, larger dots that cameras focus on faster).`;
  }

  if (q.includes('frame') || q.includes('scan me') || q.includes('ticket')) {
    return `### Custom Frames in NOVA QR Designer:
Go to the **Designer Studio** tab to pick from custom frames:
- **Scan Me Pill**: Classic call-to-action badge below the QR code.
- **Ticket Stub**: Vintage event ticket layout with perforated tear notches.
- **Top / Bottom Banners**: Prominent branded headline cards.
- **Custom Text**: Customize both primary CTA ("SCAN ME", "VISIT MENU") and secondary helper text ("Point camera & tap").`;
  }

  if (q.includes('retry') || q.includes('error') || q.includes('fail')) {
    return `### QR Generation Retry & Error Recovery:
NOVA QR includes automatic error detection and recovery:
- If a generation request or API call is interrupted, click **"Retry Generation"** to re-attempt with automatic exponential backoff.
- If data is too large for the current error correction level, NOVA QR will suggest switching to **Level M** or trimming the payload.
- You can also click **"Use Offline Fallback"** to generate the QR code directly in your browser without external network dependencies.`;
  }

  return `### Welcome to NOVA QR AI Assistant!
I know everything about the NOVA QR suite. Here are a few things you can ask me:
- **"How do I create a Wi-Fi QR code?"**
- **"What is a Dynamic QR and how does it work?"**
- **"How do I add my company logo without breaking the scan?"**
- **"What format should I use for large print banners?"**
- **"How does the Scan Safety Score calculate contrast?"**
- **"How to create a Link-in-Bio mobile page?"**

What would you like to build or customize today?`;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  const hasKey = !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY';
  res.json({
    status: 'ok',
    aiConfigured: hasKey,
    timestamp: new Date().toISOString(),
  });
});

// Chatbot API endpoint using gemini-3.8-flash
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required and must be a string' });
    }

    const ai = getGenAI();

    if (!ai) {
      // Graceful offline knowledge base fallback
      const offlineReply = getOfflineKnowledgeAnswer(message);
      return res.json({
        reply: offlineReply,
        source: 'knowledge-base',
      });
    }

    // Prepare contents for Gemini 3.8 Flash
    const contents: any[] = [];

    // Add prior conversation turns if provided
    if (Array.isArray(history) && history.length > 0) {
      for (const turn of history.slice(-6)) {
        if (turn.role === 'user' || turn.role === 'model') {
          contents.push({
            role: turn.role,
            parts: [{ text: String(turn.text || '') }],
          });
        }
      }
    }

    // Add the current user query
    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction: NOVA_KNOWLEDGE_SYSTEM_INSTRUCTION,
        temperature: 0.7,
        maxOutputTokens: 1024,
      },
    });

    const reply = response.text || getOfflineKnowledgeAnswer(message);

    res.json({
      reply,
      source: 'gemini-3.8-flash',
    });
  } catch (error: any) {
    console.error('Error in /api/chat:', error);
    // Gracefully fallback to knowledge engine so user experience is never broken
    const fallbackReply = getOfflineKnowledgeAnswer(req.body.message || '');
    res.json({
      reply: fallbackReply,
      source: 'fallback',
      warning: 'Switched to offline knowledge engine due to connection state.',
    });
  }
});

// Server-side QR Code Generation / Validation API endpoint with retry simulation support
app.post('/api/generate-qr', (req, res) => {
  const { content, errorCorrection = 'M', simulateError = false } = req.body;

  // Check if client requested a simulated error to test UI retry state
  if (simulateError) {
    return res.status(503).json({
      error: 'Simulated API generation timeout or network outage for retry testing.',
      code: 'SIMULATED_FAILURE',
      canRetry: true,
    });
  }

  if (!content || typeof content !== 'string') {
    return res.status(400).json({
      error: 'Content payload is required',
      code: 'INVALID_PAYLOAD',
      canRetry: false,
    });
  }

  const byteLength = new TextEncoder().encode(content).length;

  // Check QR capacity limits
  // QR Version 40 with Low EC holds ~7,089 chars, High EC holds ~1,852 chars
  const maxBytes = errorCorrection === 'H' ? 1852 : errorCorrection === 'Q' ? 2606 : errorCorrection === 'M' ? 3682 : 7089;

  if (byteLength > maxBytes) {
    return res.status(422).json({
      error: `Content size (${byteLength} bytes) exceeds maximum capacity (${maxBytes} bytes) for error correction '${errorCorrection}'.`,
      code: 'PAYLOAD_OVERFLOW',
      canRetry: true,
      suggestedEC: errorCorrection === 'H' ? 'M' : 'L',
    });
  }

  // Calculate scan density complexity
  const densityScore = Math.min(100, Math.round((byteLength / maxBytes) * 100));

  res.json({
    success: true,
    bytes: byteLength,
    densityScore,
    suggestedEC: byteLength > 500 && errorCorrection === 'H' ? 'Q' : errorCorrection,
    status: 'ready',
    timestamp: Date.now(),
  });
});

// Mount Vite middleware for development or static serving for production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`NOVA QR server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
