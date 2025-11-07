-- Add supplemental OTC products used by AI triage recommendations
insert into commerce.marketplace_products
    (slug, name, short_description, long_description, price, image_url, categories, tags, rating, rating_count, inventory_status, badges, contraindications)
values
    (
        'ibuprofen-200mg-tablet',
        'Ibuprofen 200 mg Tablet',
        'Anti-inflamasi dosis ringan untuk nyeri dan demam.',
        $$Ibuprofen 200 mg membantu meredakan nyeri ringan hingga sedang serta menurunkan demam. Konsumsi setelah makan dan hindari pemakaian berlebihan pada pasien dengan riwayat tukak lambung.$$,
        24000,
        'https://images.unsplash.com/photo-1580281658629-1796132cc0c3?auto=format&fit=crop&w=1200&q=80',
        ARRAY['Obat'],
        ARRAY['NSAID','nyeri','OTC'],
        4.5,
        162,
        'in-stock',
        ARRAY['OTC'],
        '[]'::jsonb
    ),
    (
        'guaifenesin-200mg-syrup',
        'Expectorant Guaifenesin 200 mg Sirup',
        'Mengencerkan dahak dan meredakan batuk produktif.',
        $$Sirup guaifenesin membantu mengencerkan lendir saluran napas sehingga memudahkan pengeluaran dahak. Konsumsi dengan air putih yang cukup dan hindari penggunaan lebih dari 7 hari tanpa konsultasi dokter.$$,
        42000,
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
        ARRAY['Obat'],
        ARRAY['batuk','pernapasan','OTC'],
        4.4,
        98,
        'in-stock',
        ARRAY['Direkomendasikan'],
        '[]'::jsonb
    ),
    (
        'vitamin-c-100mg-tablet',
        'Vitamin C 100 mg Tablet',
        'Suplemen harian dosis ringan untuk mendukung imun.',
        $$Tablet vitamin C 100 mg cocok sebagai suplementasi harian. Konsumsi setelah makan dan kombinasikan dengan pola hidup sehat untuk manfaat optimal.$$,
        18000,
        'https://images.unsplash.com/photo-1611078489935-0cb964de46d6?auto=format&fit=crop&w=1200&q=80',
        ARRAY['Vitamin'],
        ARRAY['imunitas','harian'],
        4.6,
        210,
        'in-stock',
        ARRAY['OTC'],
        '[]'::jsonb
    ),
    (
        'vitamin-c-500mg-chewable',
        'Vitamin C 500 mg Kunyah',
        'Tablet kunyah rasa jeruk untuk menjaga daya tahan tubuh.',
        $$Suplemen vitamin C 500 mg dalam bentuk tablet kunyah yang praktis. Konsumsi satu tablet setelah makan, maksimal dua kali sehari sesuai kebutuhan.$$,
        32000,
        'https://images.unsplash.com/photo-1611078489935-0cb964de46d6?auto=format&fit=crop&w=1200&q=80',
        ARRAY['Vitamin'],
        ARRAY['imunitas','suplementasi','OTC'],
        4.7,
        187,
        'in-stock',
        ARRAY['Favorit'],
        '[]'::jsonb
    )
on conflict (slug) do nothing;
