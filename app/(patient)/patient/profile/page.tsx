"use client";

import { useEffect, useState } from "react";
import { PageShell } from "@/components/layout/page-shell";
import { ProfileHeader } from "@/components/features/profile/profile-header";
import { SnapshotBar } from "@/components/features/profile/snapshot-bar";
import { VitalsCard } from "@/components/features/profile/vitals-card";
import { AllergiesCard } from "@/components/features/profile/allergies-card";
import { MedsCard } from "@/components/features/profile/meds-card";
import { ProfileForm } from "@/components/features/profile/profile-form";

export default function PatientProfilePage() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  return (
    <PageShell
      title="Profil Pasien"
      subtitle="Perbarui data dasar, alergi, dan obat untuk sinkronisasi lintas fitur MedLink."
    >
      <div className="space-y-6">
        <ProfileHeader
          name="Ridwa Pratama"
          dob="12 Maret 1993"
          sex="Pria"
          bloodType="O+"
          loading={!hydrated}
        />
        <SnapshotBar />
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          <VitalsCard initialHeightCm={172} initialWeightKg={68} loading={!hydrated} />
          <ProfileForm loading={!hydrated} />
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <AllergiesCard loading={!hydrated} />
          <MedsCard loading={!hydrated} />
        </div>
      </div>
    </PageShell>
  );
}

