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

type CheckoutResult = {
  orderId: string;
  paymentId: string;
  total: number;
};

const isValidUUID = (value: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

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
    .from('commerce.products')
    .select('id, slug, price')
    .in('slug', slugs);

  if (productError) {
    throw productError;
  }

  if (!products || products.length !== slugs.length) {
    throw new Error('Beberapa produk tidak tersedia. Muat ulang halaman dan coba lagi.');
  }

  const productBySlug = new Map(products.map((product) => [product.slug, product]));

  const normalizedChannel = payload.channel ? String(payload.channel) : null;
  const normalizedSnapToken = payload.snapToken ? String(payload.snapToken) : null;

  let cartId: string | null = null;
  let orderId: string | null = null;
  let paymentId: string | null = null;

  try {
    const { data: cart, error: cartError } = await supabase
      .from('commerce.carts')
      .insert({ user_id: user.id })
      .select('id')
      .single();

    if (cartError) {
      throw cartError;
    }

    cartId = cart.id;

    if (!isValidUUID(cartId)) {
      throw new Error('Gagal membuat keranjang.');
    }

    const cartItemsPayload = sanitizedItems.map((item) => {
      const product = productBySlug.get(item.slug);
      if (!product) {
        throw new Error(`Produk ${item.slug} tidak ditemukan.`);
      }
      return {
        cart_id: cartId!,
        product_id: product.id,
        qty: item.quantity,
      };
    });

    const { error: cartItemsError } = await supabase.from('commerce.cart_items').insert(cartItemsPayload);
    if (cartItemsError) {
      throw cartItemsError;
    }

    const total = sanitizedItems.reduce((sum, item) => {
      const product = productBySlug.get(item.slug);
      const rawPrice = product?.price ?? 0;
      const numericPrice = typeof rawPrice === 'number' ? rawPrice : parseFloat(String(rawPrice));
      return sum + numericPrice * item.quantity;
    }, 0);

    const { data: createdOrder, error: orderError } = await supabase
      .from('commerce.orders')
      .insert({
        user_id: user.id,
        total,
        status: 'pending',
      })
      .select('id')
      .single();

    if (orderError) {
      throw orderError;
    }

    orderId = createdOrder.id;

    if (!isValidUUID(orderId)) {
      throw new Error('Gagal membuat pesanan baru.');
    }

    const orderItemsPayload = sanitizedItems.map((item) => {
      const product = productBySlug.get(item.slug);
      if (!product) {
        throw new Error(`Produk ${item.slug} tidak ditemukan.`);
      }

      return {
        order_id: orderId!,
        product_id: product.id,
        qty: item.quantity,
        price: product.price,
      };
    });

    const { error: orderItemsError } = await supabase.from('commerce.order_items').insert(orderItemsPayload);
    if (orderItemsError) {
      throw orderItemsError;
    }

    const { data: payment, error: paymentError } = await supabase
      .from('commerce.payments')
      .insert({
        user_id: user.id,
        order_id: orderId,
        status: 'pending',
        channel: normalizedChannel,
        snap_token: normalizedSnapToken,
      })
      .select('id')
      .single();

    if (paymentError) {
      throw paymentError;
    }

    paymentId = payment.id;

    if (!isValidUUID(paymentId)) {
      throw new Error('Gagal membuat transaksi pembayaran.');
    }

    return {
      orderId,
      paymentId,
      total,
    };
  } catch (error) {
    if (orderId) {
      await supabase.from('commerce.order_items').delete().eq('order_id', orderId);
      await supabase.from('commerce.orders').delete().eq('id', orderId);
    }

    if (cartId) {
      await supabase.from('commerce.cart_items').delete().eq('cart_id', cartId);
      await supabase.from('commerce.carts').delete().eq('id', cartId);
    }

    throw error instanceof Error ? error : new Error('Checkout gagal. Silakan coba lagi.');
  }
}
