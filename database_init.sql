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
  id SERIAL PRIMARY KEY,
  id_gateway1 INTEGER NOT NULL,
  id_gateway2 INTEGER NOT NULL,
  distance INTEGER NOT NULL,
  deleted_at TIMESTAMP WITH TIME ZONE,
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
  id_segment INTEGER NOT NULL,
  weather_conditions weather_conditions_enum NOT NULL,
  img_route VARCHAR(255) NULL,
  img_readable BOOLEAN NOT NULL DEFAULT FALSE,
  deleted_at TIMESTAMP NULL,
  FOREIGN KEY (plate) REFERENCES vehicles(plate) ON DELETE CASCADE,
  FOREIGN KEY (id_segment) REFERENCES segments(id) ON DELETE CASCADE
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

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Creazione della tabella "payments"
CREATE TABLE payments (
    uuid UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_violation INTEGER NOT NULL UNIQUE,
    is_payed BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (id_violation) REFERENCES violations(id) ON DELETE CASCADE
);

-- PROVA
-- Inserimento di un record nella tabella "users"
INSERT INTO users (role, username, password, deleted_at)
VALUES 
    ('test', 'unreadable', 'password', NULL), -- used to store a "unreadable" plate
    ('admin', 'mario_rossi', 'password', NULL),
    ('admin', 'giuseppe_verdi', 'password', NULL),
    ('driver', 'francesco_bianchi', 'password', NULL),
    ('driver', 'luigi_ferrari', 'password', NULL),
    ('driver', 'andrea_conti', 'password', NULL),
    ('driver', 'roberto_esposito', 'password', NULL),
    ('driver', 'alessandro_galli', 'password', NULL),
    ('driver', 'marco_pellegrini', 'password', NULL),
    ('driver', 'luca_martini', 'password', NULL);

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
    ('ZZ999ZZ', 'Auto', 1, NULL),
    ('AB123AB', 'Auto', 4, NULL),
    ('AA123AA', 'Auto', 4, NULL),
    ('DL900DD', 'Moto', 5, NULL),
    ('DZ098FL', 'Autocarro', 5, NULL),
    ('FF604FF', 'Camion', 6, NULL),
    ('FZ988ZA', 'Camper', 7, NULL),
    ('CG420GG', 'Furgone', 7, NULL),
    ('CJ010GT', 'Rimorchio', 8, NULL),
    ('PO000GG', 'Moto', 8, NULL),
    ('DI400DI', 'Auto', 9, NULL),
    ('CC123CC', 'Autobus', 10, NULL);

-- Inserimento di 2 record nella tabella "gateways"
INSERT INTO gateways (highway_name, kilometer, deleted_at)
VALUES 
    ('A1', 30, NULL),
    ('A1', 60, NULL),
    ('A1', 90, NULL),
    ('A1', 120, NULL),
    ('A1', 150, NULL),
    ('A1', 180, NULL),
    ('A1', 200, NULL),
    ('A1', 230, NULL),
    ('A2', 20, NULL),
    ('A2', 50, NULL),
    ('A2', 80, NULL),
    ('A2', 120, NULL),
    ('A2', 200, NULL),
    ('A2', 250, NULL),
    ('A3', 100, NULL),
    ('A3', 150, NULL),
    ('A3', 200, NULL),
    ('A3', 240, NULL),
    ('A4', 50, NULL),
    ('A4', 150, NULL),
    ('A4', 180, NULL),
    ('A4', 200, NULL),
    ('A5', 50, NULL),
    ('A5', 100, NULL),
    ('A5', 150, NULL),
    ('A5', 180, NULL);

-- Inserimento di un record nella tabella "segments"
INSERT INTO segments (id_gateway1, id_gateway2, distance, deleted_at)
VALUES 
    (1, 2, 30, NULL),
    (3, 4, 30, NULL), 
    (5, 6, 30, NULL),
    (7, 8, 30, NULL),
    (9, 10, 30, NULL),
    (11, 12, 40, NULL),
    (13, 14, 50, NULL),
    (15, 16, 50, NULL),
    (17, 18, 40, NULL),
    (19, 20, 100, NULL),
    (21, 22, 20, NULL),
    (23, 24, 50, NULL);

-- Inserimento di un record nella tabella "transits"
INSERT INTO transits (enter_at, exit_at, plate, id_segment, weather_conditions, img_route, img_readable, deleted_at) 
VALUES 
    ('2024-08-29 08:00:00', '2024-08-29 08:20:00', 'AB123AB', 5, 'good', NULL, FALSE, NULL),
    ('2024-08-29 08:10:00', '2024-08-29 08:40:00', 'AA123AA', 3, 'good', NULL, FALSE, NULL),
    ('2024-08-29 08:20:00', '2024-08-29 08:50:00', 'DL900DD', 7, 'good', NULL, FALSE, NULL),
    ('2024-08-29 08:30:00', '2024-08-29 08:50:00', 'DZ098FL', 9, 'good', NULL, FALSE, NULL),
    ('2024-08-29 08:40:00', '2024-08-29 09:00:00', 'FF604FF', 10, 'good', NULL, FALSE, NULL),
    ('2024-08-29 08:50:00', '2024-08-29 09:02:00', 'FZ988ZA', 1, 'good', 'plate1.png', FALSE, NULL),
    ('2024-08-29 09:00:00', '2024-08-29 09:20:00', 'CG420GG', 2, 'good', NULL, FALSE, NULL),
    ('2024-08-29 08:10:00', '2024-08-29 08:23:00', 'CJ010GT', 4, 'good', NULL, FALSE, NULL),
    ('2024-08-29 08:20:00', NULL, 'PO000GG', 8, 'good', NULL, FALSE, NULL),
    ('2024-08-29 08:10:00', NULL, 'DI400DI', 6, 'bad', NULL, FALSE, NULL),
    ('2024-08-29 08:20:00', '2024-08-29 08:50:00', 'CC123CC', 11, 'good', NULL, FALSE, NULL),
    ('2024-08-29 08:30:00', NULL, 'CC123CC', 12, 'fog', NULL, FALSE, NULL);

-- Inserimento di un record nella tabella "violations"
INSERT INTO violations (id_transit, fine, average_speed, delta, created_at, deleted_at)
VALUES 
    (6, 200.00, 150.00, 20.00, '2024-08-29T10:00:00Z', NULL),
    (8, 50.00, 138.00, 10.00, '2024-09-01T00:00:00Z', NULL);

INSERT INTO payments (id_violation)
VALUES 
    (1),
    (2);


