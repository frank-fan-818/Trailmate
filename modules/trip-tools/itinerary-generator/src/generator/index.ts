import type { Attraction, Flight, Hotel } from '../../../../../adapters/mock-adapter/types'
import type { ItineraryDay, ItineraryItem, ItineraryPlan, ItineraryRequest } from '../types'

const DEFAULT_FAMILY_ATTRACTIONS = [
  {
    id: 'family-attraction-1',
    name: 'Golden Sand Beach',
    address: 'Qingdao West Coast',
    ticketPrice: 0,
    openTime: '09:00',
    closeTime: '18:00',
    rating: 4.7,
    reviewCount: 1200,
    estimatedVisitTime: 180,
    tags: ['family', 'beach']
  },
  {
    id: 'family-attraction-2',
    name: 'Polar Ocean World',
    address: 'Laoshan District, Qingdao',
    ticketPrice: 280,
    openTime: '09:30',
    closeTime: '17:30',
    rating: 4.8,
    reviewCount: 1800,
    estimatedVisitTime: 210,
    tags: ['family', 'ocean']
  },
  {
    id: 'family-attraction-3',
    name: 'Badaguan Scenic Area',
    address: 'Shinan District, Qingdao',
    ticketPrice: 0,
    openTime: '08:00',
    closeTime: '20:00',
    rating: 4.6,
    reviewCount: 900,
    estimatedVisitTime: 150,
    tags: ['walk', 'family']
  },
  {
    id: 'family-attraction-4',
    name: 'Qingdao Beer Museum',
    address: 'Shibei District, Qingdao',
    ticketPrice: 60,
    openTime: '09:00',
    closeTime: '17:00',
    rating: 4.5,
    reviewCount: 700,
    estimatedVisitTime: 120,
    tags: ['museum']
  }
] satisfies Attraction[]

const DEFAULT_ADVENTURE_ATTRACTIONS = [
  {
    id: 'adventure-attraction-1',
    name: 'Zhanqiao Pier',
    address: 'Shinan District, Qingdao',
    ticketPrice: 0,
    openTime: '08:00',
    closeTime: '20:00',
    rating: 4.6,
    reviewCount: 1500,
    estimatedVisitTime: 90,
    tags: ['landmark', 'check-in']
  },
  {
    id: 'adventure-attraction-2',
    name: 'Signal Hill Park',
    address: 'Shibei District, Qingdao',
    ticketPrice: 15,
    openTime: '08:30',
    closeTime: '18:00',
    rating: 4.4,
    reviewCount: 620,
    estimatedVisitTime: 120,
    tags: ['view', 'walk']
  },
  {
    id: 'adventure-attraction-3',
    name: 'May Fourth Square',
    address: 'Shinan District, Qingdao',
    ticketPrice: 0,
    openTime: '00:00',
    closeTime: '23:59',
    rating: 4.5,
    reviewCount: 2100,
    estimatedVisitTime: 90,
    tags: ['landmark', 'night']
  },
  {
    id: 'adventure-attraction-4',
    name: 'Little Fish Hill',
    address: 'Shinan District, Qingdao',
    ticketPrice: 15,
    openTime: '08:00',
    closeTime: '18:00',
    rating: 4.4,
    reviewCount: 580,
    estimatedVisitTime: 90,
    tags: ['view', 'city']
  }
] satisfies Attraction[]

export function generatePlans(
  request: ItineraryRequest,
  flights: Flight[] = [],
  hotels: Hotel[] = [],
  attractions: Attraction[] = []
): ItineraryPlan[] {
  const familyAttractions = pickAttractions(
    attractions,
    ['family', 'beach', 'ocean'],
    DEFAULT_FAMILY_ATTRACTIONS
  )
  const adventureAttractions = pickAttractions(
    attractions,
    ['landmark', 'night', 'view', 'city'],
    DEFAULT_ADVENTURE_ATTRACTIONS
  )

  return [
    buildFamilyPlan(request, flights, hotels, familyAttractions),
    buildAdventurePlan(request, flights, hotels, adventureAttractions)
  ]
}

