# Prescription Approval System Schema

## Overview
The prescription approval system allows AI to recommend both OTC (over-the-counter) and prescription medications, with prescription medications requiring doctor approval before purchase.

## Database Schema Changes

### Table: `public.prescriptions`

#### New Columns

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| `approval_status` | `text` | Status of prescription approval | CHECK: `pending`, `approved`, `rejected`, `modified` |
| `approved_by` | `uuid` | Doctor who approved/rejected | REFERENCES `auth.users(id)` |
| `approved_at` | `timestamptz` | Timestamp of approval/rejection | - |
| `rejection_reason` | `text` | Reason for rejection | - |

#### Indexes

```sql
-- Fast lookup by approval status
CREATE INDEX prescriptions_approval_status_idx 
  ON public.prescriptions (approval_status);

-- Fast lookup for pending approvals by doctor
CREATE INDEX prescriptions_pending_doctor_idx 
  ON public.prescriptions (doctor_id, approval_status) 
  WHERE approval_status = 'pending';
```

---

### Table: `public.prescription_items`

#### New Columns

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| `medication_type` | `text` | Type of medication | CHECK: `otc`, `prescription` |
| `requires_approval` | `boolean` | Requires doctor approval | DEFAULT: `false` |

---

## Approval Status Flow

```
┌─────────────────────────────────────────────┐
│           Prescription Created              │
│         (AI Recommendation)                 │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
         ┌─────────────────┐
         │  Has Rx Items?  │
         └────┬────────┬───┘
              │        │
         Yes  │        │  No
              │        │
              ▼        ▼
      ┌───────────┐  ┌──────────┐
      │  PENDING  │  │ APPROVED │
      └─────┬─────┘  └──────────┘
            │
            │ Doctor Reviews
            │
      ┌─────┴─────┐
      │           │
      ▼           ▼
┌──────────┐  ┌──────────┐
│ APPROVED │  │ REJECTED │
└──────────┘  └──────────┘
      │           │
      │           │
      ▼           ▼
  [Can Buy]   [Cannot Buy]
```

---

## Approval Statuses

### 1. **pending**
- Initial status for prescriptions with Rx items
- Awaiting doctor review
- Patient cannot purchase yet
- Doctor sees in pending queue

### 2. **approved**
- Doctor has reviewed and approved
- Patient can purchase all items
- Prescription is valid
- Can proceed to checkout

### 3. **rejected**
- Doctor has rejected the prescription
- Patient cannot purchase
- `rejection_reason` contains explanation
- Patient should consult doctor directly

### 4. **modified**
- Doctor has modified the prescription
- Original items may be changed
- Patient notified of changes
- New approval may be required

---

## Medication Types

### **OTC (Over-the-Counter)**
```json
{
  "medication_type": "otc",
  "requires_approval": false
}
```

**Examples:**
- Paracetamol
- Ibuprofen
- Antasida
- Vitamin C
- Obat batuk OTC

**Characteristics:**
- ✅ No prescription needed
- ✅ Can buy immediately
- ✅ No doctor approval required
- ✅ Available in marketplace

### **Prescription (Rx)**
```json
{
  "medication_type": "prescription",
  "requires_approval": true
}
```

**Examples:**
- Antibiotik (Amoxicillin, Ciprofloxacin)
- Obat keras (Steroid, dll)
- Obat terkontrol
- Obat dengan efek samping signifikan

**Characteristics:**
- ❌ Requires prescription
- ⏳ Needs doctor approval
- 🔒 Cannot buy without approval
- 👨‍⚕️ Doctor must review

---

## SQL Queries

### Get Pending Prescriptions for Doctor
```sql
SELECT 
  p.id,
  p.patient_id,
  p.created_at,
  p.approval_status,
  COUNT(pi.id) FILTER (WHERE pi.medication_type = 'prescription') as rx_count,
  COUNT(pi.id) FILTER (WHERE pi.medication_type = 'otc') as otc_count
FROM public.prescriptions p
LEFT JOIN public.prescription_items pi ON pi.prescription_id = p.id
WHERE p.doctor_id = 'doctor-uuid'
  AND p.approval_status = 'pending'
GROUP BY p.id
ORDER BY p.created_at DESC;
```

### Approve Prescription
```sql
UPDATE public.prescriptions
SET 
  approval_status = 'approved',
  approved_by = 'doctor-uuid',
  approved_at = NOW()
WHERE id = 'prescription-uuid'
  AND doctor_id = 'doctor-uuid'
  AND approval_status = 'pending';
```

### Reject Prescription
```sql
UPDATE public.prescriptions
SET 
  approval_status = 'rejected',
  approved_by = 'doctor-uuid',
  approved_at = NOW(),
  rejection_reason = 'Alasan penolakan...'
WHERE id = 'prescription-uuid'
  AND doctor_id = 'doctor-uuid'
  AND approval_status = 'pending';
```

