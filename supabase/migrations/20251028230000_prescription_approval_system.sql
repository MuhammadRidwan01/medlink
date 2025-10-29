-- Migration: Prescription Approval System
-- Date: 2025-10-28
-- Purpose: Add approval workflow for prescription medications

begin;

-- Add approval status to prescriptions table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'prescriptions' 
    AND column_name = 'approval_status'
  ) THEN
    ALTER TABLE public.prescriptions 
    ADD COLUMN approval_status text 
    CHECK (approval_status IN ('pending', 'approved', 'rejected', 'modified'))
    DEFAULT 'pending';
  END IF;
END $$;

-- Add approved_by column
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'prescriptions' 
    AND column_name = 'approved_by'
  ) THEN
    ALTER TABLE public.prescriptions 
    ADD COLUMN approved_by uuid REFERENCES auth.users(id);
  END IF;
END $$;

-- Add approved_at column
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'prescriptions' 
    AND column_name = 'approved_at'
  ) THEN
    ALTER TABLE public.prescriptions 
    ADD COLUMN approved_at timestamptz;
  END IF;
END $$;

-- Add rejection_reason column
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'prescriptions' 
    AND column_name = 'rejection_reason'
  ) THEN
    ALTER TABLE public.prescriptions 
    ADD COLUMN rejection_reason text;
  END IF;
END $$;

-- Add medication_type to prescription_items
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'prescription_items' 
    AND column_name = 'medication_type'
  ) THEN
    ALTER TABLE public.prescription_items 
    ADD COLUMN medication_type text 
    CHECK (medication_type IN ('otc', 'prescription'))
    DEFAULT 'otc';
  END IF;
END $$;

-- Add requires_approval flag to prescription_items
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'prescription_items' 
    AND column_name = 'requires_approval'
  ) THEN
    ALTER TABLE public.prescription_items 
    ADD COLUMN requires_approval boolean DEFAULT false;
  END IF;
END $$;

-- Create index for approval status queries
CREATE INDEX IF NOT EXISTS prescriptions_approval_status_idx 
  ON public.prescriptions (approval_status);

-- Create index for pending approvals by doctor
CREATE INDEX IF NOT EXISTS prescriptions_pending_doctor_idx 
  ON public.prescriptions (doctor_id, approval_status) 
  WHERE approval_status = 'pending';

-- Add comments for documentation
COMMENT ON COLUMN public.prescriptions.approval_status IS 
'Status of prescription approval: pending (awaiting doctor review), approved (doctor approved), rejected (doctor rejected), modified (doctor modified prescription)';

COMMENT ON COLUMN public.prescriptions.approved_by IS 
'Doctor who approved/rejected the prescription';

COMMENT ON COLUMN public.prescriptions.approved_at IS 
'Timestamp when prescription was approved/rejected';

COMMENT ON COLUMN public.prescriptions.rejection_reason IS 
'Reason for rejection if status is rejected';

COMMENT ON COLUMN public.prescription_items.medication_type IS 
'Type of medication: otc (over-the-counter, no prescription needed) or prescription (requires doctor approval)';

COMMENT ON COLUMN public.prescription_items.requires_approval IS 
'Flag indicating if this specific item requires doctor approval before purchase';

-- Update existing prescriptions to have approved status (backward compatibility)
UPDATE public.prescriptions 
SET approval_status = 'approved', 
    approved_at = created_at 
WHERE approval_status IS NULL OR approval_status = 'pending';

-- Update existing prescription_items to be OTC by default
UPDATE public.prescription_items 
SET medication_type = 'otc', 
    requires_approval = false 
WHERE medication_type IS NULL;

commit;
