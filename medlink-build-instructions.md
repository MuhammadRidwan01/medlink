# MedLink AI - Complete Build Instructions for AI Agent

## 🎯 Project Overview

**MedLink AI** adalah marketplace telemedicine dengan AI Triage, e-Prescription, dan apotek marketplace. 

**Value Proposition:** "Konsultasi cepat, AI bantu, dokter yang memutuskan."

**Tech Stack:**
- Framework: Next.js 14 (App Router) - Monorepo
- AI: Groq API (Llama 3.1 70B Versatile) - server-side only
- Database: Supabase (Postgres + Auth + Realtime)
- Payment: Midtrans (mock first, production-ready schema)
- State: Zustand + localStorage fallback
- UI: shadcn/ui + Tailwind CSS + Framer Motion
- Icons: Lucide React
- Font: Plus Jakarta Sans (Google Fonts)
- TypeScript: enabled (not strict mode)

---

## 🎨 Design System - CRITICAL SPECIFICATIONS

### Visual Identity
**Style:** Native mobile app feel (NOT website). Clean medical professional meets modern startup.

### Color Palette
```css
/* Primary Colors */
--primary: 166 100% 45%           /* #14B8A6 - Teal 500 */
--primary-dark: 189 94% 43%       /* #0891B2 - Cyan 600 */
--primary-gradient: linear-gradient(135deg, #14B8A6 0%, #0891B2 100%)

/* Semantic Colors */
--secondary: 217 91% 60%          /* #3B82F6 - Blue 500 */
--accent: 142 71% 45%             /* #10B981 - Emerald 500 */
--success: 142 76% 36%            /* #059669 - Emerald 600 */
--warning: 38 92% 50%             /* #F59E0B - Amber 500 */
--danger: 0 84% 60%               /* #EF4444 - Red 500 */

/* Neutral Colors */
--background: 0 0% 100%           /* White */
--background-dark: 222 47% 11%    /* Slate 900 */
--card: 0 0% 100%                 /* White */
--border: 214 32% 91%             /* Slate 200 */
--muted: 210 40% 96%              /* Slate 50 */
--text: 222 47% 11%               /* Slate 900 */
--text-muted: 215 16% 47%         /* Slate 600 */
```

### Typography
```css
/* Font Family */
font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;

/* Type Scale */
--text-h1: 32px / 700            /* Page titles */
--text-h2: 24px / 600            /* Section headers */
--text-h3: 18px / 600            /* Card titles */
--text-body: 16px / 400          /* Main text */
--text-small: 14px / 400         /* Meta info */
--text-tiny: 12px / 500          /* Labels, uppercase */
```

### Spacing & Borders
```css
/* Border Radius */
--radius-card: 16px              /* Main cards */
--radius-button: 12px            /* Buttons */
--radius-input: 10px             /* Form inputs */
--radius-badge: 6px              /* Small badges */

/* Shadows */
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05)
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1)
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1)
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1)
```

### Animation System
```css
/* Transition Durations */
--duration-fast: 150ms           /* Hover, small interactions */
--duration-normal: 180ms         /* Most transitions */
--duration-slow: 300ms           /* Page transitions */

/* Easing Functions */
--ease-out: cubic-bezier(0.4, 0, 0.2, 1)
--ease-in: cubic-bezier(0.4, 0, 1, 1)
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1)

/* Hover Effects */
hover:scale-[1.02]              /* Buttons */
hover:shadow-lg                 /* Cards */
active:scale-[0.98]             /* Active state */
```

### Component Guidelines
- **NO EMOJIS** in production UI (use Lucide icons only)
- Minimum tap target: 44x44px (mobile accessibility)
- Cards: white background, subtle shadow, rounded-xl
- Buttons: gradient primary, solid secondary, ghost tertiary
- Inputs: border on idle, ring on focus (teal-400)
- Loading: skeleton screens (NO spinners)

---

## 📂 Project Structure

```
medlink-ai/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   ├── register/
│   │   └── layout.tsx
│   ├── (patient)/
│   │   ├── dashboard/
│   │   ├── triage/
│   │   ├── consultation/[id]/
│   │   ├── prescriptions/
│   │   └── layout.tsx
│   ├── (doctor)/
│   │   ├── dashboard/
│   │   ├── queue/
│   │   ├── consultation/[id]/
│   │   └── layout.tsx
│   ├── marketplace/
│   │   ├── page.tsx
│   │   ├── cart/
│   │   └── checkout/
│   ├── api/
│   │   ├── groq/
│   │   │   ├── triage/route.ts
│   │   │   └── draft-prescription/route.ts
│   │   ├── midtrans/
│   │   │   ├── create-transaction/route.ts
│   │   │   └── webhook/route.ts
│   │   └── supabase/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/                      # shadcn components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── tabs.tsx
│   │   └── ...
│   ├── layout/
│   │   ├── header.tsx
│   │   ├── sidebar.tsx
│   │   ├── bottom-nav.tsx       # Mobile navigation
│   │   └── patient-layout.tsx
│   └── features/
│       ├── ai-triage/
│       │   ├── chat-interface.tsx
│       │   ├── chat-message.tsx
│       │   ├── symptom-summary.tsx
│       │   ├── risk-badge.tsx
│       │   └── quick-replies.tsx
│       ├── consultation/
│       │   ├── split-pane.tsx
│       │   ├── doctor-chat.tsx
│       │   ├── ai-draft-panel.tsx
│       │   └── prescription-form.tsx
│       ├── prescription/
│       │   ├── prescription-card.tsx
│       │   ├── pill-timeline.tsx
│       │   ├── medication-item.tsx
│       │   └── reminder-setup.tsx
│       └── marketplace/
│           ├── pharmacy-list.tsx
│           ├── medication-card.tsx
│           ├── drug-interaction-guard.tsx
│           ├── cart-summary.tsx
│           └── checkout-flow.tsx
├── lib/
│   ├── groq.ts                  # Groq API client
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   ├── store/
│   │   ├── auth-store.ts        # Zustand auth
│   │   ├── cart-store.ts        # Shopping cart
│   │   └── consultation-store.ts
│   ├── midtrans.ts              # Payment integration
│   ├── drug-interactions.ts     # Interaction checker
│   └── utils.ts                 # General utilities
├── types/
│   ├── index.ts
│   ├── supabase.ts              # Generated types
│   └── api.ts
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql
├── public/
│   └── icons/
├── .env.local
├── .env.example
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 🗄️ Database Schema (Supabase)

```sql
-- Users & Authentication (handled by Supabase Auth)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  date_of_birth DATE,
  phone TEXT,
  address TEXT,
  allergies TEXT[],
  medical_history JSONB,
  emergency_contact JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Doctors
CREATE TABLE doctors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  license_number TEXT UNIQUE NOT NULL,
  specialist TEXT NOT NULL,
  experience_years INTEGER,
  education TEXT[],
  bio TEXT,
  rating NUMERIC(3, 2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  consultation_fee INTEGER NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE doctor_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL, -- 0-6 (Sunday-Saturday)
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT TRUE
);