### Get Patient's Prescriptions with Status
```sql
SELECT 
  p.*,
  json_agg(
    json_build_object(
      'name', pi.name,
      'type', pi.medication_type,
      'requires_approval', pi.requires_approval,
      'strength', pi.strength,
      'frequency', pi.frequency
    )
  ) as items
FROM public.prescriptions p
LEFT JOIN public.prescription_items pi ON pi.prescription_id = p.id
WHERE p.patient_id = 'patient-uuid'
GROUP BY p.id
ORDER BY p.created_at DESC;
```

---

## API Integration

### Create Prescription with Approval
```typescript
// POST /api/prescriptions/create
{
  "patientId": "uuid",
  "doctorId": "uuid",
  "triageSessionId": "uuid",
  "items": [
    {
      "name": "Paracetamol",
      "medication_type": "otc",
      "requires_approval": false,
      ...
    },
    {
      "name": "Amoxicillin",
      "medication_type": "prescription",
      "requires_approval": true,
      ...
    }
  ]
}

// Response
{
  "prescription": {
    "id": "uuid",
    "approval_status": "pending", // Has Rx items
    "requires_approval": true
  }
}
```

### Request Approval
```typescript
// POST /api/prescriptions/{id}/request-approval
{
  "prescriptionId": "uuid"
}

// Response
{
  "status": "pending",
  "message": "Prescription sent to doctor for approval"
}
```

### Doctor Approve
```typescript
// POST /api/prescriptions/{id}/approve
{
  "prescriptionId": "uuid",
  "doctorId": "uuid"
}

// Response
{
  "status": "approved",
  "approved_at": "2025-10-28T...",
  "approved_by": "doctor-uuid"
}
```

### Doctor Reject
```typescript
// POST /api/prescriptions/{id}/reject
{
  "prescriptionId": "uuid",
  "doctorId": "uuid",
  "reason": "Alasan penolakan..."
}

// Response
{
  "status": "rejected",
  "rejection_reason": "Alasan penolakan..."
}
```

---

## RLS Policies

### Patients
```sql
-- Can view their own prescriptions
CREATE POLICY patient_view_prescriptions
  ON public.prescriptions FOR SELECT
  USING (patient_id = auth.uid());

-- Can create prescriptions (from triage)
CREATE POLICY patient_create_prescriptions
  ON public.prescriptions FOR INSERT
  WITH CHECK (patient_id = auth.uid());
```

### Doctors
```sql
-- Can view prescriptions assigned to them
CREATE POLICY doctor_view_prescriptions
  ON public.prescriptions FOR SELECT
  USING (doctor_id = auth.uid());

-- Can update approval status
CREATE POLICY doctor_approve_prescriptions
  ON public.prescriptions FOR UPDATE
  USING (doctor_id = auth.uid())
  WITH CHECK (doctor_id = auth.uid());
```

---

## Migration Notes

### Backward Compatibility
- Existing prescriptions are set to `approved` status
- Existing prescription_items are set to `otc` type
- No breaking changes to existing data

### Idempotency
- Migration uses `DO $$ BEGIN ... END $$` blocks
- Checks for column existence before adding
- Safe to run multiple times

### Rollback
```sql
-- If needed to rollback
ALTER TABLE public.prescriptions 
  DROP COLUMN IF EXISTS approval_status,
  DROP COLUMN IF EXISTS approved_by,
  DROP COLUMN IF EXISTS approved_at,
  DROP COLUMN IF EXISTS rejection_reason;

ALTER TABLE public.prescription_items
  DROP COLUMN IF EXISTS medication_type,
  DROP COLUMN IF EXISTS requires_approval;
```

---

## Testing

### Test Scenarios

1. **OTC Only**
   - Create prescription with only OTC items
   - Should be auto-approved
   - Can purchase immediately

2. **Rx Only**
   - Create prescription with only Rx items
   - Should be pending
   - Cannot purchase until approved

3. **Mixed OTC + Rx**
   - Create prescription with both types
   - Should be pending (due to Rx)
   - OTC visible but cannot purchase until approval

4. **Doctor Approval**
   - Doctor views pending prescriptions
   - Doctor approves
   - Patient can now purchase

5. **Doctor Rejection**
   - Doctor views pending prescriptions
   - Doctor rejects with reason
   - Patient sees rejection message

---

## Deployment

### Steps
```bash
# 1. Apply migration
supabase db push

# 2. Verify tables
supabase db inspect

# 3. Test queries
psql -h db.xxx.supabase.co -U postgres -d postgres
```

### Verification
```sql
-- Check new columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'prescriptions' 
  AND column_name IN ('approval_status', 'approved_by', 'approved_at', 'rejection_reason');

-- Check indexes
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'prescriptions';
```

---

## Summary

**Added:**
- ✅ Approval status tracking
- ✅ Doctor approval workflow
- ✅ Medication type classification
- ✅ Approval timestamps
- ✅ Rejection reasons
- ✅ Optimized indexes

**Benefits:**
- 🔒 Safe prescription handling
- 👨‍⚕️ Doctor oversight
- 📊 Audit trail
- ⚡ Fast queries
- 🔄 Backward compatible
