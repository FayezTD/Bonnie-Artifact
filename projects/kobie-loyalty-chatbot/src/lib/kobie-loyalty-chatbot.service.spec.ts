import { TestBed } from '@angular/core/testing';

import { KobieLoyaltyChatbotService } from './kobie-loyalty-chatbot.service';

describe('KobieLoyaltyChatbotService', () => {
  let service: KobieLoyaltyChatbotService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(KobieLoyaltyChatbotService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
