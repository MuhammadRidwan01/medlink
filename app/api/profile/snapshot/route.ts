import { NextResponse, type NextRequest } from 'next/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseServerClient } from '@/lib/supabase/server';

type SnapshotProfile = {
  id: string;
  email: string | null;
  name: string | null;
  dob: string | null;
  sex: string | null;
  blood_type: string | null;
  phone: string | null;
  address: string | null;
  height_cm: number | null;
  weight_kg: number | null;
};

type SnapshotAllergy = {
  id: number;
  substance: string;
  reaction: string | null;
  severity: 'mild' | 'moderate' | 'severe';
};

type SnapshotMedication = {
  id: number;
  name: string;
  strength: string | null;
  frequency: string | null;
  status: 'active' | 'stopped';
};

type SnapshotResponse = {
  profile: SnapshotProfile | null;
  allergies: SnapshotAllergy[];
  meds: SnapshotMedication[];
};

type AllergyUpsertBody = {
  entity: 'allergy';
  action: 'upsert';
  record: {
    id?: number | string | null;
    substance: string;
    reaction?: string | null;
    severity: 'mild' | 'moderate' | 'severe';
  };
};

type AllergyDeleteBody = {
  entity: 'allergy';
  action: 'delete';
  id: number | string;
};

type MedicationUpsertBody = {
  entity: 'med';
  action: 'upsert';
  record: {
    id?: number | string | null;
    name: string;
    strength?: string | null;
    frequency?: string | null;
    status?: 'active' | 'stopped';
  };
};

type MedicationDeleteBody = {
  entity: 'med';
  action: 'delete';
  id: number | string;
};

type MedicationStatusBody = {
  entity: 'med';
  action: 'status';
  id: number | string;
  status: 'active' | 'stopped';
};

type ProfileUpsertBody = {
  entity: 'profile';
  action: 'upsert';
  record: {
    email?: string | null;
    name?: string | null;
    dob?: string | null;
    sex?: string | null;
    bloodType?: string | null;
    phone?: string | null;
    address?: string | null;
    heightCm?: number | null;
    weightKg?: number | null;
  };
};

type MutationBody =
  | AllergyUpsertBody
  | AllergyDeleteBody
  | MedicationUpsertBody
  | MedicationDeleteBody
  | MedicationStatusBody
  | ProfileUpsertBody;

const parseId = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number.parseInt(value, 10);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return null;
};

const mapSnapshot = (payload: {
  profile: SnapshotProfile | null;
  allergies: Array<{
    id: number;
    substance: string | null;
    reaction: string | null;
    severity: string | null;
  }>;
  meds: Array<{
    id: number;
    name: string | null;
    strength: string | null;
    frequency: string | null;
    status: string | null;
  }>;
}): SnapshotResponse => {
  const allergies: SnapshotAllergy[] = payload.allergies.map((item) => ({
    id: item.id,
    substance: item.substance ?? '',
    reaction: item.reaction,
    severity:
      item.severity === 'moderate' || item.severity === 'severe'
        ? item.severity
        : 'mild',
  }));

  const meds: SnapshotMedication[] = payload.meds.map((item) => ({
    id: item.id,
    name: item.name ?? '',
    strength: item.strength,
    frequency: item.frequency,
    status: item.status === 'stopped' ? 'stopped' : 'active',
  }));

  return {
    profile: payload.profile,
    allergies,
    meds,
  };
};

