from geopy.geocoders import Nominatim
import pandas as pd
import time

df = pd.read_csv("spots.csv")
geolocator = Nominatim(user_agent="geoapi")

lats = []
lons = []

for name in df["name"]:
    try:
        location = geolocator.geocode(name + ", Japan")
        if location:
            lats.append(location.latitude)
            lons.append(location.longitude)
        else:
            lats.append(None)
            lons.append(None)
        time.sleep(1)  # サーバー負荷対策（重要）
    except:
        lats.append(None)
        lons.append(None)

df["lat"] = lats
df["lon"] = lons

df.to_csv("spots_with_coords.csv", index=False)