function buildFamilyPlan(
  request: ItineraryRequest,
  flights: Flight[],
  hotels: Hotel[],
  attractions: Attraction[]
): ItineraryPlan {
  const departureFlight = flights[0]
  const returnFlight = flights[1] ?? flights[0]
  const hotel = hotels[0]

  const days: ItineraryDay[] = [
    {
      day: 1,
      items: [
        createFlightItem('family-day1-flight', departureFlight, '08:00', '10:30', 'Beijing to Qingdao family flight'),
        createTransportItem('family-day1-transport', '10:50', '11:40', 'Airport to hotel transfer'),
        createMealItem('family-day1-lunch', '12:10', '13:00', 'Family seafood lunch', 180),
        createHotelItem('family-day1-hotel', hotel, '13:30', '14:00'),
        createAttractionItem('family-day1-attraction', attractions[0], '15:00', '17:30'),
        createMealItem('family-day1-dinner', '18:10', '19:30', 'Beachfront barbecue dinner', 220)
      ]
    },
    {
      day: 2,
      items: [
        createMealItem('family-day2-breakfast', '08:30', '09:15', 'Hotel breakfast', 0),
        createAttractionItem('family-day2-attraction-1', attractions[1], '10:00', '12:30'),
        createMealItem('family-day2-lunch', '12:50', '13:40', 'Ocean park lunch', 160),
        createAttractionItem('family-day2-attraction-2', attractions[2], '14:20', '16:40'),
        createMealItem('family-day2-dinner', '18:00', '19:15', 'Local family dinner', 180)
      ]
    },
    {
      day: 3,
      items: [
        createMealItem('family-day3-breakfast', '08:30', '09:15', 'Slow breakfast', 0),
        createAttractionItem('family-day3-attraction-1', attractions[3], '10:00', '11:45'),
        createMealItem('family-day3-lunch', '12:15', '13:10', 'Beer street lunch', 150),
        createTransportItem('family-day3-free-time', '14:00', '16:00', 'Free family time and rest', 0),
        createMealItem('family-day3-dinner', '18:00', '19:10', 'Old town dinner', 190)
      ]
    },
    {
      day: 4,
      items: [
        createMealItem('family-day4-breakfast', '08:30', '09:10', 'Breakfast and checkout prep', 0),
        createAttractionItem('family-day4-attraction-1', attractions[0], '09:40', '11:10'),
        createMealItem('family-day4-lunch', '11:40', '12:30', 'Simple departure lunch', 120),
        createTransportItem('family-day4-transport', '13:10', '14:00', 'Hotel to airport transfer'),
        createFlightItem('family-day4-flight', returnFlight, '15:20', '17:40', 'Return flight to Beijing')
      ]
    }
  ]

  return createPlan({
    request,
    suffix: 'family',
    name: 'Family Relaxed 4-Day Trip',
    description: 'A slower rhythm with beach time, ocean experiences, and room for family breaks.',
    tags: ['family', 'relaxed', 'low-walking'],
    totalDays: 4,
    days
  })
}

function buildAdventurePlan(
  request: ItineraryRequest,
  flights: Flight[],
  hotels: Hotel[],
  attractions: Attraction[]
): ItineraryPlan {
  const departureFlight = flights[0]
  const returnFlight = flights[1] ?? flights[0]
  const hotel = hotels[1] ?? hotels[0]

  const days: ItineraryDay[] = [
    {
      day: 1,
      items: [
        createFlightItem('adventure-day1-flight', departureFlight, '07:40', '10:10', 'Early flight to Qingdao'),
        createTransportItem('adventure-day1-transport', '10:40', '11:25', 'Airport express to city hotel'),
        createHotelItem('adventure-day1-hotel', hotel, '11:40', '12:00'),
        createMealItem('adventure-day1-lunch', '12:20', '13:05', 'Quick old-town lunch', 110),
        createAttractionItem('adventure-day1-attraction-1', attractions[0], '13:30', '14:50'),
        createAttractionItem('adventure-day1-attraction-2', attractions[1], '15:30', '17:00'),
        createMealItem('adventure-day1-dinner', '18:10', '19:30', 'Beer street tasting menu', 190)
      ]
    },
    {
      day: 2,
      items: [
        createMealItem('adventure-day2-breakfast', '08:00', '08:40', 'Cafe breakfast', 45),
        createAttractionItem('adventure-day2-attraction-1', attractions[2], '09:20', '10:40'),
        createTransportItem('adventure-day2-transport', '11:00', '11:40', 'Metro to coastal trail'),
        createAttractionItem('adventure-day2-attraction-2', attractions[3], '12:00', '13:20'),
        createMealItem('adventure-day2-lunch', '13:40', '14:25', 'Street food lunch', 90),
        createAttractionItem('adventure-day2-attraction-3', attractions[0], '15:10', '16:20'),
        createMealItem('adventure-day2-dinner', '18:00', '19:10', 'Night market dinner', 130)
      ]
    },
    {
      day: 3,
      items: [
        createMealItem('adventure-day3-breakfast', '08:20', '09:00', 'Hotel breakfast', 0),
        createAttractionItem('adventure-day3-attraction-1', attractions[1], '09:40', '11:10'),
        createMealItem('adventure-day3-lunch', '11:40', '12:30', 'Harbor district lunch', 100),
        createAttractionItem('adventure-day3-attraction-2', attractions[2], '13:20', '15:00'),
        createTransportItem('adventure-day3-transport', '15:30', '16:15', 'Coastline transfer'),
        createMealItem('adventure-day3-dinner', '18:10', '19:30', 'Signature seafood dinner', 210)
      ]
    },
    {
      day: 4,
      items: [
        createMealItem('adventure-day4-breakfast', '08:10', '08:50', 'Checkout breakfast', 0),
        createAttractionItem('adventure-day4-attraction-1', attractions[3], '09:20', '10:30'),
        createMealItem('adventure-day4-lunch', '11:00', '11:50', 'Last stop lunch', 85),
        createTransportItem('adventure-day4-transport', '12:30', '13:15', 'Hotel to airport'),
        createFlightItem('adventure-day4-flight', returnFlight, '14:40', '17:10', 'Return flight to Beijing')
      ]
    }
  ]

  return createPlan({
    request,
    suffix: 'adventure',
    name: 'Explorer Check-in 4-Day Trip',
    description: 'A denser city route focused on landmarks, viewpoints, and food stops.',
    tags: ['explore', 'check-in', 'food'],
    totalDays: 4,
    days
  })
}

