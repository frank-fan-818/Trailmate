<template>
  <div class="travel-map-wrapper" :style="{ height: height }">
    <div ref="mapContainer" class="map-container"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import L from 'leaflet'
import type { TimelineNode } from '@trailmate/perception'
import type { LocationInfo } from '@trailmate/perception'

const MARKER_COLORS: Record<string, string> = {
  attraction: '#EF4444',
  meal: '#F97316',
  hotel: '#3B82F6',
  transport: '#22C55E',
  flight: '#A855F7',
  notification: '#6B7280',
  custom: '#6B7280'
}

const STATUS_LABELS: Record<string, string> = {
  not_started: '未开始',
  in_progress: '进行中',
  completed: '已完成',
  delayed: '已延迟',
  cancelled: '已取消'
}

const props = withDefaults(defineProps<{
  userPosition?: LocationInfo | null
  timelineNodes?: TimelineNode[]
  height?: string
  center?: [number, number]
  zoom?: number
}>(), {
  height: '500px',
  center: () => [39.9042, 116.4074],
  zoom: 13
})

const mapContainer = ref<HTMLDivElement>()
let map: L.Map | null = null
let userMarker: L.Marker | null = null
let poiLayer: L.LayerGroup | null = null
let routePolyline: L.Polyline | null = null

const sortedNodes = computed(() => {
  const nodes = (props.timelineNodes || [])
    .filter(n => n.latitude != null && n.longitude != null)
  return [...nodes].sort((a, b) => {
    if (a.dayIndex !== b.dayIndex) return a.dayIndex - b.dayIndex
    return a.startTime.localeCompare(b.startTime)
  })
})

// ---- pulsing user icon ----
function createUserIcon(): L.DivIcon {
  return L.divIcon({
    className: 'user-pulse-marker',
    html: `<div class="pulse-dot"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  })
}

// ---- numbered POI icon ----
function createPOIIcon(index: number, color: string): L.DivIcon {
  return L.divIcon({
    className: 'poi-marker',
    html: `<div class="poi-circle" style="background:${color}">${index}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  })
}

// ---- popup HTML ----
function buildPopupContent(node: TimelineNode): string {
  const typeLabel = node.type
  const statusLabel = STATUS_LABELS[node.status] || node.status
  return `
    <div class="text-sm" style="min-width:160px">
      <p class="font-bold text-gray-900 mb-1">${node.title}</p>
      <p class="text-gray-500 text-xs">${node.startTime} - ${node.endTime}</p>
      <p class="text-gray-400 text-xs">Day ${node.dayIndex + 1}</p>
      <div class="flex gap-1 mt-2">
        <span class="px-1.5 py-0.5 text-xs rounded bg-gray-100 text-gray-600">${typeLabel}</span>
        <span class="px-1.5 py-0.5 text-xs rounded bg-blue-100 text-blue-700">${statusLabel}</span>
      </div>
    </div>
  `
}

// ---- build POI markers ----
function buildPOIMarkers() {
  if (!poiLayer || !map) return
  poiLayer.clearLayers()

  sortedNodes.value.forEach((node, i) => {
    const color = MARKER_COLORS[node.type] || '#6B7280'
    const icon = createPOIIcon(i + 1, color)
    const marker = L.marker([node.latitude!, node.longitude!], { icon })
    marker.bindPopup(buildPopupContent(node))
    poiLayer!.addLayer(marker)
  })
}

// ---- build route polyline ----
function buildRouteLine() {
  if (!map) return
  if (routePolyline) {
    map.removeLayer(routePolyline)
    routePolyline = null
  }

  const coords = sortedNodes.value.map(n => [n.latitude!, n.longitude!] as [number, number])
  if (coords.length < 2) return

  routePolyline = L.polyline(coords, {
    color: '#60A5FA',
    weight: 3,
    dashArray: '8 6',
    opacity: 0.7
  }).addTo(map)
}

// ---- update user marker ----
function updateUserMarker(pos: LocationInfo) {
  if (!map) return
  if (userMarker) {
    map.removeLayer(userMarker)
  }
  const icon = createUserIcon()
  userMarker = L.marker([pos.latitude, pos.longitude], { icon })
    .bindPopup(`<b>${pos.city}</b><br>${pos.address}`)
    .addTo(map)
  map.flyTo([pos.latitude, pos.longitude], map.getZoom(), { duration: 1.0 })
}

// ---- fit map to show all POIs ----
function fitToAllPOIs() {
  if (!map || sortedNodes.value.length === 0) return
  const bounds = L.latLngBounds(
    sortedNodes.value.map(n => [n.latitude!, n.longitude!] as [number, number])
  )
  map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 })
}

// ---- watch props ----
watch(() => props.userPosition, (pos) => {
  if (pos && map) updateUserMarker(pos)
})

watch(() => props.center, (c) => {
  if (map && c) map.setView(c, map.getZoom())
})

watch(() => props.timelineNodes, () => {
  buildPOIMarkers()
  buildRouteLine()
}, { deep: true })

// ---- lifecycle ----
onMounted(() => {
  if (!mapContainer.value) return

  map = L.map(mapContainer.value, {
    center: props.center,
    zoom: props.zoom,
    zoomControl: true
  })

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19
  }).addTo(map)

  poiLayer = L.layerGroup().addTo(map)

  // Render initial data
  buildPOIMarkers()
  buildRouteLine()

  // If we have timeline but no user position, fit to all POIs on load
  if (!props.userPosition && sortedNodes.value.length > 0) {
    fitToAllPOIs()
  } else if (props.userPosition) {
    updateUserMarker(props.userPosition)
  }
})

onBeforeUnmount(() => {
  if (map) {
    map.remove()
    map = null
  }
})
</script>

<style>
@import 'leaflet/dist/leaflet.css';

.travel-map-wrapper {
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
}

.map-container {
  width: 100%;
  height: 100%;
}

/* ---- User pulse dot ---- */
.user-pulse-marker {
  background: none !important;
  border: none !important;
}

.pulse-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #3B82F6;
  position: relative;
}

.pulse-dot::after {
  content: '';
  position: absolute;
  inset: -8px;
  border-radius: 50%;
  border: 3px solid rgba(59, 130, 246, 0.4);
  animation: pulse-ring 2s cubic-bezier(0, 0, 0.2, 1) infinite;
}

@keyframes pulse-ring {
  0% { transform: scale(0.8); opacity: 1; }
  100% { transform: scale(2.2); opacity: 0; }
}

/* ---- POI numbered circles ---- */
.poi-marker {
  background: none !important;
  border: none !important;
}

.poi-circle {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  color: white;
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
  border: 2px solid white;
}
</style>