-- Consultations
CREATE TABLE consultations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES doctors(id) ON DELETE SET NULL,
  status TEXT NOT NULL CHECK (status IN ('triage', 'waiting_doctor', 'in_progress', 'completed', 'cancelled')),
  chief_complaint TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  consultation_id UUID REFERENCES consultations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('ai', 'patient', 'doctor')),
  content TEXT NOT NULL,
  metadata JSONB, -- For structured data
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ai_analysis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  consultation_id UUID REFERENCES consultations(id) ON DELETE CASCADE,
  symptoms JSONB NOT NULL,
  risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'moderate', 'high', 'emergency')),
  red_flags TEXT[],
  draft_diagnosis TEXT[],
  recommendation TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Prescriptions
CREATE TABLE prescriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  consultation_id UUID REFERENCES consultations(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES doctors(id) ON DELETE SET NULL,
  patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('draft', 'approved', 'dispensed', 'completed')),
  diagnosis TEXT NOT NULL,
  notes TEXT,
  doctor_signature TEXT, -- Digital signature
  signed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE prescription_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prescription_id UUID REFERENCES prescriptions(id) ON DELETE CASCADE,
  medication_id UUID REFERENCES medications(id) ON DELETE RESTRICT,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL, -- e.g., "3x sehari"
  duration INTEGER NOT NULL, -- days
  timing TEXT, -- e.g., "sesudah makan"
  instructions TEXT,
  quantity INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Medications & Pharmacy
CREATE TABLE medications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  generic_name TEXT,
  type TEXT NOT NULL CHECK (type IN ('tablet', 'capsule', 'syrup', 'cream', 'injection')),
  strength TEXT NOT NULL,
  manufacturer TEXT,
  description TEXT,
  indications TEXT[],
  contraindications TEXT[],
  side_effects TEXT[],
  requires_prescription BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE drug_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  medication_id UUID REFERENCES medications(id) ON DELETE CASCADE,
  interacts_with_id UUID REFERENCES medications(id) ON DELETE CASCADE,
  severity TEXT NOT NULL CHECK (severity IN ('safe', 'moderate', 'severe')),
  description TEXT NOT NULL,
  recommendation TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(medication_id, interacts_with_id)
);

CREATE TABLE pharmacies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  province TEXT NOT NULL,
  postal_code TEXT,
  phone TEXT NOT NULL,
  email TEXT,
  latitude NUMERIC(10, 8),
  longitude NUMERIC(11, 8),
  operating_hours JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  rating NUMERIC(3, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE pharmacy_stock (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pharmacy_id UUID REFERENCES pharmacies(id) ON DELETE CASCADE,
  medication_id UUID REFERENCES medications(id) ON DELETE CASCADE,
  stock INTEGER NOT NULL DEFAULT 0,
  price INTEGER NOT NULL,
  is_available BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(pharmacy_id, medication_id)
);

-- Orders
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  prescription_id UUID REFERENCES prescriptions(id) ON DELETE SET NULL,
  pharmacy_id UUID REFERENCES pharmacies(id) ON DELETE SET NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled')),
  subtotal INTEGER NOT NULL,
  delivery_fee INTEGER DEFAULT 0,
  total INTEGER NOT NULL,
  delivery_address JSONB NOT NULL,
  delivery_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  medication_id UUID REFERENCES medications(id) ON DELETE RESTRICT,
  prescription_item_id UUID REFERENCES prescription_items(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL,
  price INTEGER NOT NULL,
  subtotal INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  method TEXT NOT NULL CHECK (method IN ('credit_card', 'bank_transfer', 'e_wallet', 'qris')),
  amount INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'success', 'failed', 'expired')),
  midtrans_token TEXT,
  midtrans_redirect_url TEXT,
  midtrans_transaction_id TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Medication Reminders
CREATE TABLE medication_reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  prescription_item_id UUID REFERENCES prescription_items(id) ON DELETE CASCADE,
  schedule_time TIME NOT NULL,
  days_active INTEGER[] NOT NULL, -- [0,1,2,3,4,5,6] for week days
  is_active BOOLEAN DEFAULT TRUE,
  last_taken_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_consultations_patient ON consultations(patient_id);
CREATE INDEX idx_consultations_doctor ON consultations(doctor_id);
CREATE INDEX idx_consultations_status ON consultations(status);
CREATE INDEX idx_messages_consultation ON messages(consultation_id);
CREATE INDEX idx_prescriptions_patient ON prescriptions(patient_id);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_pharmacy_stock_pharmacy ON pharmacy_stock(pharmacy_id);
CREATE INDEX idx_pharmacy_stock_medication ON pharmacy_stock(medication_id);

-- Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_reminders ENABLE ROW LEVEL SECURITY;