function createPlan(params: {
  request: ItineraryRequest
  suffix: string
  name: string
  description: string
  tags: string[]
  totalDays: number
  days: ItineraryDay[]
}): ItineraryPlan {
  return {
    id: `plan_${params.request.id}_${params.suffix}`,
    requestId: params.request.id,
    name: params.name,
    description: params.description,
    tags: params.tags,
    totalDays: params.totalDays,
    totalCost: calculateTotalCost(params.days),
    days: params.days,
    createTime: Date.now()
  }
}

function createFlightItem(
  id: string,
  flight: Flight | undefined,
  startTime: string,
  endTime: string,
  description: string
): ItineraryItem {
  return {
    id,
    type: 'flight',
    name: flight ? `${flight.depCity} -> ${flight.arrCity}` : 'Flight transfer',
    address: flight ? `${flight.depCity} Airport` : 'Airport terminal',
    startTime,
    endTime,
    cost: flight?.price ?? 520,
    description: flight ? `${flight.airline} ${flight.flightNo}` : description
  }
}

function createTransportItem(id: string, startTime: string, endTime: string, name: string, cost = 60): ItineraryItem {
  return {
    id,
    type: 'transport',
    name,
    startTime,
    endTime,
    cost,
    description: 'Local transfer arranged for the current itinerary step.'
  }
}

function createMealItem(id: string, startTime: string, endTime: string, name: string, cost: number): ItineraryItem {
  return {
    id,
    type: 'meal',
    name,
    startTime,
    endTime,
    cost,
    description: 'Recommended dining stop matched to the day plan.'
  }
}

function createHotelItem(id: string, hotel: Hotel | undefined, startTime: string, endTime: string): ItineraryItem {
  return {
    id,
    type: 'hotel',
    name: hotel?.name ?? 'City Center Hotel',
    address: hotel?.address ?? 'Qingdao city center',
    startTime,
    endTime,
    cost: hotel?.price ?? 480,
    description: hotel ? `${hotel.starLevel}-star stay with rating ${hotel.rating}` : 'Comfortable stay close to the main route.'
  }
}

function createAttractionItem(
  id: string,
  attraction: Attraction | undefined,
  startTime: string,
  endTime: string
): ItineraryItem {
  return {
    id,
    type: 'attraction',
    name: attraction?.name ?? 'Scenic stop',
    address: attraction?.address,
    startTime,
    endTime,
    cost: attraction?.ticketPrice ?? 0,
    description: attraction
      ? `Recommended visit window with rating ${attraction.rating} and tags: ${attraction.tags.join(', ')}.`
      : 'Recommended attraction stop for this itinerary.',
    tags: attraction?.tags,
    position: attraction ? { lat: 36.0671, lng: 120.3826 } : undefined
  }
}

function calculateTotalCost(days: ItineraryDay[]): number {
  return days.reduce((sum, day) => {
    return sum + day.items.reduce((dayTotal, item) => dayTotal + item.cost, 0)
  }, 0)
}

function pickAttractions(
  attractions: Attraction[],
  preferredTags: string[],
  fallback: Attraction[]
): Attraction[] {
  const ranked = attractions
    .filter((attraction) => preferredTags.some((tag) => attraction.tags.includes(tag)))
    .slice(0, 4)

  if (ranked.length >= 4) {
    return ranked
  }

  return fallback.slice(0, 4)
}
