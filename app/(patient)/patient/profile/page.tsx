"use client";

import { useEffect, useMemo, useState } from "react";
import { PageShell } from "@/components/layout/page-shell";
import { ProfileHeader } from "@/components/features/profile/profile-header";
import { SnapshotBar } from "@/components/features/profile/snapshot-bar";
import { User } from "lucide-react";
import { VitalsCard } from "@/components/features/profile/vitals-card";
import { AllergiesCard } from "@/components/features/profile/allergies-card";
import { MedsCard } from "@/components/features/profile/meds-card";
import { ProfileForm } from "@/components/features/profile/profile-form";
import { useProfileStore } from "@/components/features/profile/store";

export default function PatientProfilePage() {
  const [hydrated, setHydrated] = useState(false);
  const profile = useProfileStore((state) => state.profile);
  const loadingStore = useProfileStore((state) => state.loading);

  useEffect(() => {
    setHydrated(true);
    void useProfileStore
      .getState()
      .fetchSnapshot()
      .catch((error) =>
        console.error("[patient/profile] failed to refresh snapshot", error),
      );
  }, []);

  const profileMissingFields = useMemo(() => {
    if (!hydrated || loadingStore) {
      return [] as string[];
    }

    const missing: string[] = [];
    if (!profile?.name) missing.push("Nama");
    if (!profile?.dob) missing.push("Tanggal lahir");
    if (!profile?.sex) missing.push("Jenis kelamin");
    if (!profile?.bloodType) missing.push("Golongan darah");
    if (!profile?.phone) missing.push("Nomor telepon");
    if (!profile?.address) missing.push("Alamat");

    return missing;
  }, [
    hydrated,
    loadingStore,
    profile?.address,
    profile?.bloodType,
    profile?.dob,
    profile?.name,
    profile?.phone,
    profile?.sex,
  ]);

  const headerProps = useMemo(() => {
    const fallbackSex = "Pria" as const;
    const mapSex = (value: string | null) => {
      if (!value) return fallbackSex;
      const normalized = value.toLowerCase();
      if (normalized.startsWith("f")) {
        return "Wanita" as const;
      }
      if (normalized.startsWith("m")) {
        return "Pria" as const;
      }
      return fallbackSex;
    };

    const formatDob = (value: string | null) => {
      if (!value) {
        return "Tanggal lahir belum diisi";
      }
      try {
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
          return "Tanggal lahir belum diisi";
        }
        return new Intl.DateTimeFormat("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }).format(date);
      } catch {
        return "Tanggal lahir belum diisi";
      }
    };

    return {
      name: profile?.name ?? "Pasien MedLink",
      dob: formatDob(profile?.dob ?? null),
      sex: mapSex(profile?.sex ?? null),
      bloodType: profile?.bloodType ?? "Belum diisi",
    };
  }, [profile]);

  const isLoading = !hydrated || loadingStore;

  return (
    <>
      <PageShell
        title="Profil Pasien"
        subtitle="Perbarui data dasar, alergi, dan obat untuk sinkronisasi lintas fitur MedLink."
      >
        <div className="space-y-6">
          <ProfileHeader
            name={headerProps.name}
            dob={headerProps.dob}
            sex={headerProps.sex}
            bloodType={headerProps.bloodType}
            loading={isLoading}
          />
          {profileMissingFields.length ? (
            <div className="flex flex-col gap-3 rounded-card border border-primary/40 bg-primary/5 p-4 text-sm text-foreground shadow-sm">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-button bg-primary/15 text-primary">
                  <User className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-primary">
                    Lengkapi data dasar Anda
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {profileMissingFields.slice(0, 4).join(", ")}
                    {profileMissingFields.length > 4
                      ? " dan informasi lainnya belum terisi."
                      : " masih kosong."}
                  </p>
                </div>
              </div>
            </div>
          ) : null}
          <SnapshotBar />
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
            <VitalsCard initialHeightCm={172} initialWeightKg={68} loading={isLoading} />
            <ProfileForm loading={isLoading} />
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <AllergiesCard loading={isLoading} />
            <MedsCard loading={isLoading} />
          </div>
        </div>
      </PageShell>
    </>
  );
}
