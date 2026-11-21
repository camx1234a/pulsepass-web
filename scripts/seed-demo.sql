BEGIN;

DO $$
BEGIN
    IF current_database() NOT IN ('pulsepass', 'pulsepass_e2e') THEN
        RAISE EXCEPTION 'Selecciona la base local pulsepass o pulsepass_e2e.';
    END IF;
END
$$;

INSERT INTO venues (code, name, city, address, capacity, active)
VALUES
    ('VEN-DEMO-SMR', 'Centro de Eventos del Caribe (demo)', 'Santa Marta', 'Avenida del Libertador', 200, TRUE),
    ('VEN-DEMO-CIE', 'Sala de Eventos de Cienaga (demo)', 'Cienaga', 'Centro', 1, TRUE)
ON CONFLICT (code) DO NOTHING;

INSERT INTO events (event_code, name, description, category, status, event_date, minimum_age, venue_id)
SELECT demo.code, demo.name, demo.description, demo.category, demo.status,
       LOCALTIMESTAMP + make_interval(days => demo.days_ahead), demo.minimum_age, venue.id
FROM (VALUES
    ('DEMO-CARIBE', 'Festival Caribe (demo)', 'Evento publico para probar la compra y cancelacion de entradas.', 'MUSIC', 'PUBLISHED', 45, 0, 'VEN-DEMO-SMR'),
    ('DEMO-AFORO', 'Concierto de aforo limitado (demo)', 'Evento con una sola entrada disponible.', 'MUSIC', 'PUBLISHED', 60, 0, 'VEN-DEMO-CIE'),
    ('DEMO-EDAD', 'Noche de musica para mayores de edad (demo)', 'Evento para comprobar la restriccion de edad.', 'MUSIC', 'PUBLISHED', 75, 18, 'VEN-DEMO-SMR'),
    ('DEMO-BORRADOR', 'Encuentro Tecnologico (demo)', 'Evento para probar la publicacion desde el panel de administracion.', 'TECHNOLOGY', 'DRAFT', 90, 0, 'VEN-DEMO-SMR')
) AS demo(code, name, description, category, status, days_ahead, minimum_age, venue_code)
JOIN venues AS venue ON venue.code = demo.venue_code
ON CONFLICT (event_code) DO NOTHING;

INSERT INTO event_artists (event_id, artist_id)
SELECT event.id, artist.id
FROM (VALUES
    ('DEMO-CARIBE', 'Solar Beat'),
    ('DEMO-CARIBE', 'Caribbean Sound'),
    ('DEMO-AFORO', 'Neon Waves')
) AS lineup(event_code, stage_name)
JOIN events AS event ON event.event_code = lineup.event_code
JOIN artists AS artist ON artist.stage_name = lineup.stage_name AND artist.active
ON CONFLICT (event_id, artist_id) DO NOTHING;

COMMIT;

SELECT event.event_code, event.name, event.status, event.event_date, venue.code AS venue_code
FROM events AS event
JOIN venues AS venue ON venue.id = event.venue_id
WHERE event.event_code IN ('DEMO-CARIBE', 'DEMO-AFORO', 'DEMO-EDAD', 'DEMO-BORRADOR')
ORDER BY event.event_code;
