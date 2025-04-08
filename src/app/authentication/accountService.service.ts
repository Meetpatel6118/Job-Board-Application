import { EventEmitter, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { User } from '../../models/user';
import { MessageService } from 'primeng/api';

@Injectable({ providedIn: 'root' })
export class AccountService {
  private userSubject: BehaviorSubject<User | null>;
  public user: Observable<User | null>;
  environment = {

    apiUrl: "http://localhost:4200"
  }
  private apiUrl = 'https://localhost:7179/api';

  constructor(
    private router: Router,
    private http: HttpClient,
    private messageService: MessageService
  ) {
    this.userSubject = new BehaviorSubject(JSON.parse(localStorage.getItem('user')!));
    this.user = this.userSubject.asObservable();
  }

  public get userValue() {
    return this.userSubject.value;
  }

  getAuthHeaders(): HttpHeaders {
    const token = this.userValue?.token;
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }
  

  login(email: string, password: string) {
    return this.http.post<any>(`${this.apiUrl}/users/login`, { email, password })
      .pipe(map(response => {
        const userWithToken = {
          ...response.user,
          token: response.token
        };
  
        localStorage.setItem('user', JSON.stringify(userWithToken));
        this.userSubject.next(userWithToken);
        return userWithToken;
      }));
  }
  

  sendMessage(phoneNumber: string, body1: string) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    const body = new URLSearchParams();
    body.set('recipientNumber', '1' + phoneNumber);
    body.set('messageBody', body1);

    this.http.post<any>('https://bazaar-frenchfry-6660.twil.io/testfunc', body, { headers }).subscribe(
      () => this.messageService.add({ severity: 'success', summary: 'SMS sent successfully!' }),
      (error) => this.messageService.add({ severity: 'error', summary: 'SMS failed', detail: error.message })
    );
  }

  logout() {
    localStorage.removeItem('user');
    this.userSubject.next(null);
    this.router.navigate(['/account/login']);
  }
  getApplicationsByJobId(jobId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/applications/byJobId/${jobId}`
    );
  }
 
  updateApplicationStatus(applicationId: string, status: string) {
   return this.http.put(`${this.apiUrl}/applications/updateStatus/${applicationId}`, { status });
  }

 getMyApplications(): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/applications/my`, {
    headers: this.getAuthHeaders()
  });
}
  
  getUserById(id: string) {
    return this.http.get<any>(`${this.apiUrl}/users/${id}`, {
      headers: this.getAuthHeaders()
    });
  }
  register(user: User) {
    return this.http.post(`${this.apiUrl}/users/register`, user);
  }
  updateJob(id: string, data: any) {
    return this.http.put(`${this.apiUrl}/jobs/byJobId/${id}`, data,{ headers: this.getAuthHeaders() });
  }
  getAllJobs() {
    return this.http.get(`${this.apiUrl}/jobs`);
  }
  deleteJob(id: string) {
    return this.http.delete(`${this.apiUrl}/jobs/by-jobid/${id}`,{ headers: this.getAuthHeaders() });

  }
  getAllJobsByEmployer() {
    return this.http.get(`${this.apiUrl}/jobs/employer`, { headers: this.getAuthHeaders() });
  }
  getCategories() {
    return this.http.get(`${this.apiUrl}/categories`, { headers: this.getAuthHeaders() });
  }
  uploadResume(formData: FormData) {
    return this.http.post(`${this.apiUrl}/resumes/upload`, formData);
  }
  addResume(data: any) {
    return this.http.post(`${this.environment.apiUrl}/users/addResume`, data);
  }
  
  addPost(job: any) {
    return this.http.post(`${this.apiUrl}/jobs`, job, { headers: this.getAuthHeaders() });
  }
  
  getById(id: string) {
    return this.http.get(`${this.apiUrl}/jobs/byJobId/${id}`);
  }
  
  update(id: string, params: any) {
    return this.http.put(`${this.apiUrl}/users/${id}`, params, { headers: this.getAuthHeaders() })
      .pipe(map(x => {
        if (id == this.userValue?.id) {
          const user = { ...this.userValue, ...params };
          localStorage.setItem('user', JSON.stringify(user));
          this.userSubject.next(user);
        }
        return x;
      }));
  }
  
  delete(id: string) {
    return this.http.delete(`${this.apiUrl}/users/${id}`, { headers: this.getAuthHeaders() })
      .pipe(map(x => {
        if (id == this.userValue?.id) {
          this.logout();
        }
        return x;
      }));
  }
  applyJob(application:any) {
    return this.http.post(`${this.apiUrl}/applications`, application,{ headers: this.getAuthHeaders() });
  }
}
  