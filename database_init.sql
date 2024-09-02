-- Creazione della tabella "users"
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  role VARCHAR(32) NOT NULL,
  username VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Creazione della tabella "limits"
CREATE TABLE limits (
    vehicle_type VARCHAR(32) PRIMARY KEY,
    good_weather_limits INTEGER NOT NULL,
    bad_weather_limits INTEGER NOT NULL
);

-- Creazione della tabella "vehicles"
CREATE TABLE IF NOT EXISTS vehicles (
  plate VARCHAR(10) PRIMARY KEY,
  vehicle_type VARCHAR(32) NOT NULL,
  id_user INTEGER NOT NULL,
  deleted_at TIMESTAMP NULL,
  FOREIGN KEY (id_user) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (vehicle_type) REFERENCES limits(vehicle_type)
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

-- Creazione del tipo ENUM per le condizioni meteorologiche
CREATE TYPE weather_conditions_enum AS ENUM ('good', 'bad', 'fog');
-- Creazione della tabella "transits"
CREATE TABLE IF NOT EXISTS transits (
  id SERIAL PRIMARY KEY,
  enter_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  exit_at TIMESTAMP NULL,
  plate VARCHAR(10) NOT NULL,
  id_gateway1 INTEGER NOT NULL,
  id_gateway2 INTEGER NOT NULL,
  weather_conditions weather_conditions_enum NOT NULL,
  img_route VARCHAR(255) NOT NULL,
  img_readable BOOLEAN NOT NULL DEFAULT FALSE,
  deleted_at TIMESTAMP NULL,
  FOREIGN KEY (plate) REFERENCES vehicles(plate) ON DELETE CASCADE,
  FOREIGN KEY (id_gateway1, id_gateway2) REFERENCES segments(id_gateway1, id_gateway2) ON DELETE CASCADE
);

-- Creazione della tabella "violations"
CREATE TABLE IF NOT EXISTS violations (
  id SERIAL PRIMARY KEY,
  id_transit INTEGER NOT NULL UNIQUE,
  fine FLOAT NOT NULL,
  average_speed FLOAT NOT NULL,
  delta FLOAT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE,
  FOREIGN KEY (id_transit) REFERENCES transits(id) ON DELETE CASCADE
);

-- PROVA
-- Inserimento di un record nella tabella "users"
INSERT INTO users (role, username, password, deleted_at)
VALUES 
    ('admin', 'john_doe', 'securepassword123', NULL);

-- Inserimento dei limiti di velocità per vari tipi di veicoli sulle autostrade italiane
INSERT INTO limits (vehicle_type, good_weather_limits, bad_weather_limits)
VALUES 
    ('Auto', 130, 110),
    ('Moto', 130, 110),
    ('Autocarro', 80, 80),
    ('Camion', 80, 80),
    ('Autobus', 100, 80),
    ('Camper', 100, 80),
    ('Furgone', 110, 90),
    ('Rimorchio', 80, 80);

-- Inserimento di un record nella tabella "vehicles"
INSERT INTO vehicles (plate, vehicle_type, id_user, deleted_at)
VALUES 
    ('ABC1234', 'Auto', 1, NULL);

-- Inserimento di 2 record nella tabella "gateways"
INSERT INTO gateways (highway_name, kilometer, deleted_at)
VALUES 
    ('A1', 100, NULL),
    ('A1', 200, NULL);

-- Inserimento di un record nella tabella "segments"
INSERT INTO segments (id_gateway1, id_gateway2, distance, deleted_at)
VALUES 
    (1, 2, 50, NULL);

-- Inserimento di un record nella tabella "transits"
INSERT INTO transits (enter_at, exit_at, plate, id_gateway1, id_gateway2, weather_conditions, img_route, img_readable, deleted_at) 
VALUES 
    ('2024-08-29 08:00:00', '2024-08-29 09:00:00', 'ABC1234', 1, 2, 'good', 'path/to/image.jpg', FALSE, NULL),
    ('2024-08-29 08:10:00', '2024-08-29 09:00:00', 'ABC1234', 1, 2, 'good', 'path/to/image.jpg', FALSE, NULL);

-- Inserimento di un record nella tabella "violations"
INSERT INTO violations (id_transit, fine, average_speed, delta, deleted_at)
VALUES 
    (1, 150.00, 140.00, 10.00, NULL);
INSERT INTO violations (id_transit, fine, average_speed, delta, created_at, deleted_at)
VALUES 
    (2, 150.00, 140.00, 10.00, '2024-12-01T00:00:00Z', NULL);




