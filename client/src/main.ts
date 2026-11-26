import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { API_URL } from './app/books/service/books.service';

async function start() {
  const response = await fetch('/assets/env.json', { cache: 'no-store' });
  if (!response.ok) throw new Error('Unable to load API configuration');
  const { apiUrl } = await response.json();
  await bootstrapApplication(AppComponent, {
    ...appConfig,
    providers: [...appConfig.providers, { provide: API_URL, useValue: apiUrl }]
  });
}

start().catch(console.error);
