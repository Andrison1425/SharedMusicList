import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { TimestampPipe } from './timestamp.pipe';



@NgModule({
  declarations: [
    TimestampPipe
  ],
  imports: [
    CommonModule
  ],
  exports: [
    TimestampPipe
  ],
  providers: [
    DatePipe
  ]
})
export class CustomPipesModule { }
