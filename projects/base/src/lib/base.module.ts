import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { BaseComponent } from './base.component';
import { ComponentsModule } from './components/components.module';
import { TestViewComponent } from './views/test-view/test-view.component';



@NgModule({
  declarations: [
    BaseComponent,
    TestViewComponent
  ],
  imports: [ComponentsModule, SharedModule],
  exports: [BaseComponent],
})
export class BaseModule { }
