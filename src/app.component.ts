// import { Component } from '@angular/core';
// import { ParentPageComponent } from './app/parent-page/parent-page.component';

// @Component({
//   selector: 'app-root',
//   standalone: true,
//   imports: [ParentPageComponent],
//   template: `
//     <app-parent-page></app-parent-page>
//   `,
//   styles: [`
//     :host {
//       display: block;
//       width: 100%;
//       min-height: 100vh;
//     }
//   `]
// })
// export class AppComponent {
//   title = 'chat-app';
// }

import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: true,
  template: `
    <app-csv-viewer></app-csv-viewer>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      min-height: 100vh;
      background-color: #f8f9fa;
    }
  `]
})
export class AppComponent {
  title = 'csv-streaming-app'; // Updated title
}
