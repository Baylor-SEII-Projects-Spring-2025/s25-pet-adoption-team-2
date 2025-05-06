import React, { useState, useCallback } from "react";
import { GoogleMap, useLoadScript, Marker, StandaloneSearchBox } from "@react-google-maps/api";
import { Typography } from "@mui/material";

const libraries = ["places"];
const mapContainerStyle = { width: "100%", height: "300px" };
const center = { lat: 40.7128, lng: -74.0060 }; // Change to your desired default coordinates

const LocationPicker = ({ onLocationSelect }) => {
    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY, // set your API key in .env file
        libraries,
    });
    
    const [marker, setMarker] = useState(null);
    const [searchBox, setSearchBox] = useState(null);

    const onMapClick = useCallback((event) => {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        setMarker({ lat, lng });
        // Here we pass back a string representation; you can modify this to include more details.
        onLocationSelect(`${lat}, ${lng}`);
    }, [onLocationSelect]);

    const onLoadSearchBox = (ref) => {
        setSearchBox(ref);
    };

    const onPlacesChanged = () => {
        const places = searchBox.getPlaces();
        if (!places || places.length === 0) return;
        const place = places[0];
        const location = place.geometry.location;
        const lat = location.lat();
        const lng = location.lng();
        setMarker({ lat, lng });
        onLocationSelect(place.formatted_address || `${lat}, ${lng}`);
    };

    if (loadError) return <div>Error loading maps</div>;
    if (!isLoaded) return <div>Loading Maps...</div>;

    return (
        <div style={{ position: "relative" }}>
            <StandaloneSearchBox onLoad={onLoadSearchBox} onPlacesChanged={onPlacesChanged}>
                <input
                    type="text"
                    placeholder="Search for an address"
                    style={{
                        boxSizing: "border-box",
                        border: "1px solid transparent",
                        width: "240px",
                        height: "32px",
                        padding: "0 12px",
                        borderRadius: "3px",
                        boxShadow: "0 2px 6px rgba(0, 0, 0, 0.3)",
                        fontSize: "14px",
                        outline: "none",
                        textOverflow: "ellipses",
                        position: "absolute",
                        top: "10px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        zIndex: "10",
                    }}
                />
            </StandaloneSearchBox>
            <GoogleMap
                mapContainerStyle={mapContainerStyle}
                zoom={12}
                center={marker || center}
                onClick={onMapClick}
            >
                {marker && <Marker position={marker} />}
            </GoogleMap>
            {marker && (
                <Typography variant="caption" display="block" sx={{ marginTop: "8px", textAlign: "center" }}>
                    Selected: {onLocationSelect && marker ? `${marker.lat.toFixed(4)}, ${marker.lng.toFixed(4)}` : ""}
                </Typography>
            )}
        </div>
    );
};

export default LocationPicker;