-- RLS Policies (example for user_profiles)
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);
```

---

## 🤖 AI Integration (Groq API)

### Environment Variables
```env
GROQ_API_KEY=gsk_xxxxxxxxxxxxx
GROQ_MODEL=llama-3.1-70b-versatile
```

### AI Triage System Prompt
```typescript
const TRIAGE_SYSTEM_PROMPT = `Kamu adalah asisten medis AI MedLink yang bertugas melakukan triage awal pasien.

ATURAN KETAT:
1. Kamu HANYA asisten triage, BUKAN dokter
2. Selalu gunakan bahasa Indonesia yang mudah dipahami
3. Tanyakan minimal 3 pertanyaan sebelum memberikan rekomendasi
4. Fokus pada: gejala utama, durasi, intensitas, gejala penyerta, riwayat penyakit, alergi obat
5. Deteksi red flags (tanda bahaya) dan berikan emergency alert jika ditemukan
6. Klasifikasi risiko: low (ringan), moderate (sedang), high (tinggi), emergency (darurat)

RED FLAGS (EMERGENCY):
- Nyeri dada/sesak napas berat
- Perdarahan hebat/tidak terkontrol
- Kehilangan kesadaran
- Demam tinggi >40°C dengan kejang
- Trauma kepala berat
- Nyeri perut akut dengan kaku perut

RESPONSE FORMAT:
Setelah mengumpulkan informasi cukup (minimal 3 pertanyaan), berikan output dalam format JSON:
{
  "symptoms": ["gejala1", "gejala2"],
  "duration": "durasi gejala",
  "severity": "mild/moderate/severe",
  "riskLevel": "low/moderate/high/emergency",
  "redFlags": ["flag1", "flag2"] atau [],
  "recommendation": {
    "type": "otc/doctor/emergency",
    "reason": "alasan rekomendasi",
    "otcSuggestions": ["obat1", "obat2"] (jika type=otc),
    "urgency": "immediate/within_24h/within_week"
  }
}

Tetap empati, profesional, dan jangan pernah memberikan diagnosis pasti.`;
```

### AI Draft Prescription Prompt (for Doctor)
```typescript
const PRESCRIPTION_DRAFT_PROMPT = `Kamu adalah asisten AI yang membantu dokter membuat draf resep berdasarkan hasil konsultasi.

INPUT DATA:
- Symptoms: {symptoms}
- AI Triage Analysis: {triageAnalysis}
- Patient History: {patientHistory}
- Patient Allergies: {allergies}

TUGAS:
Buat draf resep yang mencakup:
1. Diagnosis banding (differential diagnosis)
2. Rekomendasi obat dengan dosis, frekuensi, durasi
3. Non-farmakologis (istirahat, diet, dll)
4. Warning jika ada kontraindikasi dengan alergi

ATURAN:
- Draf ini HARUS di-review dan disetujui dokter
- Gunakan obat generic name
- Berikan alternatif obat jika memungkinkan
- Pertimbangkan safety profile dan drug interactions

OUTPUT FORMAT JSON:
{
  "differentialDiagnosis": ["diagnosis1", "diagnosis2"],
  "medications": [
    {
      "name": "nama obat",
      "dosage": "dosis",
      "frequency": "3x sehari",
      "duration": "7 hari",
      "timing": "sesudah makan",
      "instructions": "instruksi khusus"
    }
  ],
  "nonPharmacological": ["saran1", "saran2"],
  "warnings": ["warning1"] (jika ada),
  "doctorNotes": "catatan untuk dokter"
}`;
```

### Implementation Example
```typescript
// app/api/groq/triage/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { messages, consultationId } = await request.json();

    const stream = await groq.chat.completions.create({
      model: 'llama-3.1-70b-versatile',
      messages: [
        {
          role: 'system',
          content: TRIAGE_SYSTEM_PROMPT,
        },
        ...messages,
      ],
      temperature: 0.7,
      max_tokens: 2048,
      stream: true,
    });

    // Return streaming response
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || '';
          controller.enqueue(encoder.encode(content));
        }
        controller.close();
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Groq API Error:', error);
    return NextResponse.json(
      { error: 'AI service unavailable' },
      { status: 500 }
    );
  }
}
```

---

## 🎨 Key Component Specifications

### 1. Chat Interface (Card-Based Style)

**Location:** `components/features/ai-triage/chat-interface.tsx`

**Requirements:**
- Card-based messages with clear role headers
- Streaming response with typing indicator
- Auto-scroll to latest message
- Quick reply chips for common responses
- Symptom summary panel (sticky, right side)
- Red flag alerts (animated, top banner)

**Layout:**
```
┌─────────────────┬─────────────────┐
│  Chat Messages  │  Smart Summary  │
│  (scrollable)   │  (sticky)       │
│                 │                 │
│  [Card: AI]     │  Gejala:        │
│  [Card: User]   │  - Demam 2 hari │
│  [Card: AI]     │  - Batuk        │
│                 │                 │
│  [Input + Send] │  Risiko: Low    │
└─────────────────┴─────────────────┘
```

**Message Card Structure:**
```tsx
<Card className="border-2 overflow-hidden shadow-sm">
  {/* Header */}
  <div className="px-4 py-2 border-b bg-gradient-to-r from-teal-500 to-cyan-600">
    <div className="flex items-center gap-2 text-white">
      <Bot className="w-4 h-4" />
      <span className="text-xs font-semibold uppercase tracking-wide">
        MedLink AI
      </span>
    </div>
  </div>
  
  {/* Content */}
  <div className="px-4 py-3 bg-gradient-to-br from-teal-50 to-cyan-50">
    <p className="text-sm text-slate-700 leading-relaxed">
      {message content}
    </p>
  </div>
