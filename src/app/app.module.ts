import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';

import { HttpClientModule } from '@angular/common/http';
import { DemoMaterialModule } from './material.module';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MediaDetailsComponent } from './medias/media-details/media-details.component';
import { MediaListComponent } from './medias/media-list/media-list.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SearchBoxComponent } from './components/search-box/search-box.component'
import { ImdbInfoComponent } from './components/imdb-info/imdb-info.component'
import { ImdbDocumentComponent } from './components/imdb-document/imdb-document.component';
import { MediaQualityComponent } from './components/media-quality/media-quality.component';
import { NgxFilesizeModule } from 'ngx-filesize';

@NgModule({
  declarations: [
    AppComponent,
    MediaDetailsComponent,
    MediaListComponent,
    SearchBoxComponent,
    ImdbInfoComponent,
    ImdbDocumentComponent,
    MediaQualityComponent
  ],
  imports: [
    BrowserModule, BrowserAnimationsModule,
    AppRoutingModule,
    DemoMaterialModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    NgxFilesizeModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})

export class AppModule { }
