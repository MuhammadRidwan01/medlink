'use server';

import { getSupabaseServerClient } from '@/lib/supabase/server';

type CheckoutItemInput = {
  slug: string;
  quantity: number;
};

type CheckoutPayload = {
  items: CheckoutItemInput[];
  channel?: string | null;
  snapToken?: string | null;
};

type CheckoutResult = { orderId: string; paymentId: string };

export async function checkoutAction(payload: CheckoutPayload): Promise<CheckoutResult> {
  if (!payload || !Array.isArray(payload.items) || payload.items.length === 0) {
    throw new Error('Keranjang kosong. Tambahkan produk sebelum melakukan checkout.');
  }

  const sanitizedItems = payload.items
    .map((item) => ({
      slug: typeof item.slug === 'string' ? item.slug.trim() : '',
      quantity: typeof item.quantity === 'number' && Number.isInteger(item.quantity) ? item.quantity : 0,
    }))
    .filter((item) => item.slug.length > 0 && item.quantity > 0);

  if (sanitizedItems.length === 0) {
    throw new Error('Data keranjang tidak valid.');
  }

  const supabase = await getSupabaseServerClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    throw authError;
  }

  if (!user) {
    throw new Error('Pengguna belum masuk. Silakan login terlebih dahulu.');
  }

  const slugs = sanitizedItems.map((item) => item.slug);
  const { data: products, error: productError } = await supabase
    .from('marketplace_products')
    .select('id, slug, price')
    .in('slug', slugs);

  if (productError) {
    throw productError;
  }

  if (!products || products.length !== slugs.length) {
    throw new Error('Beberapa produk tidak tersedia. Muat ulang halaman dan coba lagi.');
  }

  const normalizedChannel = payload.channel ? String(payload.channel) : null;
  const normalizedSnapToken = payload.snapToken ? String(payload.snapToken) : null;

  // Call RPC to create order, order_items, payment (and optional cart entries) server-side in DB
  const payloadForRpc = {
    items: sanitizedItems,
    channel: normalizedChannel,
    snap_token: normalizedSnapToken,
  } as const;

  const { data: result, error: rpcError } = await supabase.rpc('create_order_from_items', {
    p_payload: payloadForRpc as any,
  });

  if (rpcError) {
    throw rpcError;
  }

  const orderId = (result as any)?.order_id as string | undefined;
  const paymentId = (result as any)?.payment_id as string | undefined;

  if (!orderId || !paymentId) {
    throw new Error('Checkout gagal di sisi server.');
  }

  return { orderId, paymentId };
}
