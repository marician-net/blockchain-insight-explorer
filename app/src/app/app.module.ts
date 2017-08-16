import { HttpModule } from '@angular/http';
import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { InsightApp } from './app.component';
import { PagesModule, HomePage, BlocksPage, BroadcastTxPage, NodeStatusPage, VerifyMessagePage } from '../pages';
import { BlocksService, StorageService } from '../services';
import { ApiProvider } from '../providers/api/api';
import { CurrencyProvider } from '../providers/currency/currency';

@NgModule({
  declarations: [
    InsightApp
  ],
  imports: [
    BrowserModule,
    HttpModule,
    PagesModule,
    IonicModule.forRoot(InsightApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    InsightApp,
    HomePage,
    BlocksPage,
    BroadcastTxPage,
    NodeStatusPage,
    VerifyMessagePage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    StorageService,
    BlocksService,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    ApiProvider,
    CurrencyProvider
  ]
})

export class AppModule {}
