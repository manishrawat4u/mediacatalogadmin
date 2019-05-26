import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-media-quality',
  templateUrl: './media-quality.component.html',
  styleUrls: ['./media-quality.component.scss']
})
export class MediaQualityComponent implements OnInit {
  @Input() height: Number;
  @Input() width: Number;

  resolution = "";

  constructor() { }

  ngOnInit() {
    if (this.width >= 3840) {
      this.resolution = "4k";
    } else if (this.width >= 1920) {
      this.resolution = "high_quality";
    } else if (this.width >= 1280) {
      this.resolution = "hd";
    } else if (this.width>0){
      this.resolution = "fiber_dvr";
    }
  }
}
