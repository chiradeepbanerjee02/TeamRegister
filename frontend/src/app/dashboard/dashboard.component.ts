import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { interval, Subscription } from 'rxjs';
import { AuthService } from '../auth.service';
import { AttendanceService, TodayAttendance, MemberAttendance, HistoryRecord } from '../attendance.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDividerModule,
    MatTooltipModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit, OnDestroy {
  todayData: TodayAttendance | null = null;
  history: HistoryRecord[] = [];
  myStatus: 'office' | 'wfh' | 'absent' | null = null;
  loading = true;
  marking = false;
  private pollSub?: Subscription;

  constructor(
    public auth: AuthService,
    private attendanceSvc: AttendanceService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadData();
    // Poll every 30 seconds for live updates
    this.pollSub = interval(30000).subscribe(() => this.loadData(true));
  }

  ngOnDestroy() {
    this.pollSub?.unsubscribe();
  }

  loadData(silent = false) {
    if (!silent) this.loading = true;
    this.attendanceSvc.getTodayAttendance().subscribe({
      next: data => {
        this.todayData = data;
        const me = data.members.find(m => m.id === this.auth.getUser()?.id);
        this.myStatus = me?.status ?? 'absent';
        this.loading = false;
        if (data.alert) {
          this.snackBar.open(
            `⚠️ Alert: ${data.officeCount} members are coming to the office today (limit: 5)!`,
            'Dismiss',
            { duration: 6000, panelClass: 'alert-snackbar' }
          );
        }
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Failed to load attendance data', 'Close', { duration: 3000 });
      },
    });
    this.attendanceSvc.getHistory().subscribe(h => (this.history = h));
  }

  mark(status: 'office' | 'wfh' | 'absent') {
    if (this.marking) return;
    this.marking = true;
    this.attendanceSvc.markAttendance(status).subscribe({
      next: res => {
        this.myStatus = status;
        this.marking = false;
        const msg = status === 'office' ? '🏢 Marked as coming to office' :
                    status === 'wfh'    ? '🏠 Marked as working from home' :
                                          '❌ Marked as absent';
        this.snackBar.open(msg, 'OK', { duration: 3000 });
        if (res.alert) {
          setTimeout(() => {
            this.snackBar.open(
              `⚠️ Alert: ${res.officeCount} members are coming to office today! Limit exceeded (>5).`,
              'Dismiss',
              { duration: 8000, panelClass: 'alert-snackbar' }
            );
          }, 500);
        }
        this.loadData(true);
      },
      error: () => {
        this.marking = false;
        this.snackBar.open('Failed to update attendance', 'Close', { duration: 3000 });
      },
    });
  }

  getStatusColor(status: string): string {
    if (status === 'office') return 'office';
    if (status === 'wfh') return 'wfh';
    return 'absent';
  }

  getStatusIcon(status: string): string {
    if (status === 'office') return 'business';
    if (status === 'wfh') return 'home';
    return 'cancel';
  }

  getStatusLabel(status: string): string {
    if (status === 'office') return 'In Office';
    if (status === 'wfh') return 'WFH';
    return 'Absent';
  }

  get officeMembers(): MemberAttendance[] {
    return this.todayData?.members.filter(m => m.status === 'office') ?? [];
  }

  get wfhMembers(): MemberAttendance[] {
    return this.todayData?.members.filter(m => m.status === 'wfh') ?? [];
  }

  get absentMembers(): MemberAttendance[] {
    return this.todayData?.members.filter(m => m.status === 'absent') ?? [];
  }

  get todayFormatted(): string {
    if (!this.todayData) return '';
    const d = new Date(this.todayData.date + 'T00:00:00');
    return d.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }
}

