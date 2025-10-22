import type { PaymentChannel } from "../payment/mock-data";

export type OrderStatus = "placed" | "paid" | "packed" | "shipped" | "delivered" | "canceled";

export type OrderTimelineEntry = {
  status: OrderStatus;
  title: string;
  description?: string;
  timestamp: string;
  note?: string;
};

export type OrderItem = {
  id: string;
  productId: string;
  name: string;
  detail: string;
  imageUrl: string;
  quantity: number;
  price: number;
};

export type OrderAddress = {
  recipient: string;
  phone: string;
  label: string;
  addressLine: string;
  city: string;
  postalCode: string;
  notes?: string;
};

export type CourierInfo = {
  provider: string;
  trackingNumber: string;
  eta: string;
  currentHub: string;
  mapPreviewUrl: string;
};

export type OrderSummary = {
  id: string;
  status: OrderStatus;
  total: number;
  placedAt: string;
  timeline: OrderTimelineEntry[];
  items: OrderItem[];
  address: OrderAddress;
  courier?: CourierInfo;
  paymentChannel: PaymentChannel | "cash_on_delivery";
  subtotal: number;
  shipping: number;
  discount: number;
};

export const MOCK_ORDERS: OrderSummary[] = [
  {
    id: "ORD-239812",
    status: "shipped",
    total: 238000,
    subtotal: 250000,
    shipping: 15000,
    discount: 27000,
    placedAt: "2025-10-20T08:12:00+07:00",
    paymentChannel: "virtual_account",
    address: {
      recipient: "Ridwa Pratama",
      phone: "+62 812-3456-7890",
      label: "Rumah",
      addressLine: "Jl. Melati No. 12",
      city: "Jakarta Selatan",
      postalCode: "12410",
      notes: "Satpam apartemen sudah diberi tahu.",
    },
    items: [
      {
        id: "ord-item-1",
        productId: "rx-azithromycin",
        name: "Azithromycin 500 mg",
        detail: "10 tablet",
        imageUrl:
          "https://images.unsplash.com/photo-1580281657521-6f48c6f0d441?auto=format&fit=crop&w=400&q=80",
        quantity: 1,
        price: 95000,
      },
      {
        id: "ord-item-2",
        productId: "device-thermometer",
        name: "Termometer Digital",
        detail: "Akurasi ±0.1°C",
        imageUrl:
          "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=400&q=80",
        quantity: 1,
        price: 125000,
      },
      {
        id: "ord-item-3",
        productId: "otc-cough",
        name: "Sirup Batuk Herbal",
        detail: "Botol 100 mL",
        imageUrl:
          "https://images.unsplash.com/photo-1615485290382-43c8d2d82776?auto=format&fit=crop&w=400&q=80",
        quantity: 1,
        price: 30000,
      },
    ],
    timeline: [
      {
        status: "placed",
        title: "Pesanan dibuat",
        description: "Pesanan diterima oleh MedLink.",
        timestamp: "2025-10-20T08:12:00+07:00",
      },
      {
        status: "paid",
        title: "Pembayaran dikonfirmasi",
        description: "Pembayaran melalui Virtual Account BNI sukses.",
        timestamp: "2025-10-20T08:15:00+07:00",
      },
      {
        status: "packed",
        title: "Sesi apotek",
        description: "Apotek mitra menyiapkan obat sesuai resep.",
        timestamp: "2025-10-20T10:45:00+07:00",
        note: "Foto dokumentasi tersedia di riwayat konsultasi.",
      },
      {
        status: "shipped",
        title: "Dalam pengiriman",
        description: "Kurir medis menuju alamat Anda.",
        timestamp: "2025-10-20T13:05:00+07:00",
        note: "Kurir bergerak dari hub Pondok Indah.",
      },
    ],
    courier: {
      provider: "MedLink Express",
      trackingNumber: "MLX123456789",
      eta: "Tiba sekitar 16:30 WIB",
      currentHub: "Pondok Indah Hub",
      mapPreviewUrl:
        "https://images.unsplash.com/photo-1529927055075-0fdff126cdb8?auto=format&fit=crop&w=800&q=80",
    },
  },
  {
    id: "ORD-238907",
    status: "delivered",
    total: 152000,
    subtotal: 160000,
    shipping: 8000,
    discount: 16000,
    placedAt: "2025-10-15T09:24:00+07:00",
    paymentChannel: "qris",
    address: {
      recipient: "Ridwa Pratama",
      phone: "+62 812-3456-7890",
      label: "Kantor",
      addressLine: "Gedung MedLink Lt. 7, Jl. Jend. Sudirman",
      city: "Jakarta Pusat",
      postalCode: "10210",
    },
    items: [
      {
        id: "ord-item-4",
        productId: "supp-vitamin",
        name: "Vitamin C Effervescent",
        detail: "10 tablet",
        imageUrl:
          "https://images.unsplash.com/photo-1585436148261-8d9d0d9457c8?auto=format&fit=crop&w=400&q=80",
        quantity: 2,
        price: 40000,
      },
      {
        id: "ord-item-5",
        productId: "device-oximeter",
        name: "Oksimeter Medis",
        detail: "Bluetooth",
        imageUrl:
          "https://images.unsplash.com/photo-1582095133179-2988d3c02e51?auto=format&fit=crop&w=400&q=80",
        quantity: 1,
        price: 80000,
      },
    ],
    timeline: [
      {
        status: "placed",
        title: "Pesanan dibuat",
        timestamp: "2025-10-15T09:24:00+07:00",
      },
      {
        status: "paid",
        title: "Pembayaran diterima",
        description: "Pembayaran melalui QRIS selesai.",
        timestamp: "2025-10-15T09:25:30+07:00",
      },
      {
        status: "packed",
        title: "Dikemas apotek",
        timestamp: "2025-10-15T11:00:00+07:00",
      },
      {
        status: "shipped",
        title: "Dalam pengiriman",
        timestamp: "2025-10-15T13:20:00+07:00",
      },
      {
        status: "delivered",
        title: "Tiba di tujuan",
        description: "Diterima oleh resepsionis kantor.",
        timestamp: "2025-10-15T14:05:00+07:00",
      },
    ],
  },
  {
    id: "ORD-238102",
    status: "canceled",
    total: 99000,
    subtotal: 99000,
    shipping: 0,
    discount: 0,
    placedAt: "2025-10-13T15:50:00+07:00",
    paymentChannel: "card",
    address: {
      recipient: "Ridwa Pratama",
      phone: "+62 812-3456-7890",
      label: "Rumah",
      addressLine: "Jl. Melati No. 12",
      city: "Jakarta Selatan",
      postalCode: "12410",
    },
    items: [
      {
        id: "ord-item-6",
        productId: "rx-antihistamine",
        name: "Cetirizine 10 mg",
        detail: "30 tablet",
        imageUrl:
          "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=400&q=80",
        quantity: 1,
        price: 99000,
      },
    ],
    timeline: [
      {
        status: "placed",
        title: "Pesanan dibuat",
        timestamp: "2025-10-13T15:50:00+07:00",
      },
      {
        status: "paid",
        title: "Pembayaran tertunda",
        description: "Bank belum mengonfirmasi transaksi.",
        timestamp: "2025-10-13T15:55:00+07:00",
      },
      {
        status: "canceled",
        title: "Pesanan dibatalkan",
        description: "Sistem otomatis membatalkan karena pembayaran tidak diterima dalam 2 jam.",
        timestamp: "2025-10-13T17:55:00+07:00",
      },
    ],
  },
];