const fetchSnapshot = async (
  supabase: SupabaseClient,
  userId: string,
  fallbackProfile: SnapshotProfile | null = null,
): Promise<SnapshotResponse> => {
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle<SnapshotProfile>();

  if (profileError && profileError.code !== 'PGRST116') {
    console.error('[snapshot] profile fetch failed', profileError);
  }

  let profile = profileData ?? fallbackProfile ?? null;

  if (!profile) {
    const bootstrap: Record<string, unknown> = {
      id: userId,
    };

    if (fallbackProfile?.email) {
      bootstrap.email = fallbackProfile.email;
    }
    if (fallbackProfile?.name) {
      bootstrap.name = fallbackProfile.name;
    }
    if (fallbackProfile?.dob) {
      bootstrap.dob = fallbackProfile.dob;
    }
    if (fallbackProfile?.sex) {
      bootstrap.sex = fallbackProfile.sex;
    }
    if (fallbackProfile?.blood_type) {
      bootstrap.blood_type = fallbackProfile.blood_type;
    }
    if (fallbackProfile?.phone) {
      bootstrap.phone = fallbackProfile.phone;
    }
    if (fallbackProfile?.address) {
      bootstrap.address = fallbackProfile.address;
    }

    const { data: insertedProfile, error: insertError } = await supabase
      .from('profiles')
      .upsert(bootstrap, { onConflict: 'id' })
      .select('*')
      .eq('id', userId)
      .maybeSingle<SnapshotProfile>();

    if (insertError) {
      console.error('[snapshot] profile bootstrap failed', insertError);
    } else if (insertedProfile) {
      profile = insertedProfile;
    }
  }

  const { data: allergiesData, error: allergiesError } = await supabase
    .from('allergies')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (allergiesError) {
    console.error('[snapshot] allergies fetch failed', allergiesError);
  }

  const { data: medsData, error: medsError } = await supabase
    .from('meds')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (medsError) {
    console.error('[snapshot] meds fetch failed', medsError);
  }

  return mapSnapshot({
    profile: profile,
    allergies: allergiesData ?? [],
    meds: medsData ?? [],
  });
};

export async function GET() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const snapshot = await fetchSnapshot(supabase, user.id, {
    id: user.id,
    email: user.email ?? null,
    name:
      (user.user_metadata?.full_name as string | undefined) ??
      (user.user_metadata?.name as string | undefined) ??
      null,
    dob: null,
    sex: null,
    blood_type: null,
    phone: (user.user_metadata?.phone as string | undefined) ?? null,
    address: null,
    height_cm: null,
    weight_kg: null,
  });

  return NextResponse.json(snapshot);
}

