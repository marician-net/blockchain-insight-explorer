import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Observable } from 'rxjs';
import { Block } from '../../models';
import { BlocksService } from '../../services';
import { Http } from '@angular/http';

@Component({
  templateUrl: './blocksPage.html'
})

export class BlocksPage {

  public title: string;
  public blocks: Observable<Block[]>;
  public q: string;
  public badQuery: boolean = false;

  constructor(private nav: NavController, private http: Http, private blocksService: BlocksService) {
    this.nav = nav;
    this.title = 'Blocks';
    this.blocks = blocksService.latestBlocks;
    // this.blocks.subscribe((blocks) => {
    //   console.log(blocks);
    // });
    blocksService.getLatestBlocks();
  }

  public search(event) {
    console.log('q is', this.q);
    let apiPrefix = 'http://localhost:3001/insight-api/';
    this.http.get(apiPrefix + 'block/' + this.q).subscribe(
      (data) => {
        this.resetSearch();
        console.log('block', data);
      },
      (err) => {
        this.http.get(apiPrefix + 'tx/' + this.q).subscribe(
          (data) => {
            this.resetSearch();
            console.log('tx', data);
          },
          (err) => {
            this.http.get(apiPrefix + 'addr/' + this.q).subscribe(
              (data) => {
                this.resetSearch();
                console.log('addr', data);
              },
              (err) => {
                this.http.get(apiPrefix + 'block-index/' + this.q).subscribe(
                  (data) => {
                    this.resetSearch();
                    console.log('block-index', data);
                  },
                  function (err) {
                    this.loading = false;
                    this.reportBadQuery();
                  }.bind(this)
                );
              }
            );
          }
        );
      }
    );
  }

  resetSearch = function() {
    this.q = '';
    this.loading = false;
  };

  reportBadQuery() {
    this.badQuery = true;
    console.log('badQuery', this.badQuery);

    setTimeout(function() {
      this.badQuery = false;
      console.log('badQuery', this.badQuery);
    }.bind(this), 2000);
  };
}
