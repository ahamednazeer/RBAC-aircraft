import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { AircraftModule } from './modules/aircraft/aircraft.module';
import { MaintenanceModule } from './modules/maintenance/maintenance.module';
import { EmergencyModule } from './modules/emergency/emergency.module';
import { SystemSettingsModule } from './modules/system-settings/system-settings.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { AdminModule } from './modules/admin/admin.module';
import { MissionsModule } from './modules/missions/missions.module';
import { WeatherModule } from './modules/weather/weather.module';

@Module({
  imports: [
    AuthModule,
    AircraftModule,
    MaintenanceModule,
    EmergencyModule,
    SystemSettingsModule,
    DocumentsModule,
    DocumentsModule,
    AdminModule,
    MissionsModule,
    WeatherModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
