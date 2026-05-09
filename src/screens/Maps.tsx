import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet"

import 'leaflet/dist/leaflet.css';


type MapProps = {
    loc?: string
}

function Map({ loc }: MapProps) {

    const parts = loc ? loc.split(',') : []

    const lat = parts.length > 0
        ? parseFloat(parts[0])
        : 14.6111512

    const lng = parts.length > 1
        ? parseFloat(parts[1])
        : 120.9749947

    const zoom = parts.length > 2
        ? parseFloat(parts[2])
        : 19

    const position = {
        lat: lat,
        lng: lng
    }

    return (
        <MapContainer
            center={position}
            zoom={zoom}
            scrollWheelZoom={false}
            style={{
                width: '100%',
                height: '500px'
            }}
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <Marker position={position}>
                <Popup>
                    A pretty CSS3 popup. <br />
                    Easily customizable.
                </Popup>
            </Marker>
        </MapContainer>
    )
}

export default Map