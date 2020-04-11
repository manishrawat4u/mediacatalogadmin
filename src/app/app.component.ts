import { Component } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'mediacatalogadmin';
  constructor(private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer) {
    this.matIconRegistry.addSvgIcon('loader', this.domSanitizer.bypassSecurityTrustResourceUrl("../assets/iconLoader.svg"));
    this.matIconRegistry.addSvgIcon('gdrive_logo', this.domSanitizer.bypassSecurityTrustResourceUrl("../assets/googleDriveLogoOnly.svg"));
}
}