</Card>
```

**Animations:**
- Message appear: `animate-in slide-in-from-bottom-2 duration-150`
- Typing indicator: pulsing dots animation
- Red flag: shake animation on appear

---

### 2. Pill Timeline (Linear Style)

**Location:** `components/features/prescription/pill-timeline.tsx`

**Requirements:**
- Horizontal timeline with progress bar
- 3 time slots (morning, afternoon, evening)
- Interactive: click to mark as taken
- Visual progress indicator
- Medication details card
- Reminder setup button

**Structure:**
```tsx
<Card className="p-6 shadow-lg border border-slate-200 rounded-2xl">
  {/* Header */}
  <div className="flex items-center justify-between mb-4">
    <div>
      <h3 className="font-bold text-slate-800">Paracetamol 500mg</h3>
      <p className="text-xs text-slate-500">3x sehari sesudah makan</p>
    </div>
    <div className="text-right">
      <div className="text-2xl font-bold text-teal-600">2/3</div>
      <div className="text-xs text-slate-500">Hari ke-3 dari 7</div>
    </div>
  </div>

  {/* Timeline */}
  <div className="relative">
    {/* Progress bar background */}
    <div className="absolute top-6 left-0 right-0 h-0.5 bg-slate-200" />
    
    {/* Progress bar fill */}
    <div className="absolute top-6 left-0 h-0.5 bg-gradient-to-r from-teal-500 to-cyan-600 transition-all duration-300" 
         style={{ width: '66%' }} />
    
    {/* Time slots */}
    <div className="relative flex justify-between">
      {schedules.map((schedule) => (
        <button className="flex flex-col items-center gap-2 group">
          <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-150 ${
            schedule.taken 
              ? 'bg-gradient-to-br from-teal-500 to-cyan-600 border-teal-500 shadow-lg' 
              : 'bg-white border-slate-300 hover:border-teal-400'
          }`}>
            {schedule.taken ? (
              <Check className="w-6 h-6 text-white" />
            ) : (
              <Pill className="w-6 h-6 text-slate-400" />
            )}
          </div>
          <div className="text-center">
            <div className="text-sm font-semibold">{schedule.time}</div>
            <div className="text-xs text-slate-500">{schedule.label}</div>
          </div>
        </button>
      ))}
    </div>
  </div>

  {/* Footer */}
  <div className="mt-6 pt-4 border-t border-slate-100">
    <div className="flex items-center justify-between text-xs">
      <span className="text-slate-500 flex items-center gap-1">
        <AlertCircle className="w-3 h-3" />
        Minum sesudah makan
      </span>
      <button className="text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1">
        <Bell className="w-3 h-3" />
        Set Reminder
      </button>
    </div>
  </div>
</Card>
```

---

### 3. Drug Interaction Guard (Inline Card Style)

**Location:** `components/features/marketplace/drug-interaction-guard.tsx`

**Requirements:**
- Inline card that appears in checkout flow
- Non-intrusive but highly visible
- Expandable details section
- Severity indicators (safe/moderate/severe)
- Clear CTA buttons

**Severity Levels:**
```typescript
type InteractionSeverity = 'safe' | 'moderate' | 'severe';

const severityConfig = {
  safe: {
    color: 'green',
    icon: CheckCircle,
    action: 'proceed',
  },
  moderate: {
    color: 'amber',
    icon: AlertCircle,
    action: 'warn',
  },
  severe: {
    color: 'red',
    icon: XCircle,
    action: 'block',
  },
};
```

**Component Structure:**
```tsx
<Card className="shadow-lg border-2 border-amber-200 rounded-xl overflow-hidden">
  {/* Header */}
  <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-3 border-b border-amber-200">
    <div className="flex items-center gap-2">
      <Shield className="w-5 h-5 text-amber-600" />
      <h4 className="font-bold text-amber-900 text-sm">
        Pemeriksaan Interaksi Obat
      </h4>
    </div>
  </div>

  {/* Content */}
  <div className="p-4">
    <div className="flex items-start gap-3 mb-3">
      <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
        <AlertCircle className="w-5 h-5 text-amber-600" />
      </div>
      <div className="flex-1">
        <h5 className="font-semibold text-slate-800 text-sm mb-1">
          Interaksi Terdeteksi
        </h5>
        <p className="text-xs text-slate-600 leading-relaxed">
          {interaction.description}
        </p>
      </div>
    </div>

    {/* Recommendation */}
    <div className="bg-teal-50 border border-teal-200 rounded-lg p-3 mb-3">
      <div className="flex items-start gap-2">
        <CheckCircle className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
        <div>
          <div className="text-xs font-semibold text-teal-900 mb-1">
            Aman dengan perhatian:
          </div>
          <div className="text-xs text-teal-800">
            {interaction.recommendation}
          </div>
        </div>
      </div>
    </div>

    {/* Expandable details */}
    <button
      onClick={() => setExpanded(!expanded)}
      className="text-xs text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1 transition-colors duration-150"
    >
      <Info className="w-3 h-3" />
      {expanded ? 'Sembunyikan detail' : 'Pelajari lebih lanjut'}
    </button>

    {expanded && (
      <div className="mt-3 pt-3 border-t border-slate-100 space-y-2 animate-in slide-in-from-top duration-150">
        {interaction.details.map((detail, idx) => (
          <div key={idx} className="flex items-start gap-2 text-xs text-slate-600">
            <div className="w-1 h-1 bg-slate-400 rounded-full mt-1.5 flex-shrink-0"></div>
            <span>{detail}</span>
          </div>
        ))}
      </div>
    )}
  </div>

  {/* CTA */}
  <div className="px-4 pb-4">
    <button className="w-full py-2.5 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-lg hover:shadow-lg transition-all duration-150 text-sm font-medium">
      Saya Mengerti & Lanjutkan
    </button>
  </div>
</Card>
```

---

## 🚀 Core Features Implementation Guide

### Feature 1: AI Triage Chat Flow

**User Journey:**
1. User klik "Mulai Konsultasi Gratis"
2. AI greeting & ask chief complaint
3. AI asks follow-up questions (min 3)
4. AI analyzes & provides recommendation
5. Routes based on risk level:
   - **Low:** OTC suggestions + marketplace link
   - **Moderate/High:** Booking doctor form
   - **Emergency:** Emergency alert + hospital locator

**Key Components:**
```typescript
// State management (Zustand)
interface TriageStore {
  consultationId: string | null;
  messages: Message[];
  symptoms: string[];
  riskLevel: RiskLevel | null;
  isLoading: boolean;
  addMessage: (message: Message) => void;
  streamAIResponse: (userMessage: string) => Promise<void>;
  analyzeSymptoms: () => Promise<AnalysisResult>;
}

// Message type
interface Message {
  id: string;
  role: 'ai' | 'user';
  content: string;
  timestamp: Date;
  metadata?: {
    isAnalysis?: boolean;
    quickReplies?: string[];
  };
}
```

**AI Response Handler:**
```typescript
async function streamAIResponse(userMessage: string) {
  setIsLoading(true);
  addMessage({ role: 'user', content: userMessage });

  const response = await fetch('/api/groq/triage', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      consultationId,
      messages: [...messages, { role: 'user', content: userMessage }],
    }),
  });

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  let aiMessageId = generateId();
  let accumulatedContent = '';

  while (true) {
    const { done, value } = await reader!.read();
    if (done) break;

    const chunk = decoder.decode(value);
    accumulatedContent += chunk;

    // Update message in real-time
    updateMessage(aiMessageId, accumulatedContent);
  }

  setIsLoading(false);
  
  // Check if response contains analysis JSON
  if (accumulatedContent.includes('"riskLevel"')) {
    await parseAndStoreAnalysis(accumulatedContent);
  }
}
```

---

### Feature 2: Doctor Consultation (Split-pane Interface)

**Layout Structure:**
```
┌────────────────────────────┬──────────────────────────┐
│   Chat Area (60%)          │   AI Smart Panel (40%)   │
│                            │                          │
│   [AI Message Card]        │   Ringkasan Gejala       │
│   [Patient Message Card]   │   - Demam 38.5°C         │
│   [Doctor Message Card]    │   - Batuk berdahak       │
│   [AI Draft visible to Dr] │   - Durasi: 2 hari       │
│                            │                          │
│   [Input Area]             │   Alergi Pasien          │
│                            │   - Penisilin            │
│                            │                          │
│                            │   Draf AI Resep          │
│                            │   [View/Edit Button]     │
│                            │                          │
│                            │   [Approve Button]       │
└────────────────────────────┴──────────────────────────┘
```

**Real-time Updates (Supabase Realtime):**
```typescript
// Subscribe to consultation messages
useEffect(() => {
  const channel = supabase
    .channel(`consultation:${consultationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `consultation_id=eq.${consultationId}`,
      },
      (payload) => {
        addMessage(payload.new as Message);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [consultationId]);
```

**Doctor Actions:**
```typescript
interface DoctorActions {
  viewAIDraft: () => void;
  editPrescription: (prescription: Prescription) => void;
  approvePrescription: () => Promise<void>;
  rejectAndRewrite: (reason: string) => Promise<void>;
  endConsultation: () => Promise<void>;
}

// Approve prescription flow
async function approvePrescription() {
  // 1. Update prescription status to 'approved'
  await supabase
    .from('prescriptions')
    .update({
      status: 'approved',
      signed_at: new Date().toISOString(),
      doctor_signature: generateDigitalSignature(),
    })
    .eq('id', prescriptionId);

  // 2. Send notification to patient
  await sendNotification({
    userId: patientId,
    type: 'prescription_ready',
    title: 'Resep Siap!',
    message: 'Dokter telah menyetujui resep Anda. Silakan lanjut ke apotek.',
  });

  // 3. Navigate patient to prescription view
  await updateConsultationStatus('completed');
}
```

---

### Feature 3: E-Prescription & Marketplace Checkout

**Prescription Card Component:**
```tsx
<Card className="rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
  {/* Header with doctor signature */}
  <div className="bg-gradient-to-r from-teal-500 to-cyan-600 p-4">
    <div className="flex items-center justify-between text-white">
      <div>
        <h3 className="font-bold text-lg">E-Resep Digital</h3>
        <p className="text-xs text-teal-100">
          No: {prescriptionNumber}
        </p>
      </div>
      <div className="text-right">
        <div className="text-xs">Ditandatangani oleh</div>
        <div className="font-semibold">Dr. {doctorName}</div>
      </div>
    </div>
  </div>

  {/* Diagnosis */}
  <div className="p-4 bg-slate-50 border-b border-slate-200">
    <h4 className="text-xs font-semibold text-slate-500 uppercase mb-1">
      Diagnosis
    </h4>
    <p className="text-sm text-slate-800">{diagnosis}</p>
  </div>

  {/* Medications list */}
  <div className="p-4 space-y-3">
    {medications.map((med) => (
      <div key={med.id} className="flex items-start gap-3 p-3 bg-white border border-slate-200 rounded-lg hover:border-teal-300 transition-all duration-150">
        <div className="w-12 h-12 bg-teal-50 rounded-lg flex items-center justify-center flex-shrink-0">
          <Pill className="w-6 h-6 text-teal-600" />
        </div>
        <div className="flex-1">
          <h5 className="font-semibold text-slate-800">{med.name}</h5>
          <p className="text-xs text-slate-600 mt-1">
            {med.dosage} • {med.frequency} • {med.duration} hari
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {med.timing}
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm font-semibold text-slate-800">
            Rp {med.price.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500">{med.quantity}x</div>
        </div>
      </div>
    ))}
  </div>

  {/* Actions */}
  <div className="p-4 bg-slate-50 border-t border-slate-200">
    <button className="w-full py-3 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-lg hover:shadow-lg transition-all duration-150 font-medium flex items-center justify-center gap-2">
      <ShoppingCart className="w-5 h-5" />
      Beli Semua Obat
    </button>
  </div>
</Card>
```

**Checkout Flow with Interaction Check:**
```typescript
// Shopping cart state
interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => Promise<InteractionResult>;
  removeItem: (itemId: string) => void;
  checkInteractions: () => Promise<Interaction[]>;
  getTotalPrice: () => number;
}

// Add to cart with interaction check
async function addItem(item: CartItem): Promise<InteractionResult> {
  // Check drug interactions
  const interactions = await checkDrugInteractions(
    [...items.map(i => i.medicationId), item.medicationId]
  );

  const hasModerate = interactions.some(i => i.severity === 'moderate');
  const hasSevere = interactions.some(i => i.severity === 'severe');

  if (hasSevere) {
    return {
      success: false,
      blocked: true,
      message: 'Obat ini memiliki interaksi berbahaya dengan obat lain di keranjang.',
      interactions,
    };
  }

  if (hasModerate) {
    return {
      success: true,
      warning: true,
      message: 'Obat ini memiliki interaksi yang perlu perhatian.',
      interactions,
    };
  }

  // Add to cart
  setItems([...items, item]);
  
  return {
    success: true,
    interactions: [],
  };
}

// Drug interaction checker
async function checkDrugInteractions(medicationIds: string[]) {
  const { data } = await supabase
    .from('drug_interactions')
    .select(`
      *,
      medication:medications!medication_id(*),
      interacts_with:medications!interacts_with_id(*)
    `)
    .in('medication_id', medicationIds)
    .in('interacts_with_id', medicationIds);

  return data || [];
}
```

---

### Feature 4: Midtrans Payment Integration

**Environment Variables:**
```env
MIDTRANS_SERVER_KEY=SB-Mid-server-xxxxx
MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxxx
MIDTRANS_IS_PRODUCTION=false
```

**Create Transaction Flow:**
```typescript
// app/api/midtrans/create-transaction/route.ts
import midtransClient from 'midtrans-client';

const snap = new midtransClient.Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
  serverKey: process.env.MIDTRANS_SERVER_KEY!,
  clientKey: process.env.MIDTRANS_CLIENT_KEY!,
});

export async function POST(request: NextRequest) {
  const { orderId, amount, customerDetails, itemDetails } = await request.json();

  const parameter = {
    transaction_details: {
      order_id: orderId,
      gross_amount: amount,
    },
    customer_details: {
      first_name: customerDetails.name,
      email: customerDetails.email,
      phone: customerDetails.phone,
    },
    item_details: itemDetails.map((item: any) => ({
      id: item.id,
      price: item.price,
      quantity: item.quantity,
      name: item.name,
    })),
    callbacks: {
      finish: `${process.env.NEXT_PUBLIC_BASE_URL}/orders/${orderId}/success`,
      error: `${process.env.NEXT_PUBLIC_BASE_URL}/orders/${orderId}/failed`,
      pending: `${process.env.NEXT_PUBLIC_BASE_URL}/orders/${orderId}/pending`,
    },
  };

  try {
    const transaction = await snap.createTransaction(parameter);
    
    // Save payment record
    await supabase.from('payments').insert({
      order_id: orderId,
      midtrans_token: transaction.token,
      midtrans_redirect_url: transaction.redirect_url,
      status: 'pending',
      amount,
    });

    return NextResponse.json({
      token: transaction.token,
      redirectUrl: transaction.redirect_url,
    });
  } catch (error) {
    console.error('Midtrans Error:', error);
    return NextResponse.json(
      { error: 'Payment gateway error' },
      { status: 500 }
    );
  }
}
```

**Webhook Handler:**
```typescript
// app/api/midtrans/webhook/route.ts
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  const body = await request.json();
  
  // Verify signature
  const hash = crypto
    .createHash('sha512')
    .update(
      `${body.order_id}${body.status_code}${body.gross_amount}${process.env.MIDTRANS_SERVER_KEY}`
    )
    .digest('hex');

  if (hash !== body.signature_key) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
  }

  const orderId = body.order_id;
  const transactionStatus = body.transaction_status;
  const fraudStatus = body.fraud_status;

  let orderStatus = 'pending';

  if (transactionStatus === 'capture') {
    orderStatus = fraudStatus === 'accept' ? 'paid' : 'pending';
  } else if (transactionStatus === 'settlement') {
    orderStatus = 'paid';
  } else if (['cancel', 'deny', 'expire'].includes(transactionStatus)) {
    orderStatus = 'cancelled';
  }

  // Update order and payment status
  await supabase
    .from('orders')
    .update({ status: orderStatus, updated_at: new Date().toISOString() })
    .eq('order_number', orderId);

  await supabase
    .from('payments')
    .update({
      status: transactionStatus === 'settlement' ? 'success' : 'failed',
      midtrans_transaction_id: body.transaction_id,
      paid_at: transactionStatus === 'settlement' ? new Date().toISOString() : null,
    })
    .eq('order_id', orderId);

  // If paid, trigger fulfillment
  if (orderStatus === 'paid') {
    await triggerOrderFulfillment(orderId);
  }

  return NextResponse.json({ success: true });
}
```

---

## 📱 Navigation & Layout (App-like Experience)

### Bottom Navigation (Mobile)
```tsx
// components/layout/bottom-nav.tsx
const navItems = [
  { icon: Home, label: 'Beranda', href: '/dashboard' },
  { icon: MessageSquare, label: 'Konsultasi', href: '/triage' },
  { icon: Pill, label: 'Resep', href: '/prescriptions' },
  { icon: ShoppingBag, label: 'Apotek', href: '/marketplace' },
  { icon: User, label: 'Profil', href: '/profile' },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-2 py-2 safe-area-bottom md:hidden z-50">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-150 ${
                isActive
                  ? 'text-teal-600'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? 'fill-teal-100' : ''}`} />
              <span className="text-xs font-medium">{item.label}</span>
              {isActive && (
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-teal-600 rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
```

