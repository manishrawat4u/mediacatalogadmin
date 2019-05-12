import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { ImdbInfoComponent } from 'src/app/components/imdb-info/imdb-info.component';
import { ImdbService } from 'src/app/services/imdb.service';
import { MediaService } from 'src/app/medias/media.service';
import { MediaImdbSetRequest } from 'src/app/models/mediaImdbSetRequest';
import { ImdbMediaInfo } from 'src/app/models/imdb';
import { MediaImdbSetResponse } from 'src/app/models/mediaImdbSetResponse';
import { MatIcon } from '@angular/material';

@Component({
  selector: 'app-imdb-document',
  templateUrl: './imdb-document.component.html',
  styleUrls: ['./imdb-document.component.scss']
})
export class ImdbDocumentComponent implements OnInit {
  @ViewChild(ImdbInfoComponent) imdbInfo: ImdbInfoComponent;
  @Input() mediaDocumentId: string;
  @Input() title: string;
  @ViewChild(MatIcon)
  message: string;

  constructor(private imdbService: MediaService) { }

  ngOnInit() {
    this.imdbInfo && this.imdbInfo.selectedItemChanges.pipe().subscribe(() => {
      var imdbId = this.imdbInfo.selectedMediaItem.imdbId
      var requestObject = new MediaImdbSetRequest();
      requestObject.imdbId = imdbId
      requestObject.mediaDocumentId = this.mediaDocumentId;
      this.imdbInfo.searchBarIconName = "saving";
      this.imdbService.setImdb(requestObject)
        .then((response: MediaImdbSetResponse) => {
          this.message = response.success ? "Saved" : "Error";
          this.imdbInfo.searchBarIconName = "saved";
      })
        .catch(() => this.message = "Error");
    });
  }

}
