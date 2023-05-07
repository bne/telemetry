from sqlalchemy import create_engine

db_string = 'postgres+psycopg2://telemetry/telemetry@localhost/telemetry'

db = create_engine(db_string)

db.execute('''
CREATE TABLE IF NOT EXISTS weather_station (
    time int PRIMARY_KEY,
    rain_mm real,
    wind_max_m_s real,
    wind_avg_m_s real,
    humidity real,
    temperature real);
''')

db.execute('''
CREAT TABLE IF NOT EXISTS envirophat (
    time int PRIMARY_KEY,
    lux real,
    rgb real,
    temperature real,
    pressure real);
''')