### Sidebar (Desktop)
```tsx
// components/layout/sidebar.tsx
export function Sidebar() {
  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 h-screen sticky top-0">
      {/* Logo */}
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-slate-800">MedLink AI</h1>
            <p className="text-xs text-slate-500">Healthcare Platform</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <NavItem key={item.href} {...item} />
        ))}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-slate-200">
        <UserProfileCard />
      </div>
    </aside>
  );
}
```

### Floating Action Button (FAB)
```tsx
// components/layout/fab.tsx
export function ConsultationFAB() {
  return (
    <button
      className="fixed bottom-20 right-6 md:bottom-6 w-14 h-14 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full shadow-xl hover:shadow-2xl hover:scale-110 active:scale-95 transition-all duration-150 flex items-center justify-center z-40 group"
      onClick={() => router.push('/triage')}
    >
      <MessageSquarePlus className="w-6 h-6 text-white" />
      
      {/* Tooltip */}
      <div className="absolute right-full mr-3 px-3 py-2 bg-slate-900 text-white text-sm rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none">
        Mulai Konsultasi
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full border-4 border-transparent border-l-slate-900" />
      </div>
    </button>
  );
}
```

---

## 🔐 Authentication Flow

### Supabase Auth Setup
```typescript
// lib/supabase/client.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export const supabase = createClientComponentClient();

// lib/supabase/server.ts
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export const createClient = () => {
  return createServerComponentClient({ cookies });
};
```

