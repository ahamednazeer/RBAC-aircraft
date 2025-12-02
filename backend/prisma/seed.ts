import { PrismaClient, Role, AircraftStatus, MaintenanceStatus, EmergencyStatus, EmergencyType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Create users for each role
    const users = [
        {
            email: 'pilot@aeroops.mil',
            username: 'pilot1',
            password: await bcrypt.hash('pilot123', 10),
            firstName: 'John',
            lastName: 'Mitchell',
            role: Role.PILOT,
        },
        {
            email: 'tech@aeroops.mil',
            username: 'tech1',
            password: await bcrypt.hash('tech123', 10),
            firstName: 'Sarah',
            lastName: 'Johnson',
            role: Role.TECHNICIAN,
        },
        {
            email: 'commander@aeroops.mil',
            username: 'commander',
            password: await bcrypt.hash('cmd123', 10),
            firstName: 'Robert',
            lastName: 'Anderson',
            role: Role.COMMANDER,
        },
        {
            email: 'admin@aeroops.mil',
            username: 'admin',
            password: await bcrypt.hash('admin123', 10),
            firstName: 'Emily',
            lastName: 'Davis',
            role: Role.ADMIN,
        },
        {
            email: 'trainee@aeroops.mil',
            username: 'trainee1',
            password: await bcrypt.hash('trainee123', 10),
            firstName: 'Michael',
            lastName: 'Brown',
            role: Role.TRAINEE,
        },
        {
            email: 'emergency@aeroops.mil',
            username: 'emergency1',
            password: await bcrypt.hash('emer123', 10),
            firstName: 'David',
            lastName: 'Wilson',
            role: Role.EMERGENCY,
        },
        {
            email: 'family@aeroops.mil',
            username: 'family1',
            password: await bcrypt.hash('family123', 10),
            firstName: 'Lisa',
            lastName: 'Martinez',
            role: Role.FAMILY,
        },
        {
            email: 'ops@aeroops.mil',
            username: 'ops1',
            password: await bcrypt.hash('ops123', 10),
            firstName: 'James',
            lastName: 'Bond',
            role: Role.OPS_OFFICER,
        },
    ];

    for (const userData of users) {
        await prisma.user.upsert({
            where: { email: userData.email },
            update: {},
            create: userData,
        });
    }

    console.log('✅ Created 7 users (one for each role)');

    // Create aircraft
    const aircraft = [
        {
            tailNumber: 'AF-001',
            type: 'F-16 Fighting Falcon',
            model: 'F-16C Block 50',
            squadron: '421st Fighter Squadron',
            status: AircraftStatus.READY,
            location: 'Hangar 3',
            fuelLevel: 95.5,
            flightHours: 1250.5,
            lastMaintenance: new Date('2024-11-15'),
            nextMaintenance: new Date('2025-01-15'),
        },
        {
            tailNumber: 'AF-002',
            type: 'F-16 Fighting Falcon',
            model: 'F-16C Block 50',
            squadron: '421st Fighter Squadron',
            status: AircraftStatus.IN_MAINTENANCE,
            location: 'Maintenance Bay 1',
            fuelLevel: 45.0,
            flightHours: 1580.2,
            lastMaintenance: new Date('2024-10-20'),
            nextMaintenance: new Date('2024-12-20'),
        },
        {
            tailNumber: 'AF-003',
            type: 'C-130 Hercules',
            model: 'C-130J Super Hercules',
            squadron: '37th Airlift Squadron',
            status: AircraftStatus.READY,
            location: 'Runway Apron',
            fuelLevel: 88.0,
            flightHours: 3200.0,
            lastMaintenance: new Date('2024-11-25'),
            nextMaintenance: new Date('2025-02-25'),
        },
        {
            tailNumber: 'AF-004',
            type: 'F-35 Lightning II',
            model: 'F-35A',
            squadron: '388th Fighter Wing',
            status: AircraftStatus.READY,
            location: 'Hangar 1',
            fuelLevel: 100.0,
            flightHours: 450.0,
            lastMaintenance: new Date('2024-11-28'),
            nextMaintenance: new Date('2025-02-28'),
        },
        {
            tailNumber: 'AF-005',
            type: 'F-16 Fighting Falcon',
            model: 'F-16C Block 50',
            squadron: '421st Fighter Squadron',
            status: AircraftStatus.GROUNDED,
            location: 'Maintenance Bay 2',
            fuelLevel: 0,
            flightHours: 2100.5,
            lastMaintenance: new Date('2024-09-10'),
            nextMaintenance: new Date('2024-12-10'),
        },
    ];

    for (const aircraftData of aircraft) {
        await prisma.aircraft.upsert({
            where: { tailNumber: aircraftData.tailNumber },
            update: {},
            create: aircraftData,
        });
    }

    console.log('✅ Created 5 aircraft');

    // Get technician user for maintenance logs
    const technician = await prisma.user.findFirst({
        where: { role: Role.TECHNICIAN },
    });

    if (technician) {
        const maintenanceLogs = [
            {
                aircraftId: (await prisma.aircraft.findUnique({ where: { tailNumber: 'AF-002' } }))!.id,
                technicianId: technician.id,
                taskType: 'Engine Inspection',
                description: 'Routine engine inspection and oil change',
                status: MaintenanceStatus.IN_PROGRESS,
                priority: 'HIGH',
                startedAt: new Date(),
                dueDate: new Date('2024-12-05'),
            },
            {
                aircraftId: (await prisma.aircraft.findUnique({ where: { tailNumber: 'AF-005' } }))!.id,
                technicianId: technician.id,
                taskType: 'Hydraulic System Repair',
                description: 'Critical hydraulic system failure - requires immediate attention',
                status: MaintenanceStatus.PENDING,
                priority: 'CRITICAL',
                dueDate: new Date('2024-12-03'),
            },
            {
                aircraftId: (await prisma.aircraft.findUnique({ where: { tailNumber: 'AF-001' } }))!.id,
                technicianId: technician.id,
                taskType: 'Pre-flight Inspection',
                description: 'Standard pre-flight inspection completed',
                status: MaintenanceStatus.COMPLETED,
                priority: 'MEDIUM',
                startedAt: new Date('2024-11-30'),
                completedAt: new Date('2024-12-01'),
            },
        ];

        for (const log of maintenanceLogs) {
            await prisma.maintenanceLog.create({ data: log });
        }

        console.log('✅ Created 3 maintenance logs');
    }

    // Create emergencies
    const emergencies = [
        {
            type: EmergencyType.FIRE,
            title: 'Fire Near Hangar 3',
            description: 'Small electrical fire detected in Hangar 3 storage area',
            location: 'Hangar 3, Storage Room B',
            status: EmergencyStatus.ACTIVE,
            severity: 'HIGH',
        },
        {
            type: EmergencyType.AIRCRAFT_EMERGENCY,
            title: 'Emergency Landing - AF-006',
            description: 'Aircraft AF-006 reporting engine trouble, requesting emergency landing',
            location: 'Runway 09L',
            status: EmergencyStatus.RESOLVING,
            severity: 'CRITICAL',
        },
    ];

    for (const emergency of emergencies) {
        const created = await prisma.emergency.create({ data: emergency });

        // Add timeline events
        await prisma.emergencyTimeline.create({
            data: {
                emergencyId: created.id,
                event: 'Emergency reported',
                description: 'Initial emergency report received',
            },
        });

        console.log(`✅ Created emergency: ${emergency.title}`);
    }

    // Create family content
    const familyContent = [
        {
            category: 'WELFARE',
            title: 'Base Housing Information',
            content: 'Information about on-base housing options, application process, and availability.',
            isPublished: true,
        },
        {
            category: 'SERVICES',
            title: 'Medical Facilities',
            content: 'Base hospital hours: Mon-Fri 8AM-6PM. Emergency services available 24/7.',
            isPublished: true,
        },
        {
            category: 'ANNOUNCEMENTS',
            title: 'Holiday Schedule',
            content: 'Base facilities will operate on reduced hours during the holiday season.',
            isPublished: true,
        },
    ];

    for (const content of familyContent) {
        await prisma.familyContent.create({ data: content });
    }

    console.log('✅ Created 3 family portal content items');

    // Create training modules
    const trainingModules = [
        {
            title: 'Aircraft Safety Procedures',
            description: 'Essential safety procedures for aircraft operations',
            content: 'Comprehensive guide to aircraft safety protocols...',
            duration: 45,
            category: 'SAFETY',
        },
        {
            title: 'Emergency Response Training',
            description: 'Training for emergency response scenarios',
            content: 'Emergency response procedures and protocols...',
            duration: 60,
            category: 'EMERGENCY',
        },
    ];

    for (const module of trainingModules) {
        await prisma.trainingModule.create({ data: module });
    }

    console.log('✅ Created 2 training modules');

    // Create document tags
    const documentTags = [
        {
            name: 'pilot_manual',
            displayName: 'Pilot Manual',
            description: 'Flight operations and pilot procedures',
            category: 'operational',
        },
        {
            name: 'maintenance_sop',
            displayName: 'Maintenance SOP',
            description: 'Standard operating procedures for maintenance',
            category: 'operational',
        },
        {
            name: 'emergency_procedures',
            displayName: 'Emergency Procedures',
            description: 'Emergency response and safety procedures',
            category: 'emergency',
        },
        {
            name: 'training_material',
            displayName: 'Training Material',
            description: 'Training and educational documents',
            category: 'training',
        },
        {
            name: 'welfare_info',
            displayName: 'Welfare Information',
            description: 'Family and welfare support information',
            category: 'welfare',
        },
        {
            name: 'technical_manual',
            displayName: 'Technical Manual',
            description: 'Technical specifications and manuals',
            category: 'operational',
        },
    ];

    for (const tag of documentTags) {
        await prisma.documentTag.upsert({
            where: { name: tag.name },
            update: {},
            create: tag,
        });
    }

    console.log('✅ Created 6 document tags');

    console.log('\n🎉 Database seeding completed!\n');
    console.log('Login credentials:');
    console.log('  Pilot:      pilot1 / pilot123');
    console.log('  Technician: tech1 / tech123');
    console.log('  Commander:  commander / cmd123');
    console.log('  Admin:      admin / admin123');
    console.log('  Trainee:    trainee1 / trainee123');
    console.log('  Emergency:  emergency1 / emer123');
    console.log('  Family:     family1 / family123');
    console.log('  Ops:        ops1 / ops123');
}

main()
    .catch((e) => {
        console.error('Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
