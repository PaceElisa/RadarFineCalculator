-- Creazione della tabella "users"
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  role VARCHAR(32) NOT NULL,
  username VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Creazione della tabella "vehicles"
CREATE TABLE IF NOT EXISTS vehicles (
  plate VARCHAR(10) PRIMARY KEY,
  type VARCHAR(32) NOT NULL,
  id_user INTEGER NOT NULL,
  deleted_at TIMESTAMP WITH TIME ZONE,
  FOREIGN KEY (id_user) REFERENCES users(id) ON DELETE CASCADE
);

-- Creazione della tabella "gateways"
CREATE TABLE IF NOT EXISTS gateways (
  id SERIAL PRIMARY KEY,
  highway_name VARCHAR(32) NOT NULL,
  kilometer INTEGER NOT NULL,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Creazione della tabella "segments"
CREATE TABLE IF NOT EXISTS segments (
  id_gateway1 INTEGER NOT NULL,
  id_gateway2 INTEGER NOT NULL,
  distance INTEGER NOT NULL,
  deleted_at TIMESTAMP WITH TIME ZONE,
  PRIMARY KEY (id_gateway1, id_gateway2),
  FOREIGN KEY (id_gateway1) REFERENCES gateways(id) ON DELETE CASCADE,
  FOREIGN KEY (id_gateway2) REFERENCES gateways(id) ON DELETE CASCADE
);

-- Creazione della tabella "transits"
CREATE TABLE IF NOT EXISTS transits (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  plate VARCHAR(10) NOT NULL,
  id_gateway1 INTEGER NOT NULL,
  id_gateway2 INTEGER NOT NULL,
  average_speed FLOAT NOT NULL,
  weather_conditions VARCHAR(32) NOT NULL,
  delta FLOAT NOT NULL,
  img_route VARCHAR(255) NOT NULL,
  img_readable BOOLEAN NOT NULL DEFAULT FALSE,
  deleted_at TIMESTAMP WITH TIME ZONE,
  FOREIGN KEY (plate) REFERENCES vehicles(plate) ON DELETE CASCADE,
  FOREIGN KEY (id_gateway1, id_gateway2) REFERENCES segments(id_gateway1, id_gateway2) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS violations (
  id SERIAL PRIMARY KEY,
  id_transit INTEGER NOT NULL,
  fine FLOAT NOT NULL,
  deleted_at TIMESTAMP WITH TIME ZONE,
  FOREIGN KEY (id_transit) REFERENCES transits(id) ON DELETE CASCADE
);

-- PROVA
-- Inserimento di un record nella tabella "users"
INSERT INTO users (role, username, password, deleted_at)
VALUES ('admin', 'john_doe', 'securepassword123', NULL);

-- Inserimento di un record nella tabella "vehicles"
INSERT INTO vehicles (plate, type, id_user, deleted_at)
VALUES ('ABC1234', 'sedan', 1, NULL);

-- Inserimento di 2 record nella tabella "gateways"
INSERT INTO gateways (highway_name, kilometer, deleted_at)
VALUES 
    ('Highway 101', 100, NULL),
    ('Highway 101', 200, NULL);

-- Inserimento di un record nella tabella "segments"
INSERT INTO segments (id_gateway1, id_gateway2, distance, deleted_at)
VALUES (1, 2, 50, NULL);

-- Inserimento di un record nella tabella "transits"
INSERT INTO transits (created_at, plate, id_gateway1, id_gateway2, average_speed, weather_conditions, delta, img_route, img_readable, deleted_at)
VALUES (CURRENT_TIMESTAMP, 'ABC1234', 1, 2, 80.5, 'Clear', 5.5, 'path/to/image.jpg', TRUE, NULL);

-- Inserimento di un record nella tabella "violations"
INSERT INTO violations (id_transit, fine, deleted_at)
VALUES (1, 150.00, NULL);




