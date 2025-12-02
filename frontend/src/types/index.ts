export type Role = 'PILOT' | 'TECHNICIAN' | 'COMMANDER' | 'ADMIN' | 'TRAINEE' | 'EMERGENCY' | 'FAMILY';

export type AircraftStatus = 'READY' | 'IN_MAINTENANCE' | 'GROUNDED' | 'IN_FLIGHT';

export type MaintenanceStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export type EmergencyStatus = 'ACTIVE' | 'RESOLVING' | 'COMPLETED';

export type EmergencyType = 'FIRE' | 'RUNWAY_INCURSION' | 'AIRCRAFT_EMERGENCY' | 'MEDICAL' | 'SECURITY' | 'WEATHER' | 'OTHER';

export interface User {
    id: string;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    role: Role;
    isActive: boolean;
}

export interface Aircraft {
    id: string;
    tailNumber: string;
    type: string;
    model: string;
    squadron?: string;
    status: AircraftStatus;
    location?: string;
    fuelLevel?: number;
    flightHours: number;
    lastMaintenance?: string;
    nextMaintenance?: string;
}

export interface MaintenanceLog {
    id: string;
    aircraftId: string;
    technicianId: string;
    taskType: string;
    description: string;
    status: MaintenanceStatus;
    priority?: string;
    startedAt?: string;
    completedAt?: string;
    dueDate?: string;
    notes?: string;
    aircraft?: Aircraft;
    technician?: User;
}

export interface Emergency {
    id: string;
    type: EmergencyType;
    title: string;
    description: string;
    location: string;
    status: EmergencyStatus;
    severity: string;
    createdAt: string;
    updatedAt: string;
    resolvedAt?: string;
}

export interface Notification {
    id: string;
    userId: string;
    title: string;
    message: string;
    type: 'INFO' | 'WARNING' | 'EMERGENCY' | 'SUCCESS';
    isRead: boolean;
    createdAt: string;
}
