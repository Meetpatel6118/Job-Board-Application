import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { AccountService } from '../accountService.service';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss'],
  providers: [MessageService]
})
export class HomePageComponent implements OnInit {

  loggedInUser: any;
  selectedposts: any;
  allposts: any;
  displayStyle = "none";
  selctedJob: any;
  fileName: string = '';
  resumeBase64: string = '';
  categories: string[] = [];
  filteredPosts: any;
  selectedCategory: string = 'All';

  constructor(
    private messageService: MessageService,
    private router: Router,
    private accountService: AccountService
  ) {}

  ngOnInit() {
    this.loggedInUser = JSON.parse(localStorage.getItem('user')!);

    this.accountService.getCategories().subscribe({
      next: (res: any) => {
        this.categories = res.map((c: any) => c.name); // assuming backend returns array of categories with a `name` field
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Failed to load categories' });
      }
    });

    if (this.loggedInUser?.role === 'employer') {
      this.accountService.getAllJobsByEmployer()
        .subscribe(apps => {
          this.selectedposts = apps;
          this.filteredPosts = apps;
        });
    } else if (this.loggedInUser?.role === 'student') {
      this.accountService.getAllJobs().subscribe(jobs => {
        this.allposts = jobs;
        this.filteredPosts = jobs;

  
        // Get applications of this student
        this.accountService.getMyApplications().subscribe((apps: any[]) => {
          this.allposts.forEach((job: any) => {
            const application = apps.find((a: any) => a.jobId === job.id);
            if (application) {
              job.applicationStatus = application.status; // pending / accepted / rejected
            }
          });
        });
      });
    }
  }

  filterByCategory(category: string) {
    this.selectedCategory = category; 
    if (this.loggedInUser.role === 'employer') {
      this.filteredPosts = category === 'All'
        ? this.selectedposts
        : this.selectedposts.filter((post: any) => post.category === category);
    } else if (this.loggedInUser.role === 'student') {
      this.filteredPosts = category === 'All'
        ? this.allposts
        : this.allposts.filter((post: any) => post.category === category);
    }
  }

  deletePost(id: string) {
    if (!confirm("Are you sure you want to delete this job?")) return;

    this.accountService.deleteJob(id).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Job deleted successfully' });
        this.ngOnInit();
      },
      error: (err) => {
        console.error(err);
        this.messageService.add({ severity: 'error', summary: 'Failed to delete job' });
      }
    });
  }

  editJob(id: any) {
    this.router.navigate(['/editPost', id]);
  }

  applyJob() {
    if (!this.resumeBase64 || !this.selctedJob) {
      this.messageService.add({ severity: 'warn', summary: 'Please upload your resume first' });
      return;
    }

    const application = {
      jobId: this.selctedJob.id,
      resumeUrl: this.resumeBase64,
      message: '',
      name: this.loggedInUser?.username

    };

    this.accountService.applyJob(application).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Your application has been sent' });
        this.closePopup();
        this.ngOnInit();
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: err.error?.message || 'Failed to apply' });
      }
    });
  }

  redirectToPost(data: any) {
    localStorage.setItem('currentPost', JSON.stringify(data));
    this.router.navigate(['/postpage']);
  }

  openPopup(data: any) {
    this.displayStyle = "block";
    this.selctedJob = data;
  }

  closePopup() {
    this.displayStyle = "none";
    this.resumeBase64 = '';
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 5242880) {
      this.messageService.add({ severity: 'warn', summary: 'Document size must be under 5MB' });
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      this.resumeBase64 = reader.result as string;
      this.fileName = file.name;
    };
  }
}