import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { ColorPickerModule } from './color-picker/color-picker.module';
import { AppComponent } from './components/app/app.component';
import { AttributebarComponent } from './components/attributebar/attributebar.component';
import { DrawingComponent } from './components/drawing/drawing.component';
import { EditorComponent } from './components/editor/editor.component';
import { ExportComponent } from './components/export/export.component';
import { MainPageComponent } from './components/main-page/main-page.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { UserGuideComponent } from './components/user-guide/user-guide.component';

@NgModule({
    declarations: [
        AppComponent,
        EditorComponent,
        SidebarComponent,
        DrawingComponent,
        MainPageComponent,
        UserGuideComponent,
        AttributebarComponent,
        ExportComponent,
    ],
    imports: [BrowserModule, HttpClientModule, AppRoutingModule, ColorPickerModule, BrowserAnimationsModule, MatDialogModule],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
