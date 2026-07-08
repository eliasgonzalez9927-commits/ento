CREATE TABLE ticket_tiers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL, -- Ej: "Preventa 1", "VIP"
    price DECIMAL(10, 2) NOT NULL, -- Precio. 0 significa gratuito/RSVP
    capacity INT NOT NULL, -- Stock disponible para este lote
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