export async function POST(request: NextRequest) {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  let body: MutationBody | null = null;
  try {
    body = (await request.json()) as MutationBody;
  } catch (_parseError) {
    console.error('[snapshot] JSON parse failed:', _parseError);
    return NextResponse.json({ message: 'Payload must be valid JSON' }, { status: 400 });
  }

  if (!body || typeof body !== 'object' || !('entity' in body)) {
    return NextResponse.json(
      { message: 'Payload must include a valid entity field' },
      { status: 400 },
    );
  }

  try {
    if (body.entity === 'allergy') {
      if (body.action === 'delete') {
        const id = parseId(body.id);
        if (!id) {
          return NextResponse.json({ message: 'ID alergi tidak valid' }, { status: 400 });
        }
        await supabase
          .from('allergies')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id);
      } else if (body.action === 'upsert') {
        const { record } = body;
        const id = parseId(record.id);
        const substance = record.substance?.trim();
        const reaction = record.reaction?.trim() ?? null;
        const severity =
          record.severity === 'moderate' || record.severity === 'severe'
            ? record.severity
            : 'mild';

        if (!substance) {
          return NextResponse.json(
            { message: 'Substansi alergi wajib diisi' },
            { status: 400 },
          );
        }

        const payload: Record<string, unknown> = {
          user_id: user.id,
          substance,
          reaction,
          severity,
        };

        if (id) {
          payload.id = id;
        }

        await supabase
          .from('allergies')
          .upsert(payload, { onConflict: 'id' })
          .select('id')
          .single();
      } else {
        return NextResponse.json({ message: 'Aksi alergi tidak dikenali' }, { status: 400 });
      }
    } else if (body.entity === 'med') {
      if (body.action === 'delete') {
        const id = parseId(body.id);
        if (!id) {
          return NextResponse.json({ message: 'ID obat tidak valid' }, { status: 400 });
        }
        await supabase.from('meds').delete().eq('id', id).eq('user_id', user.id);
      } else if (body.action === 'status') {
        const id = parseId(body.id);
        if (!id) {
          return NextResponse.json({ message: 'ID obat tidak valid' }, { status: 400 });
        }
        const status = body.status === 'stopped' ? 'stopped' : 'active';
        await supabase
          .from('meds')
          .update({ status })
          .eq('id', id)
          .eq('user_id', user.id);
      } else if (body.action === 'upsert') {
        const { record } = body;
        const id = parseId(record.id);
        const name = record.name?.trim();
        const strength = record.strength?.trim() ?? null;
        const frequency = record.frequency?.trim() ?? null;
        const status = record.status === 'stopped' ? 'stopped' : 'active';

        if (!name) {
          return NextResponse.json(
            { message: 'Nama obat wajib diisi' },
            { status: 400 },
          );
        }

        const payload: Record<string, unknown> = {
          user_id: user.id,
          name,
          strength,
          frequency,
          status,
        };

        if (id) {
          payload.id = id;
        }

        await supabase
          .from('meds')
          .upsert(payload, { onConflict: 'id' })
          .select('id')
          .single();
      } else {
        return NextResponse.json({ message: 'Aksi obat tidak dikenali' }, { status: 400 });
      }
    } else if (body.entity === 'profile') {
      if (body.action !== 'upsert') {
        return NextResponse.json({ message: 'Aksi profil tidak dikenali' }, { status: 400 });
      }

      const { record } = body;

      const payload: Record<string, unknown> = { id: user.id };

      if (record.email !== undefined) {
        payload.email = record.email?.trim() ?? null;
      }

      if (record.name !== undefined) {
        payload.name = record.name?.trim() ?? null;
      }

      if (record.dob !== undefined) {
        if (record.dob === null || record.dob === '') {
          payload.dob = null;
        } else {
          const parsed = new Date(record.dob);
          if (Number.isNaN(parsed.getTime())) {
            return NextResponse.json({ message: 'Tanggal lahir tidak valid' }, { status: 400 });
          }
          payload.dob = parsed.toISOString().slice(0, 10);
        }
      }

      if (record.sex !== undefined) {
        if (!record.sex) {
          payload.sex = null;
        } else {
          const normalizedSex = record.sex.toLowerCase();
          if (['male', 'female', 'unspecified'].includes(normalizedSex)) {
            payload.sex = normalizedSex;
          } else {
            return NextResponse.json({ message: 'Jenis kelamin tidak valid' }, { status: 400 });
          }
        }
      }

      if (record.bloodType !== undefined) {
        if (!record.bloodType) {
          payload.blood_type = null;
        } else {
          const normalizedBt = record.bloodType.trim().toUpperCase();
          if (!/^(A|B|AB|O)[+-]?$/.test(normalizedBt)) {
            return NextResponse.json({ message: 'Golongan darah tidak valid' }, { status: 400 });
          }
          payload.blood_type = normalizedBt;
        }
      }

      if (record.phone !== undefined) {
        payload.phone = record.phone?.trim() ?? null;
      }

      if (record.address !== undefined) {
        payload.address = record.address?.trim() ?? null;
      }

      if (record.heightCm !== undefined) {
        const h = record.heightCm;
        if (h === null || h === undefined || Number.isNaN(Number(h))) {
          payload.height_cm = null;
        } else {
          const hv = Number(h);
          if (hv < 30 || hv > 250) {
            return NextResponse.json({ message: 'Tinggi tidak masuk akal' }, { status: 400 });
          }
          payload.height_cm = hv;
        }
      }

      if (record.weightKg !== undefined) {
        const w = record.weightKg;
        if (w === null || w === undefined || Number.isNaN(Number(w))) {
          payload.weight_kg = null;
        } else {
          const wv = Number(w);
          if (wv < 20 || wv > 300) {
            return NextResponse.json({ message: 'Berat tidak masuk akal' }, { status: 400 });
          }
          payload.weight_kg = wv;
        }
      }

      await supabase
        .from('profiles')
        .upsert(payload, { onConflict: 'id' })
        .select('id')
        .single();
    } else {
      return NextResponse.json({ message: 'Entitas tidak didukung' }, { status: 400 });
    }
  } catch (error) {
    console.error('[snapshot] mutation failed', error);
    return NextResponse.json(
      { message: 'Gagal memperbarui snapshot. Coba lagi nanti.' },
      { status: 500 },
    );
  }

  const snapshot = await fetchSnapshot(supabase, user.id);
  return NextResponse.json(snapshot);
}
