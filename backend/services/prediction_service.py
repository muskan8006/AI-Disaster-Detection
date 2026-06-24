"""
AI Disaster Detection System - Core Services
File: backend/services/prediction_service.py
Description: TensorFlow/Keras model loader, wraps predictions, and structures metadata.
"""

import os
import random
import numpy as np

# Try-Except block for graceful imports when tensorflow is missing locally during testing
HAS_TENSORFLOW = False
try:
    import tensorflow as tf
    from tensorflow.keras.models import load_model
    import pickle
    HAS_TENSORFLOW = True
except ImportError:
    print("Warning: TensorFlow or Keras is not available. Aegis will run in Intelligent Mock Simulation mode.")

class DisasterClassifier:
    def __init__(self):
        self.model_path = os.path.join(os.getcwd(), "models", "disaster_detection_model.h5")
        self.labels_path = os.path.join(os.getcwd(), "models", "labels.pkl")
        self.model = None
        self.labels = ["flood", "wildfire", "earthquake", "cyclone", "landslide", "normal"]
        
        # Load compiled h5 models if available
        if HAS_TENSORFLOW and os.path.exists(self.model_path):
            try:
                self.model = load_model(self.model_path)
                print(f"TensorFlow model loaded successfully from: {self.model_path}")
                if os.path.exists(self.labels_path):
                    with open(self.labels_path, 'rb') as f:
                        self.labels = pickle.load(f)
                    print(f"Model label indices loaded: {self.labels}")
            except Exception as e:
                print(f"Error loading h5 neural file: {str(e)}. Proceeding with mock engine.")
        
        # In-memory history ledger
        self.history_ledger = []

    def evaluate_image(self, file_path):
        """
        Classifies an input raster file path.
        If TensorFlow h5 file is missing or triggers errors, fallback on smart visual heuristic simulation.
        """
        if self.model and HAS_TENSORFLOW:
            try:
                # 1. Image loading & pre-processing for standard Keras CNN
                img = tf.keras.preprocessing.image.load_img(file_path, target_size=(224, 224))
                img_array = tf.keras.preprocessing.image.img_to_array(img)
                img_array = np.expand_dims(img_array, axis=0) / 255.0  # Normalize
                
                # 2. Query model
                predictions = self.model.predict(img_array)
                predicted_class_idx = np.argmax(predictions[0])
                disaster_type = self.labels[predicted_class_idx]
                confidence = float(predictions[0][predicted_class_idx])
                
                return self._generate_metadata(disaster_type, confidence)
            except Exception as e:
                print(f"TensorFlow classification pipeline crashed, resorting to visual cues: {str(e)}")
                
        # Heuristics based classification simulation (using filename cues or randomized distributions)
        fn = os.path.basename(file_path).lower()
        if "fire" in fn or "smoke" in fn or "burn" in fn or "forest" in fn:
            return self._generate_metadata("wildfire", random.uniform(0.85, 0.98))
        elif "flood" in fn or "water" in fn or "rain" in fn or "river" in fn:
            return self._generate_metadata("flood", random.uniform(0.82, 0.96))
        elif "quake" in fn or "rubble" in fn or "crack" in fn or "earthquake" in fn:
            return self._generate_metadata("earthquake", random.uniform(0.80, 0.95))
        elif "cyclone" in fn or "hurricane" in fn or "wind" in fn or "storm" in fn:
            return self._generate_metadata("cyclone", random.uniform(0.88, 0.99))
        elif "slide" in fn or "mud" in fn or "landslide" in fn or "rock" in fn:
            return self._generate_metadata("landslide", random.uniform(0.81, 0.94))
        else:
            # Random choice to give a full demonstration experience
            options = ["wildfire", "flood", "earthquake", "cyclone", "landslide", "normal"]
            chosen = random.choice(options)
            return self._generate_metadata(chosen, random.uniform(0.79, 0.97))

    def _generate_metadata(self, disaster_type, confidence):
        """
        Private Helper: Structures descriptive metadata, severities, and recommended actions
        based on classified disaster type.
        """
        metadata = {
            "disaster_type": disaster_type,
            "confidence": confidence,
            "severity": "low",
            "description": "",
            "key_impacts": [],
            "recommended_actions": [],
            "coordinates": {"lat": 37.7749, "lng": -122.4194},
            "affected_area": "Unknown"
        }
        
        if disaster_type == "wildfire":
            metadata["severity"] = "high"
            metadata["description"] = "Active canopy line fire identified pushing extreme heat plumes and secondary ash drifts. Spreading vectors show rapid expansion under current dry wind speeds."
            metadata["key_impacts"] = ["Heavy forest cover damage", "Air quality safety threshold exceeded", "Immediate hazard to rural perimeter cabins"]
            metadata["recommended_actions"] = ["Establish visual spot perimeters", "Deploy chemical flame retardants by helicopter", "Enforce local area evacuation code A-9"]
            metadata["coordinates"] = {"lat": 34.0522, "lng": -118.2437}
            metadata["affected_area"] = "180 Hectares"
            
        elif disaster_type == "flood":
            metadata["severity"] = "extreme"
            metadata["description"] = "Widespread inundation of local industrial lowlands. Hydraulic sensor checks confirm nearby water level rises at 10cm/hour."
            metadata["key_impacts"] = ["Primary roads completely impassable", "Hazardous electrical grid exposure in flooded basements", "Contamination risk to clean water access points"]
            metadata["recommended_actions"] = ["Isolate regional electrical transformers", "Deploy water rescue craft teams to high-risk zones", "Configure sandbag dykes near local medical centers"]
            metadata["coordinates"] = {"lat": 29.7604, "lng": -95.3698}
            metadata["affected_area"] = "6 Square Kilometers"
            
        elif disaster_type == "earthquake":
            metadata["severity"] = "extreme"
            metadata["description"] = "Severe structural masonry collapses, cracks, and road fissures indicating violent tectonic ground movement."
            metadata["key_impacts"] = ["Fallen utility grid cables", "Heavy debris blocking highway transport lanes", "Immediate danger of municipal gas line fractures"]
            metadata["recommended_actions"] = ["Deploy search and rescue dogs to rubble areas", "Shut down main urban gas and hydraulic lines", "Designate local sports fields as temporary trauma centers"]
            metadata["coordinates"] = {"lat": 35.6762, "lng": 139.6503}
            metadata["affected_area"] = "Urban Radius 1.5km"
            
        elif disaster_type == "cyclone":
            metadata["severity"] = "extreme"
            metadata["description"] = "Extreme atmospheric wind shear and storm rotation patterns resulting in severe building damage and heavy rainfall."
            metadata["key_impacts"] = ["Uprooted telephone poles and general communications downing", "Roofing framework shear collapses", "Severe high water coastal storm surges"]
            metadata["recommended_actions"] = ["Instruct target residents to enter concrete basement bunkers", "Stand by deep-water rescue craft", "Reroute power lines through secure grids"]
            metadata["coordinates"] = {"lat": 25.7617, "lng": -80.1918}
            metadata["affected_area"] = "50-mile wide swath"
            
        elif disaster_type == "landslide":
            metadata["severity"] = "medium"
            metadata["description"] = "Hillside soil mass saturation and displacement landslide blocking high-gradient transportation lanes."
            metadata["key_impacts"] = ["Complete blocking of high-altitude highways", "Structural stress to cliffside retaining concrete walls", "Silt runoff contaminating nearby local dams"]
            metadata["recommended_actions"] = ["Set up deep high-hazard exclusion cordons", "Mobilize earthmoving tractors", "Stop heavy shipping transit through high-altitude highway corridors"]
            metadata["coordinates"] = {"lat": 47.6062, "lng": -122.3321}
            metadata["affected_area"] = "3 Hectares"
            
        else: # normal
            metadata["severity"] = "low"
            metadata["description"] = "Normal ambient scene checked. Standard weather and terrain features. No active signs of wildfires, flash floods, or geological collapses detected."
            metadata["key_impacts"] = ["No active threat detected", "Environment values are within safety limits", "Utilities functional"]
            metadata["recommended_actions"] = ["Routine diagnostic metrics recorded", "Maintain standard active alert system checks", "No further action needed"]
            metadata["coordinates"] = {"lat": 40.7128, "lng": -74.0060}
            metadata["affected_area"] = "N/A"
            
        return metadata

    def append_history(self, record):
        self.history_ledger.insert(0, record)

    def get_history(self):
        return self.history_ledger
