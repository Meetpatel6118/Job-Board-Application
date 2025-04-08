import { Component, NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { HomePageComponent } from './home-page/home-page.component';
import { AddAPostComponent } from './add-apost/add-apost.component';
import { PostPageComponent } from './post-page/post-page.component';

import { EditPostComponent } from './edit-post/edit-post.component';




export const routes: Routes = [
  {
    path: '',
    component: LoginComponent,
    children: []
  },
  {
    path: 'register',
    component: LandingPageComponent,
    children: []
  },
  {
    path:'signup/:id',
    component: SignUpComponent,
    children:[]

  },
  
  
  {
    path:'homepage',
    component: HomePageComponent,
    children:[]

  },
  {
    path:'addpost',
    component: AddAPostComponent,
    children:[],
  },
  
  {

    path:'postpage',
    component: PostPageComponent,
    children:[],
  },
  {
    path:'editPost/:id',
    component: EditPostComponent,
    children:[]

  },
  

];

@NgModule({
  imports: [ RouterModule.forChild(routes)],
  exports: [ RouterModule ]
})
export class AuthenticationRoutingModule {}
