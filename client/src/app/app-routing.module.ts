import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EditorComponent } from '@app/components/editor/editor.component';
import { MainPageComponent } from '@app/components/main-page/main-page.component';
import { StampsContainerComponent } from '@app/components/stamps-container/stamps-container.component';
import { UserGuideComponent } from '@app/components/user-guide/user-guide.component';
const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'home', component: MainPageComponent },
    { path: 'card', component: StampsContainerComponent },
    { path: 'editor', component: EditorComponent },
    { path: 'user-guide', component: UserGuideComponent },
    { path: '**', redirectTo: '/home' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRoutingModule {}
