import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/api';
import { first } from 'rxjs/operators';
import { AccountService } from '../accountService.service';

@Component({
  selector: 'app-edit-post',
  templateUrl: './edit-post.component.html',
  styleUrls: ['./edit-post.component.scss'],
  providers: [MessageService]
})
export class EditPostComponent {
  loggedInUser: any;
  submitted = false;
  editPostForm: FormGroup;
  postId: string;
  postData: any;
  categories: any[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private accountService: AccountService,
    private messageService: MessageService,
    private router: Router,
    private route: ActivatedRoute,
    private httpClient: HttpClient
  ) {
    this.loggedInUser = JSON.parse(localStorage.getItem('user')!) || {};
    this.postId = this.route.snapshot.params['id'];
  }

  ngOnInit(): void {
    this.initForm();
  
    this.fetchCategories().then(() => {
      this.accountService.getById(this.postId).subscribe({
        next: (data: any) => {
          this.postData = data;
  
          // ✅ Patch form values including category after categories are ready
          this.editPostForm.patchValue({
            ...data,
            category: data.category // make sure this matches the fetched value
          });
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Failed to load post data' });
        }
      });
    });
  }
  

  initForm() {
    this.editPostForm = this.formBuilder.group({
      companyName: ['', Validators.required],
      jobID: ['', Validators.required],
      job_title: ['', Validators.required],
      job_desc: ['', Validators.required],
      loc: ['', Validators.required],
      phone: ['', Validators.required],
      category: ['', Validators.required],
      userId: [[]]                                                                  // optional
    });
    this.fetchCategories();
  }
  fetchCategories(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.accountService.getCategories().subscribe({
        next: (res: any) => {
          this.categories = res.map((cat: { name: any }) => ({
            label: cat.name,
            value: cat.name
          }));
          resolve(); // ✅ Resolve after categories are loaded
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Failed to load categories' });
          reject();
        }
      });
    });
  }
  


  toggle() {
    this.router.navigate(['/homepage']);
  }

  onSubmit() {
    this.submitted = true;

    if (this.editPostForm.invalid) return;

    this.accountService.updateJob(this.postId, this.editPostForm.value)
      .subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Post updated successfully' });
          setTimeout(() => this.router.navigate(['/homepage']), 1000);
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Update failed, please try again' });
        }
      });
  }
}