### Login Flow
```tsx
// app/(auth)/login/page.tsx
async function handleLogin(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    toast.error('Login gagal: ' + error.message);
    return;
  }

  // Get user role
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', data.user.id)
    .single();

  // Redirect based on role
  if (profile?.role === 'doctor') {
    router.push('/doctor/dashboard');
  } else {
    router.push('/dashboard');
  }
}
```

### Protected Route Middleware
```typescript
// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Protect patient routes
  if (req.nextUrl.pathname.startsWith('/dashboard') && !session) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Protect doctor routes
  if (req.nextUrl.pathname.startsWith('/doctor')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (profile?.role !== 'doctor') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }

  return res;
}

export const config = {
  matcher: ['/dashboard/:path*', '/doctor/:path*', '/triage/:path*'],
};
```

---

## ⚡ Performance Optimization

### 1. Image Optimization
```tsx
import Image from 'next/image';

<Image
  src="/medications/paracetamol.jpg"
  alt="Paracetamol"
  width={80}
  height={80}
  className="rounded-lg"
  loading="lazy"
/>
```

### 2. Code Splitting
```tsx
import dynamic from 'next/dynamic';

const ConsultationPanel = dynamic(
  () => import('@/components/features/consultation/split-pane'),
  { loading: () => <ConsultationSkeleton /> }
);
```

### 3. Skeleton Loading
```tsx
export function PrescriptionSkeleton() {
  return (
    <Card className="p-6 animate-pulse">
      <div className="h-6 bg-slate-200 rounded w-1/3 mb-4" />
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-slate-100 rounded-lg" />
        ))}
      </div>
    </Card>
  );
}
```

### 4. React Query for Data Fetching
```typescript
// lib/hooks/use-prescriptions.ts
import { useQuery } from '@tanstack/react-query';

export function usePrescriptions(userId: string) {
  return useQuery({
    queryKey: ['prescriptions', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('prescriptions')
        .select(`
          *,
          prescription_items(*,
            medication:medications(*)
          ),
          doctor:doctors(*)
        `)
        .eq('patient_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
```

---

## 📦 Package.json Dependencies

```json
{
  "name": "medlink-ai",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "next": "14.2.0",
    "react": "18.3.0",
    "react-dom": "18.3.0",
    "@supabase/auth-helpers-nextjs": "^0.10.0",
    "@supabase/supabase-js": "^2.45.0",
    "groq-sdk": "^0.7.0",
    "zustand": "^4.5.0",
    "@tanstack/react-query": "^5.56.0",
    "framer-motion": "^11.5.0",
    "lucide-react": "^0.441.0",
    "@radix-ui/react-dialog": "^1.1.1",
    "@radix-ui/react-select": "^2.1.1",
    "@radix-ui/react-tabs": "^1.1.0",
    "@radix-ui/react-toast": "^1.2.1",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.5.2",
    "tailwindcss-animate": "^1.0.7",
    "midtrans-client": "^1.3.1",
    "date-fns": "^3.6.0",
    "zod": "^3.23.0",
    "react-hook-form": "^7.53.0",
    "@hookform/resolvers": "^3.9.0"
  },
  "devDependencies": {
    "typescript": "5.5.0",
    "@types/node": "22.5.0",
    "@types/react": "18.3.0",
    "@types/react-dom": "18.3.0",
    "tailwindcss": "3.4.0",
    "postcss": "8.4.0",
    "autoprefixer": "10.4.0",
    "eslint": "9.9.0",
    "eslint-config-next": "14.2.0"
  }
}
```

---

## 🎯 Implementation Priority & Timeline

### Phase 1: Foundation (Week 1-2)
1. ✅ Setup Next.js project with TypeScript
2. ✅ Configure Tailwind + shadcn/ui
3. ✅ Setup Supabase (database + auth)
4. ✅ Implement design system (colors, typography, components)
5. ✅ Create layout components (Header, Sidebar, BottomNav, FAB)
6. ✅ Build authentication flow (login, register, middleware)

### Phase 2: AI Triage (Week 3)
1. ✅ Integrate Groq API
2. ✅ Build chat interface (card-based style)
3. ✅ Implement streaming responses
4. ✅ Create symptom summary panel
5. ✅ Add risk classification logic
6. ✅ Build red flag detection & emergency alerts

### Phase 3: Doctor Consultation (Week 4)
1. ✅ Build split-pane consultation interface
2. ✅ Implement real-time chat (Supabase Realtime)
3. ✅ Create AI draft prescription generator
4. ✅ Build doctor review & approval system
5. ✅ Add digital signature mechanism

### Phase 4: E-Prescription & Marketplace (Week 5-6)
1. ✅ Create prescription card component
2. ✅ Build pill timeline (linear style)
3. ✅ Implement medication reminder system
4. ✅ Create marketplace catalog
5. ✅ Build drug interaction checker (inline card style)
6. ✅ Implement shopping cart with interaction warnings
7. ✅ Build pharmacy selection & stock checking

### Phase 5: Payment & Fulfillment (Week 7)
1. ✅ Integrate Midtrans payment gateway
2. ✅ Build checkout flow
3. ✅ Implement webhook handler
4. ✅ Create order tracking system
5. ✅ Add order history page

### Phase 6: Polish & Testing (Week 8)
1. ✅ Add loading states & error handling
2. ✅ Implement skeleton screens
3. ✅ Optimize animations & transitions
4. ✅ Mobile responsive testing
5. ✅ Accessibility audit
6. ✅ Performance optimization
7. ✅ Security review

---

## 🛠️ Development Setup Instructions

### 1. Clone & Install
```bash
git clone https://github.com/yourusername/medlink-ai.git
cd medlink-ai
npm install
```

### 2. Environment Variables Setup
Create `.env.local`:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Groq AI
GROQ_API_KEY=gsk_xxxxxxxxxxxxx

# Midtrans
MIDTRANS_SERVER_KEY=SB-Mid-server-xxxxx
MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxxx
MIDTRANS_IS_PRODUCTION=false

# App Config
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 3. Database Setup
```bash
# Install Supabase CLI
npm install -g supabase

# Initialize Supabase locally (optional for dev)
supabase init

# Run migrations
supabase db push

# Generate TypeScript types
npx supabase gen types typescript --project-id your-project-id > types/supabase.ts
```

