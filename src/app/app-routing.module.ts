
// src/app/app-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/components/main-layout/main-layout.component';
import { AuthGuard } from './core/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadChildren: () => import('./features/dashboard/dashboard.module').then(m => m.DashboardModule)
      },
      {
        path: 'cases',
        loadChildren: () => import('./features/cases/cases.module').then(m => m.CasesModule)
      },
      {
        path: 'sessions',
        loadChildren: () => import('./features/sessions/sessions.module').then(m => m.SessionsModule)
      },
      {
        path: 'appointments',
        loadChildren: () => import('./features/appointments/appointments.module').then(m => m.AppointmentsModule)
      },
      {
        path: 'assessments',
        loadChildren: () => import('./features/assessments/assessments.module').then(m => m.AssessmentsModule)
      },
      {
        path: 'documents',
        loadChildren: () => import('./features/documents/documents.module').then(m => m.DocumentsModule)
      },
      {
        path: 'finance',
        loadChildren: () => import('./features/finance/finance.module').then(m => m.FinanceModule)
      },
      {
        path: 'fidelity',
        loadChildren: () => import('./features/fidelity/fidelity.module').then(m => m.FidelityModule)
      },
      {
        path: 'reports',
        loadChildren: () => import('./features/reports/reports.module').then(m => m.ReportsModule)
      },
      {
        path: 'settings',
        loadChildren: () => import('./features/settings/settings.module').then(m => m.SettingsModule)
      }
    ]
  },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];

