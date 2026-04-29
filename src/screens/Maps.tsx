import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet"

import 'leaflet/dist/leaflet.css';
import { useParams } from "react-router";

function Map() {
    const { loc } = useParams()
    const parts = loc ? loc.split(',') : []
    const lat = parts.length > 0 ? parseInt(parts[0]) : 14.6111512
    const lng = parts.length > 1 ? parseInt(parts[1]) : 120.9749947
    const zoom = parts.length > 2 ? parseInt(parts[2]) : 19
    const position = { lat: lat, lng: lng }
    return (
        <MapContainer center={position} zoom={zoom} scrollWheelZoom={false}
            style={{ width: '100wh', height: 'calc(100vh - 80px)'}}>
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={position}>
                <Popup>
                    A pretty CSS3 popup. <br /> Easily customizable.
                </Popup>
            </Marker>
        </MapContainer>
    )
}

export default Map