### 4. Seed Database (Optional)
Create `supabase/seed.sql`:
```sql
-- Insert sample medications
INSERT INTO medications (name, generic_name, type, strength, description, requires_prescription) VALUES
('Paracetamol', 'Acetaminophen', 'tablet', '500mg', 'Pereda demam dan nyeri', false),
('Ibuprofen', 'Ibuprofen', 'tablet', '400mg', 'Antiinflamasi dan pereda nyeri', false),
('Amoxicillin', 'Amoxicillin', 'capsule', '500mg', 'Antibiotik spektrum luas', true),
('OBH Combi', 'Dextromethorphan', 'syrup', '100ml', 'Obat batuk', false);

-- Insert drug interactions
INSERT INTO drug_interactions (medication_id, interacts_with_id, severity, description, recommendation) 
SELECT 
  m1.id,
  m2.id,
  'moderate',
  'Paracetamol dan Ibuprofen dapat diminum bersamaan dengan aman, namun perlu jeda waktu minimal 4 jam untuk menghindari beban berlebih pada liver.',
  'Minum obat dengan jeda 4 jam'
FROM medications m1, medications m2
WHERE m1.name = 'Paracetamol' AND m2.name = 'Ibuprofen';

-- Insert sample pharmacies
INSERT INTO pharmacies (name, address, city, province, phone, latitude, longitude) VALUES
('Apotek Sehat', 'Jl. Sudirman No. 123', 'Jakarta', 'DKI Jakarta', '021-12345678', -6.2088, 106.8456),
('Kimia Farma', 'Jl. Thamrin No. 45', 'Jakarta', 'DKI Jakarta', '021-87654321', -6.1944, 106.8229);

-- Insert pharmacy stock
INSERT INTO pharmacy_stock (pharmacy_id, medication_id, stock, price, is_available)
SELECT 
  p.id,
  m.id,
  100,
  CASE 
    WHEN m.name = 'Paracetamol' THEN 15000
    WHEN m.name = 'Ibuprofen' THEN 25000
    WHEN m.name = 'Amoxicillin' THEN 45000
    ELSE 20000
  END,
  true
FROM pharmacies p
CROSS JOIN medications m;
```

### 5. Run Development Server
```bash
npm run dev
```

Access: http://localhost:3000

---

## 📝 Code Quality Standards

### TypeScript Configuration
```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": false,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### ESLint Configuration
```json
// .eslintrc.json
{
  "extends": ["next/core-web-vitals"],
  "rules": {
    "react-hooks/exhaustive-deps": "warn",
    "@next/next/no-img-element": "off",
    "react/no-unescaped-entities": "off"
  }
}
```

### File Naming Conventions
- **Components:** PascalCase (`ChatInterface.tsx`)
- **Utilities:** kebab-case (`drug-interactions.ts`)
- **Hooks:** camelCase with 'use' prefix (`useConsultation.ts`)
- **Types:** PascalCase (`Prescription.ts`)
- **API Routes:** kebab-case folders (`app/api/groq/triage/route.ts`)

### Component Structure Template
```tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Pill } from 'lucide-react';
import { motion } from 'framer-motion';

interface ComponentProps {
  id: string;
  title: string;
  onAction?: () => void;
}

