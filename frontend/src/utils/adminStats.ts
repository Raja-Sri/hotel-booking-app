export interface AdminStats {
  totalHotels: number;
  totalRooms: number;
  totalUsers: number;
  totalBookings: number;
  activeBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
  projectionRemainingRevenue: number;
  occupancyRatePercent: number;
  monthlyRevenue: Array<{ month: string; revenue: number }>;
  hotelPerformance: Array<Record<string, unknown>>;
}

const EMPTY_STATS: AdminStats = {
  totalHotels: 0,
  totalRooms: 0,
  totalUsers: 0,
  totalBookings: 0,
  activeBookings: 0,
  cancelledBookings: 0,
  totalRevenue: 0,
  projectionRemainingRevenue: 0,
  occupancyRatePercent: 0,
  monthlyRevenue: [],
  hotelPerformance: [],
};

function toNumber(value: unknown): number {
  if (value == null) return 0;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function normalizeMonthlyRevenue(raw: unknown): AdminStats['monthlyRevenue'] {
  if (Array.isArray(raw)) {
    return raw.map((item) => {
      const point = item as Record<string, unknown>;
      return {
        month: String(point.month ?? ''),
        revenue: toNumber(point.revenue),
      };
    });
  }
  return [];
}

/** Normalize Spring or legacy stats payloads into the shape AdminPortal expects. */
export function mapAdminStats(raw: unknown): AdminStats {
  if (!raw || typeof raw !== 'object') {
    return { ...EMPTY_STATS };
  }

  const data = raw as Record<string, unknown>;

  const monthlyRevenue = Array.isArray(data.monthlyRevenue)
    ? normalizeMonthlyRevenue(data.monthlyRevenue)
    : normalizeMonthlyRevenue(data.revenueByMonth);

  return {
    totalHotels: toNumber(data.totalHotels),
    totalRooms: toNumber(data.totalRooms),
    totalUsers: toNumber(data.totalUsers),
    totalBookings: toNumber(data.totalBookings),
    activeBookings: toNumber(data.activeBookings ?? data.confirmedBookings),
    cancelledBookings: toNumber(data.cancelledBookings),
    totalRevenue: toNumber(data.totalRevenue),
    projectionRemainingRevenue: toNumber(data.projectionRemainingRevenue),
    occupancyRatePercent: toNumber(data.occupancyRatePercent ?? data.occupancyRate),
    monthlyRevenue,
    hotelPerformance: Array.isArray(data.hotelPerformance) ? data.hotelPerformance : [],
  };
}
