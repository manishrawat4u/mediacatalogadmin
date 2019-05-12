import { Component } from '@angular/core';
import { MatIconRegistry } from '@angular/material';
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
    //matIconRegistry.addSvgIconLiteral('loader', );
    this.matIconRegistry.addSvgIcon('loader', this.domSanitizer.bypassSecurityTrustResourceUrl("../assets/iconLoader.svg"));
    // mdIconRegistry.addSvgIcon('icon2',sanitizer.bypassSecurityTrustResourceUrl('assets/icon2.svg'));
}
}