export function ComponentName({ id, title, onAction }: ComponentProps) {
  // State
  const [isLoading, setIsLoading] = useState(false);

  // Effects
  useEffect(() => {
    // Effect logic
  }, []);

  // Handlers
  const handleClick = () => {
    setIsLoading(true);
    onAction?.();
    setIsLoading(false);
  };

  // Render
  return (
    <Card className="p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.15 }}
      >
        <h3 className="font-semibold text-slate-800">{title}</h3>
        <Button onClick={handleClick} disabled={isLoading}>
          {isLoading ? 'Loading...' : 'Action'}
        </Button>
      </motion.div>
    </Card>
  );
}
```

---

## 🎨 Tailwind Configuration

```javascript
// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['var(--font-plus-jakarta-sans)', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'slide-in-from-bottom': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-in-from-top': {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'shake': {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-4px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(4px)' },
        },
      },
      animation: {
        'slide-in-from-bottom': 'slide-in-from-bottom 0.15s ease-out',
        'slide-in-from-top': 'slide-in-from-top 0.15s ease-out',
        'fade-in': 'fade-in 0.15s ease-out',
        'shake': 'shake 0.5s ease-in-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
```

```css
/* app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222 47% 11%;
    --card: 0 0% 100%;
    --card-foreground: 222 47% 11%;
    --popover: 0 0% 100%;
    --popover-foreground: 222 47% 11%;
    --primary: 166 100% 45%;
    --primary-foreground: 0 0% 100%;
    --secondary: 217 91% 60%;
    --secondary-foreground: 0 0% 100%;
    --muted: 210 40% 96%;
    --muted-foreground: 215 16% 47%;
    --accent: 142 71% 45%;
    --accent-foreground: 0 0% 100%;
    --destructive: 0 84% 60%;
    --destructive-foreground: 0 0% 100%;
    --border: 214 32% 91%;
    --input: 214 32% 91%;
    --ring: 166 100% 45%;
    --radius: 0.75rem;
  }

  .dark {
    --background: 222 47% 11%;
    --foreground: 210 40% 98%;
    --card: 222 47% 11%;
    --card-foreground: 210 40% 98%;
    --popover: 222 47% 15%;
    --popover-foreground: 210 40% 98%;
    --primary: 166 100% 45%;
    --primary-foreground: 0 0% 100%;
    --secondary: 217 91% 60%;
    --secondary-foreground: 0 0% 100%;
    --muted: 217 33% 17%;
    --muted-foreground: 215 20% 65%;
    --accent: 142 71% 45%;
    --accent-foreground: 0 0% 100%;
    --destructive: 0 84% 60%;
    --destructive-foreground: 0 0% 100%;
    --border: 217 33% 17%;
    --input: 217 33% 17%;
    --ring: 166 100% 45%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  }
}

@layer utilities {
  .safe-area-bottom {
    padding-bottom: env(safe-area-inset-bottom);
  }
  
  .animate-in {
    animation-fill-mode: both;
  }
}
```

---

## 🚨 Critical Reminders for AI Agent

### 1. UI/UX Non-Negotiables
- ❌ **NO EMOJIS** in production UI (use Lucide icons only)
- ✅ Card-based chat messages (Style B)
- ✅ Linear pill timeline (Style A)
- ✅ Inline drug interaction warnings (Style C)
- ✅ All animations: 150-180ms duration
- ✅ Minimum tap target: 44x44px
- ✅ Native app feel (bottom nav, FAB, no website elements)

### 2. Technical Requirements
- ✅ Next.js 14 App Router (NOT Pages Router)
- ✅ Server-side Groq API calls (never expose key to client)
- ✅ Supabase Row Level Security enabled
- ✅ TypeScript (not strict mode)
- ✅ Responsive: mobile-first, desktop-optimized
- ✅ localStorage for cart (Supabase for persistent data)

### 3. AI Behavior Rules
- ✅ Minimum 3 questions before giving recommendation
- ✅ Always disclaimer: "AI bukan pengganti dokter"
- ✅ Red flag detection with emergency alert
- ✅ Risk classification: low/moderate/high/emergency
- ✅ AI drafts prescription, doctor MUST approve

### 4. Payment & Security
- ✅ Midtrans Snap integration
- ✅ Webhook signature verification
- ✅ Mock payment first, production-ready schema
- ✅ HTTPS only in production
- ✅ Environment variables for all secrets

### 5. Database Best Practices
- ✅ Use transactions for critical operations
- ✅ Index foreign keys and frequently queried columns
- ✅ Soft deletes for important records (orders, prescriptions)
- ✅ Audit trails (created_at, updated_at)
- ✅ JSONB for flexible/nested data

### 6. Error Handling Pattern
```typescript
try {
  // Operation
  const result = await riskyOperation();
  
  if (!result) {
    toast.error('Operation failed');
    return;
  }
  
  toast.success('Success!');
} catch (error) {
  console.error('Error:', error);
  toast.error('An unexpected error occurred');
  // Optional: Send to error tracking (Sentry)
}
```

### 7. Loading States Pattern
```tsx
// Always show skeleton, never blank screen
{isLoading ? (
  <PrescriptionSkeleton />
) : prescriptions.length === 0 ? (
  <EmptyState />
) : (
  <PrescriptionList data={prescriptions} />
)}
```

---

## 📚 API Documentation

### Groq Triage API
**Endpoint:** `POST /api/groq/triage`

**Request:**
```json
{
  "consultationId": "uuid",
  "messages": [
    {
      "role": "user",
      "content": "Saya demam 2 hari"
    }
  ]
}
```

**Response:** Streaming text/event-stream

---

### Create Prescription
**Endpoint:** `POST /api/prescriptions`

**Request:**
```json
{
  "consultationId": "uuid",
  "diagnosis": "ISPA",
  "medications": [
    {
      "medicationId": "uuid",
      "dosage": "500mg",
      "frequency": "3x sehari",
      "duration": 7,
      "timing": "sesudah makan",
      "instructions": "Minum dengan air putih"
    }
  ],
  "notes": "Istirahat cukup"
}
```

**Response:**
```json
{
  "id": "uuid",
  "status": "draft",
  "prescriptionNumber": "RX-2024-001"
}
```

---

### Check Drug Interactions
**Endpoint:** `POST /api/drug-interactions/check`

**Request:**
```json
{
  "medicationIds": ["uuid1", "uuid2", "uuid3"]
}
```

**Response:**
```json
{
  "interactions": [
    {
      "medication1": { "id": "uuid1", "name": "Paracetamol" },
      "medication2": { "id": "uuid2", "name": "Ibuprofen" },
      "severity": "moderate",
      "description": "...",
      "recommendation": "Minum dengan jeda 4 jam"
    }
  ],
  "hasBlockingInteraction": false
}
```

---

## 🎯 Success Metrics

### User Experience
- ✅ AI response time: < 2 seconds (first token)
- ✅ Page load time: < 1.5 seconds (LCP)
- ✅ Interaction to Next Paint: < 200ms
- ✅ Mobile-friendly: 100% tap targets ≥ 44px

### Technical
- ✅ TypeScript coverage: 100%
- ✅ Zero console errors in production
- ✅ Lighthouse score: > 90 (Performance, Accessibility)
- ✅ SEO score: > 90

### Business
- ✅ Triage completion rate: > 80%
- ✅ Doctor booking conversion: > 30%
- ✅ Prescription fulfillment: > 70%
- ✅ Drug interaction alerts: 0 false negatives

---

## 🚀 Deployment Checklist

### Pre-deployment
- [ ] Run `npm run build` - no errors
- [ ] Run `npm run type-check` - no errors
- [ ] Test all critical flows on mobile
- [ ] Verify all environment variables set
- [ ] Test Midtrans webhook with ngrok
- [ ] Review RLS policies
- [ ] Audit API rate limits

### Vercel Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### Environment Variables (Vercel)
Set in Vercel Dashboard → Settings → Environment Variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GROQ_API_KEY`
- `MIDTRANS_SERVER_KEY`
- `MIDTRANS_CLIENT_KEY`
- `MIDTRANS_IS_PRODUCTION`
- `NEXT_PUBLIC_BASE_URL`

### Post-deployment
- [ ] Test production build
- [ ] Verify Groq API calls work
- [ ] Test Supabase auth flows
- [ ] Verify Midtrans webhook receives events
- [ ] Monitor error logs (Vercel Dashboard)
- [ ] Setup custom domain (optional)

---

## 📞 Support & Resources

### Documentation Links
- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Groq API Docs](https://console.groq.com/docs)
- [Midtrans Docs](https://docs.midtrans.com)
- [shadcn/ui](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com/docs)

### Common Issues & Solutions

**Issue:** Groq API rate limit exceeded
**Solution:** Implement request queuing or upgrade to paid tier

**Issue:** Supabase RLS blocking queries
**Solution:** Check policies with `EXPLAIN` query, verify auth context

**Issue:** Midtrans webhook not receiving events
**Solution:** Verify webhook URL in Midtrans dashboard, check HTTPS

**Issue:** Dark mode not working
**Solution:** Add `<ThemeProvider>` in root layout

---

## ✅ Final Checklist for AI Agent

Before considering the project complete, verify:

- [ ] All 3 UI styles implemented correctly (Chat: B, Timeline: A, Warning: C)
- [ ] NO EMOJIS in any production component
- [ ] Groq API integrated with streaming responses
- [ ] Supabase auth + RLS configured
- [ ] Midtrans payment flow working (at least mock)
- [ ] All animations use 150-180ms duration
- [ ] Mobile responsive with bottom navigation
- [ ] Floating Action Button present
- [ ] Drug interaction checker functional
- [ ] AI asks minimum 3 questions
- [ ] Red flag detection implemented
- [ ] Doctor must approve all prescriptions
- [ ] Error handling on all async operations
- [ ] Loading states (skeleton screens)
- [ ] TypeScript types for all components
- [ ] Environment variables documented
- [ ] Database migrations included
- [ ] README with setup instructions

---

## 🎓 Notes for Future Development

### Potential Enhancements (Post-MVP)
1. **Video Consultation** - Integrate Agora/Twilio
2. **Lab Results Integration** - Upload & OCR
3. **Insurance Claims** - Auto-fill forms
4. **Multi-language Support** - i18n for English
5. **Voice Input** - Web Speech API for elderly
6. **Pharmacy Delivery Tracking** - Real-time GPS
7. **Symptom Checker API** - External medical API
8. **Doctor Ratings & Reviews** - Star system
9. **Appointment Calendar** - Google Calendar sync
10. **Push Notifications** - Firebase Cloud Messaging

### Scalability Considerations
- **Database:** Partition large tables (messages, orders)
- **API:** Implement rate limiting per user
- **Media:** Use CDN for images (Cloudflare/Vercel)
- **Search:** Add Algolia for medication search
- **Analytics:** PostHog or Mixpanel integration
- **Error Tracking:** Sentry for production errors

---

**END OF COMPREHENSIVE BUILD INSTRUCTIONS**

This document provides everything an AI agent like v0.dev needs to build MedLink AI from scratch. Every component, API, database schema, and design specification is documented with exact implementation details.