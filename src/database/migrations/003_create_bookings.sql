-- we could make a user id with referencing to users table
CREATE TABLE IF NOT EXISTS bookings (
    booking_id SERIAL PRIMARY KEY,
    event_id INT REFERENCES events(event_id) ON DELETE CASCADE,
    user_id VARCHAR NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
)