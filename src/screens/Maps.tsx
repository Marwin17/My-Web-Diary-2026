/*
 * File: Maps.tsx
 * Authors: Marwin Tan, Mary Allison Chen
 * Created: April 29, 2026
 * Description: Component that displays an interactive map using Leaflet for viewing diary entry locations.
 * Copyright: © 2026 My Web Diary Team. All rights reserved.
 */

import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet"
import 'leaflet/dist/leaflet.css';
import { useEffect } from "react"
import { useParams } from "react-router"

// Type definition for map props
type MapProps = {
    loc?: string
}

// Main Map component
function Map({ loc }: MapProps) {
    // Route params fallback for direct map URL usage
    const { loc: routeLoc } = useParams<{ loc?: string }>()
    const actualLoc = loc ?? routeLoc

    console.log('🗺️ Map component mounted, location:', actualLoc)

    // Parse location string into coordinates and zoom
    const parts = actualLoc ? actualLoc.split(',').map(p => p.trim()) : []

    const parsedLat = parts.length > 0 ? parseFloat(parts[0]) : NaN
    const parsedLng = parts.length > 1 ? parseFloat(parts[1]) : NaN
    const parsedZoom = parts.length > 2 ? parseFloat(parts[2]) : NaN

    const lat = Number.isFinite(parsedLat) ? parsedLat : 14.6111512
    const lng = Number.isFinite(parsedLng) ? parsedLng : 120.9749947
    const zoom = Number.isFinite(parsedZoom) ? parsedZoom : 13

    const position = {
        lat,
        lng
    }

    // Component to handle map resizing
    function MapResizeHandler() {
        const map = useMap()

        useEffect(() => {
            setTimeout(() => {
                map.invalidateSize()
            }, 0)
        }, [map])

        return null
    }

    return (
        <MapContainer
            center={position}
            zoom={zoom}
            zoomControl={true}
            scrollWheelZoom={true}
            doubleClickZoom={true}
            touchZoom={true}
            dragging={true}
            keyboard={true}
            style={{
                width: '100%',
                height: '500px'
            }}
        >
            {/* Handle map resizing */}
            <MapResizeHandler />

            {/* Tile layer for map tiles */}
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Marker for the location */}
            <Marker position={position}>
                <Popup>
                    📍 Saved Memory Location
                </Popup>
            </Marker>

        </MapContainer>
    )
}

export default Map