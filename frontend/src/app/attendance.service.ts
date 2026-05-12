import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';

export interface MemberAttendance {
  id: number;
  name: string;
  username: string;
  status: 'office' | 'wfh' | 'absent';
}

export interface TodayAttendance {
  date: string;
  members: MemberAttendance[];
  officeCount: number;
  alert: boolean;
}

export interface HistoryRecord {
  date: string;
  status: 'office' | 'wfh' | 'absent';
}

@Injectable({ providedIn: 'root' })
export class AttendanceService {
  private readonly API = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getTodayAttendance() {
    return this.http.get<TodayAttendance>(`${this.API}/attendance/today`);
  }

  markAttendance(status: 'office' | 'wfh' | 'absent') {
    return this.http.post<{ success: boolean; status: string; officeCount: number; alert: boolean }>(
      `${this.API}/attendance`,
      { status }
    );
  }

  getHistory() {
    return this.http.get<HistoryRecord[]>(`${this.API}/attendance/history`);
  }
}
