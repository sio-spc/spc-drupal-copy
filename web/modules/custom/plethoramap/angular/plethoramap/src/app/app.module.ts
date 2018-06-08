import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { FeatureDetailComponent } from './feature-detail.component';
import { AutocompleteComponent } from './autocomplete.component';
import { AppRoutingModule }        from './app-routing.module';
import { DataService } from './data.service';
import { PlethoraMapConfigService } from './plethoramap.config.service';
import { PlethoraTheme } from './plethora-theme';
import {HttpClientModule} from '@angular/common/http';


@NgModule({
  declarations: [
    AppComponent,
    FeatureDetailComponent,
    AutocompleteComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [ DataService, PlethoraMapConfigService, HttpClientModule, PlethoraTheme ],
  bootstrap: [AppComponent]
})

export class AppModule {
  // Diagnostic only: inspect router configuration
  constructor(router: Router) {
    console.log('Routes: ', JSON.stringify(router.config, undefined, 2));
  }
}
