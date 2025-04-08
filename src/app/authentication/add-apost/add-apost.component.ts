import { Component, ElementRef, OnInit, Renderer2 } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AccountService } from '../accountService.service';
import { first } from 'rxjs/operators';
import { MessageService } from 'primeng/api';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

export interface SelectedFiles {
  name: string;
  file: any;
  base64?: string;
}

@Component({
  selector: 'app-add-apost',
  templateUrl: './add-apost.component.html',
  styleUrls: ['./add-apost.component.scss'],
  providers: [MessageService]
})
export class AddAPostComponent implements OnInit {
  loggedInUser: any;
  selected: boolean;
  submitted: boolean;
  addPostForm: any;
  categories: any[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private accountService: AccountService,
    private messageService: MessageService,
    private router: Router,
    private route: ActivatedRoute,
    private httpClient: HttpClient,
    private renderer: Renderer2
  ) {
    this.loggedInUser = JSON.parse(localStorage.getItem('user')!) || [];
  }

  ngOnInit(): void {
    this.addPostForm = this.formBuilder.group({
      companyName: [this.loggedInUser.companyName || '', Validators.required],
      jobID: ['', Validators.required],
      job_title: ['', Validators.required],
      job_desc: ['', [Validators.required]],
      loc: [this.loggedInUser.companyAddress || '', [Validators.required]],
      phone: [this.loggedInUser.companyPhone || '', [
        Validators.required,
        Validators.pattern('^[0-9]{10,15}$') 
      ]],
      category: ['', Validators.required],
      postId: [''],
      userId: [[]]
    });

    this.fetchCategories();
  }

  fetchCategories() {
    this.accountService.getCategories().subscribe({
      next: (res:any) => {
        this.categories = res.map((cat: { name: any; }) => ({ label: cat.name, value: cat.name }));
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Failed to load categories from backend' });
      }
    });
  }

  toggle() {
    this.router.navigate(['/homepage']);
  }

  save() {
    this.submitted = true;

    if (this.addPostForm.invalid) {
      return;
    }

    const postData = {
      userId: [],
      ...this.addPostForm.value
    };

    this.accountService.addPost(postData)
      .pipe(first())
      .subscribe({
        next: () => {
          this.messageService.clear();
          this.messageService.add({ severity: 'success', summary: 'Job posted successfully!' });
          setTimeout(() => {
            this.router.navigate(['/homepage'], { relativeTo: this.route });
          }, 2000);
        },
        error: error => {
          this.messageService.add({ severity: 'warn', summary: 'Error posting job. Please try again.' });
        }
      });
  }
}
