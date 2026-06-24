"""
AI Disaster Detection System - Utility Core
File: backend/utils/helper.py
Description: General purpose helper methods (formatting, coordinate calculations, etc.)
"""

import time
import math

def format_timestamp(epoch_time):
    """
    Converts epoch float timestamps into human-readable local time inscriptions.
    """
    return time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(epoch_time))

def calculate_distance(lat1, lon1, lat2, lon2):
    """
    Calculates distance between two geographical coordinate points in kilometers (Haversine formula).
    """
    # Radius of Earth
    R = 6371.0
    
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
    distance = R * c
    return distance
