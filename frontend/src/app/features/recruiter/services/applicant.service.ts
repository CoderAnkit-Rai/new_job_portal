import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApplicantService {

  public base = environment.apiUrl;

  constructor(private http: HttpClient) {} 

  getApplicants(jobId: number, page = 0, size = 10): Observable<any> { 
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get(`${this.base}/api/applications/job/${jobId}`, { params });
  }

  getResumesByEmail(userEmail: string): Observable<any> {
    return this.http.get(`${this.base}/api/resumes/user/${encodeURIComponent(userEmail)}`); 
  }

  getUserByEmail(userEmail: string): Observable<any> {
    return this.http.get(`${this.base}/api/users/by-email/${encodeURIComponent(userEmail)}`);
  }

  updateStatus(applicationId: string, status: string): Observable<any> {
    return this.http.put(`${this.base}/api/applications/${applicationId}/status?status=${status}`, {});
  }
}
