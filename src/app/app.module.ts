import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { DashboardViewComponent } from './components/dashboard-view/dashboard-view.component';
import { WalletViewComponent } from './components/wallet-view/wallet-view.component';
import { TerminalViewComponent } from './components/terminal-view/terminal-view.component';
import { SettingsViewComponent } from './components/settings-view/settings-view.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    SidebarComponent,
    DashboardViewComponent,
    WalletViewComponent,
    TerminalViewComponent,
    SettingsViewComponent
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
