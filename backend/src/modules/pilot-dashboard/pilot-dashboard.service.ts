import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { WeatherService } from '../weather/weather.service';

@Injectable()
export class PilotDashboardService {
    constructor(
        private prisma: PrismaService,
        private weatherService: WeatherService,
    ) { }

    async getDashboardData(pilotId: string) {
        // Get pilot's assigned missions (PLANNED or IN_PROGRESS)
        const missions = await this.prisma.client.mission.findMany({
            where: {
                pilotId,
                status: { in: ['PLANNED', 'IN_PROGRESS'] },
            },
            include: {
                aircraft: true,
            },
            orderBy: { startTime: 'asc' },
            take: 5,
        });

        // Get upcoming mission (next one)
        const nextMission = missions[0] || null;

        // Get assigned aircraft (from missions or all ready aircraft if none assigned)
        let assignedAircraft = nextMission?.aircraft || null;

        // If no assigned aircraft from mission, get fleet summary
        const fleetStats = await this.prisma.client.aircraft.groupBy({
            by: ['status'],
            _count: { status: true },
        });

        // Get aircraft with recent maintenance for the assigned aircraft
        let recentMaintenance: any[] = [];
        if (assignedAircraft) {
            recentMaintenance = await this.prisma.client.maintenanceLog.findMany({
                where: { aircraftId: assignedAircraft.id },
                orderBy: { createdAt: 'desc' },
                take: 3,
                include: {
                    technician: {
                        select: {
                            firstName: true,
                            lastName: true,
                        },
                    },
                },
            });
        }

        // Get current base/origin weather
        const weather = await this.weatherService.getLatestSnapshot();

        // Get destination weather if mission has destination coordinates
        let destinationWeather: any = null;
        if (nextMission?.destinationLat && nextMission?.destinationLon) {
            try {
                const destWeather = await this.weatherService.getWeatherForLocation(
                    nextMission.destinationLat,
                    nextMission.destinationLon,
                );
                // Add destination name if available
                destinationWeather = {
                    ...destWeather,
                    locationName: nextMission.destinationName || destWeather.cityName,
                };
            } catch (error) {
                console.error('Failed to fetch destination weather:', error);
                destinationWeather = null;
            }
        }

        // Get active alerts/notifications for this pilot
        const alerts = await this.prisma.client.notification.findMany({
            where: {
                userId: pilotId,
                isRead: false,
            },
            orderBy: { createdAt: 'desc' },
            take: 10,
        });

        // Get active emergencies
        const activeEmergencies = await this.prisma.client.emergency.findMany({
            where: { status: 'ACTIVE' },
            orderBy: { createdAt: 'desc' },
            take: 3,
        });

        // Get system settings for runway status
        const runwayStatus = await this.prisma.client.systemSettings.findUnique({
            where: { key: 'RUNWAY_STATUS' },
        });

        return {
            missions,
            nextMission,
            assignedAircraft,
            fleetStats: this.formatFleetStats(fleetStats),
            recentMaintenance,
            weather,
            destinationWeather,
            alerts,
            activeEmergencies,
            runwayStatus: runwayStatus?.value || 'UNKNOWN',
        };
    }

    private formatFleetStats(stats: any[]) {
        const formatted: Record<string, number> = {
            READY: 0,
            IN_MAINTENANCE: 0,
            GROUNDED: 0,
            IN_FLIGHT: 0,
        };

        stats.forEach((stat) => {
            formatted[stat.status] = stat._count.status;
        });

        return {
            ...formatted,
            total: Object.values(formatted).reduce((a, b) => a + b, 0),
        };
    }

    async acknowledgeMission(missionId: string, pilotId: string) {
        // Verify the mission belongs to this pilot
        const mission = await this.prisma.client.mission.findFirst({
            where: {
                id: missionId,
                pilotId,
            },
        });

        if (!mission) {
            throw new Error('Mission not found or not assigned to this pilot');
        }

        // Update mission status to IN_PROGRESS (acknowledged)
        return this.prisma.client.mission.update({
            where: { id: missionId },
            data: { status: 'IN_PROGRESS' },
            include: { aircraft: true },
        });
    }

    async getAlerts(pilotId: string) {
        const notifications = await this.prisma.client.notification.findMany({
            where: {
                userId: pilotId,
                isRead: false,
            },
            orderBy: { createdAt: 'desc' },
        });

        const emergencies = await this.prisma.client.emergency.findMany({
            where: { status: 'ACTIVE' },
            orderBy: { createdAt: 'desc' },
        });

        return {
            notifications,
            emergencies,
            total: notifications.length + emergencies.length,
        };
    }

    async markAlertRead(alertId: string, pilotId: string) {
        return this.prisma.client.notification.update({
            where: { id: alertId },
            data: { isRead: true },
        });
    }
}
