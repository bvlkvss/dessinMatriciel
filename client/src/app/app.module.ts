import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ColorPaletteComponent } from '@app/components/color-picker/color-palette/color-palette.component';
import { ColorPickerComponent } from '@app/components/color-picker/color-picker.component';
import { ColorSliderComponent } from '@app/components/color-picker/color-slider/color-slider.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { AppRoutingModule } from './app-routing.module';
import { AddTagsComponent } from './components/add-tags/add-tags.component';
import { AppComponent } from './components/app/app.component';
import { AttributeBarComponent } from './components/attribute-bar/attribute-bar.component';
import { CarrouselComponent } from './components/carrousel/carrousel.component';
import { DrawingCardComponent } from './components/drawing-card/drawing-card.component';
import { DrawingComponent } from './components/drawing/drawing.component';
import { EditorComponent } from './components/editor/editor.component';
import { ExportComponent } from './components/export/export.component';
import { FilterTagComponent } from './components/filter-tag/filter-tag.component';
import { MainPageComponent } from './components/main-page/main-page.component';
import { SavingComponent } from './components/saving/saving.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { StampsContainerComponent } from './components/stamps-container/stamps-container.component';
import { UserGuideComponent } from './components/user-guide/user-guide.component';
@NgModule({
    declarations: [
        AppComponent,
        EditorComponent,
        SidebarComponent,
        DrawingComponent,
        MainPageComponent,
        UserGuideComponent,
        StampsContainerComponent,
        AttributeBarComponent,
        ExportComponent,
        ColorSliderComponent,
        ColorPaletteComponent,
        SavingComponent,
        ColorPickerComponent,
        DrawingCardComponent,
        CarrouselComponent,
        AddTagsComponent,
        FilterTagComponent,
        StampsContainerComponent,
    ],
    imports: [
        BrowserModule,
        MatProgressSpinnerModule,
        HttpClientModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        MatDialogModule,
        MatCardModule,
        FormsModule,
        MatFormFieldModule,
        MatChipsModule,
        MatIconModule,
        MatButtonToggleModule,
        MatSelectModule,
        MatInputModule,
        NgMultiSelectDropDownModule.forRoot(),
    ],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
