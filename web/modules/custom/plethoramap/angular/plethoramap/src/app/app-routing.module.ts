import { NgModule } from '@angular/core'; 
import { RouterModule, Routes } from '@angular/router'; 
import { FeatureDetailComponent } from './feature-detail.component';

const appRoutes: Routes = [
  {
    path: ':urlName',
    component: FeatureDetailComponent,
    data: { title: ':urlName Detail' }
  },
/*  { path: '',
    pathMatch: 'full',
    redirectTo: 'map'
  }, */
  /*{ path: '**', redirectTo: 'map' }*/
];


@NgModule({
  imports: [
    RouterModule.forRoot(
      appRoutes,
      {
        enableTracing: true // <-- debugging purposes only
      }
    )
  ],
  exports: [
    RouterModule
  ],
  providers: [
  ]
})
export class AppRoutingModule { }
