import { Component, OnInit, ViewChild } from '@angular/core';
import { IonInput, ModalController, NavParams } from '@ionic/angular';
import * as Tagify from '@yaireo/tagify';
import { StationOrderBy } from 'src/app/enums/station-order-by.enum';
import { LocalDbService } from 'src/app/services/local-db.service';
import { StationService } from 'src/app/services/station.service';

@Component({
  selector: 'app-filters-modal',
  templateUrl: './filters-modal.component.html',
  styleUrls: ['./filters-modal.component.scss'],
})
export class FiltersModalComponent implements OnInit {

  stationOrderBy = StationOrderBy;
  orderBy: StationOrderBy = StationOrderBy.Likes;
  tagify: Tagify;
  tags: string[] = [];
  @ViewChild('tagInput', { static: false }) tagInput: IonInput;

  constructor(
    private modalController: ModalController,
    private localDbService: LocalDbService,
    private stationService: StationService,
    private navParams: NavParams
  ) { }

  ngOnInit() {
    const interval = setInterval(() => {
      if (this.tagInput) {
        this.createTagify();
        clearInterval(interval);
      }
    }, 200)

    this.orderBy = this.navParams.get('orderBy');
    this.tags = this.navParams.get('tags');
  }

  closeModal() {
    this.modalController.dismiss();
  }

  async createTagify() {
    if (!this.tagify) {
      let tags = await this.localDbService.getTags();
      if (!tags) {
        tags = await this.stationService.getTags();
      } else {
        this.stationService.getTags()
          .then(resp => tags = resp);
      }

      this.tagInput.getInputElement()
        .then(input => {
          this.tagify = new Tagify(input, {
            maxTags: 3,
            whitelist: tags,
            enforceWhitelist: true,
            dropdown: {
              enabled: 1,
              maxItems: 5,
              position: 'text'
            },
            templates: {
              dropdownItemNoMatch: function (data) {
                return `<div class='${this.settings.classNames.dropdownItem}' value="noMatch" tabindex="0" role="option">
                      Ninguna sugerencia para: <strong>${data.value}</strong>
                  </div>`
              }
            }
          })
        })
    }
  }

  clearAll() {
    this.orderBy = StationOrderBy.Likes;
    this.tagify.removeAllTags();
  }

  setFilters() {
    this.modalController.dismiss({
      orderBy: this.orderBy,
      tags: this.tagify.getCleanValue().map(tag => tag.value)
    });
  }
}
