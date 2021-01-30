#!/usr/bin/env python

import logging
import time
import sys
import json
import apsw
import os
from envirophat import light, weather, leds

SQLITE_DB_PATH = '/home/ben/weather.sqlite'
logger = logging.getLogger(__name__)


if __name__ == "__main__":

    if not os.path.exists(SQLITE_DB_PATH):
        with open(SQLITE_DB_PATH, 'w'): pass

    conn = apsw.Connection(SQLITE_DB_PATH)
    cursor = conn.cursor()

    cursor.execute('''
CREATE TABLE IF NOT EXISTS weather (
    time int PRIMARY KEY,
    rain_mm real,
    wind_max_m_s real,
    wind_avg_m_s real,
    humidity real,
    temp_outdoor real,
    wind_dir_deg real,
    lux_indoor real,
    rgb_indoor text,
    temp_indoor real,
    pressure real
);''')    

    while True:
        line = sys.stdin.readline()
        if not line:
            break

        try:
            data = json.loads(line)
            data['time'] = str(time.time()).split('.')[0]
            data['lux_indoor'] = light.light()
            leds.on()
            data['rgb_indoor'] = str(light.rgb())[1:-1].replace(' ', '')
            leds.off()
            data['temp_indoor'] = weather.temperature()
            data['pressure'] = weather.pressure()
            logger.debug(json.dumps(data))
            cursor.execute("insert into weather values(:time, :rain_mm, :wind_max_m_s, :wind_avg_m_s, :humidity, :temperature_C, :wind_dir_deg, :lux_indoor, :rgb_indoor, :temp_indoor, :pressure)", data)

        except KeyError:
            pass
        except ValueError:
            pass


