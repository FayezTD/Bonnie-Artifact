import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KobieLoyaltyChatbotComponent } from './kobie-loyalty-chatbot.component';

describe('KobieLoyaltyChatbotComponent', () => {
  let component: KobieLoyaltyChatbotComponent;
  let fixture: ComponentFixture<KobieLoyaltyChatbotComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KobieLoyaltyChatbotComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KobieLoyaltyChatbotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
