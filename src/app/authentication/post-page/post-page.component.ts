import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AccountService } from '../accountService.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-post-page',
  templateUrl: './post-page.component.html',
  styleUrls: ['./post-page.component.scss'],
  providers:[MessageService]
})

export class PostPageComponent {
  postData: any;
  usersData: any[] = [];
  loggedInUser: any;
  isLoading: boolean = true;

  constructor(
    private router: Router,
    private accountService: AccountService,
    private messageService: MessageService,
  ) {
    this.loggedInUser = JSON.parse(localStorage.getItem('user')!);
    this.setData();
  }

  setData() {
    this.isLoading = true;
    const post = JSON.parse(localStorage.getItem('currentPost')!);
    this.postData = post;

    this.accountService.getApplicationsByJobId(this.postData.id).subscribe({
      next: (applications: any[]) => {
        this.usersData = applications;
        console.log("Applications:", this.usersData);
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.messageService.add({ severity: 'error', summary: 'Failed to load applicants' });
        this.isLoading = false;
      }
    });
  }

  viewResume(user: any) {
    const downloadLink = document.createElement("a");
    downloadLink.href = user.resumeUrl;
    downloadLink.download = `${user.name}_resume.pdf`;
    downloadLink.click();
  }

  sendNotification(applicant: any, isAccepted: boolean) {
    const status = isAccepted ? 'accepted' : 'rejected';
  
    this.accountService.updateApplicationStatus(applicant.id, status).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: `Application ${status}`
        });
  
        applicant.isAccepted = isAccepted; // update frontend view
      this.setData();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Failed to update application status'
        });
      }
    });
  }
}
