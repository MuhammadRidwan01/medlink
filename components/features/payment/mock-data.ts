export type CheckoutItem = {
  id: string;
  productId?: string;
  name: string;
  detail: string;
  quantity: number;
  price: number;
  imageUrl: string;
};

export type Address = {
  id: string;
  label: string;
  recipient: string;
  phone: string;
  addressLine: string;
  city: string;
  postalCode: string;
  notes?: string;
  isDefault?: boolean;
};

export type DeliveryOption = {
  id: string;
  label: string;
  eta: string;
  description: string;
  cost: number;
};

export type PaymentChannel = "virtual_account" | "qris" | "card";

export const MOCK_CHECKOUT_ITEMS: CheckoutItem[] = [
  {
    id: "rx-azithromycin",
    productId: "prod-11",
    name: "Azithromycin 500 mg",
    detail: "10 tablet • Generik",
    quantity: 1,
    price: 95000,
    imageUrl:
      "https://images.unsplash.com/photo-1580281657521-6f48c6f0d441?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "otc-cough",
    productId: "prod-2",
    name: "Sirup Batuk Herbal",
    detail: "Botol 100 mL",
    quantity: 2,
    price: 38000,
    imageUrl:
      "https://images.unsplash.com/photo-1615485290382-43c8d2d82776?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "device-thermometer",
    productId: "prod-20",
    name: "Termometer Digital",
    detail: "Akurasi ±0.1°C",
    quantity: 1,
    price: 125000,
    imageUrl:
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=400&q=80",
  },
];

export const MOCK_ADDRESSES: Address[] = [
  {
    id: "home",
    label: "Rumah",
    recipient: "Ridwa Pratama",
    phone: "+62 812-3456-7890",
    addressLine: "Jl. Melati No. 12",
    city: "Jakarta Selatan",
    postalCode: "12410",
    notes: "Lobby apartemen, satpam sudah diberi tahu.",
    isDefault: true,
  },
  {
    id: "office",
    label: "Kantor",
    recipient: "Ridwa Pratama",
    phone: "+62 812-3456-7890",
    addressLine: "Gedung MedLink Lt. 7, Jl. Jend. Sudirman",
    city: "Jakarta Pusat",
    postalCode: "10210",
  },
];

export const DELIVERY_OPTIONS: DeliveryOption[] = [
  {
    id: "express",
    label: "Express 2 Jam",
    eta: "Tiba ±2 jam",
    description: "Kurir medis dengan penyimpanan dingin.",
    cost: 25000,
  },
  {
    id: "same-day",
    label: "Same Day",
    eta: "Tiba hari ini",
    description: "Kurir reguler dengan tracking real-time.",
    cost: 15000,
  },
  {
    id: "standard",
    label: "Reguler",
    eta: "Tiba 1-2 hari",
    description: "Pengiriman hemat untuk wilayah Jabodetabek.",
    cost: 8000,
  },
];

export const BASE_DISCOUNT = 12000;
