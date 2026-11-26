import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { Author, Book } from '../books/model/book';
import { BooksService } from '../books/service/books.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent {
  private builder = inject(FormBuilder).nonNullable;
  private service = inject(BooksService);

  saving = false;
  savedId: number | null = null;
  error = '';

  private authorFields() {
    return this.builder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required]
    });
  }

  readonly authors = this.builder.array<ReturnType<typeof this.authorFields>>([]);

  readonly bookForm = this.builder.group({
    title: ['', Validators.required],
    category: ['', Validators.required],
    cost: ['', [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
    year: ['', Validators.required],
    description: ['', Validators.required],
    authors: this.authors
  });

  addAuthor(): void {
    this.authors.push(this.authorFields());
  }

  async onSubmit(): Promise<void> {
    if (this.bookForm.invalid || this.saving) return;

    this.saving = true;
    this.savedId = null;
    this.error = '';

    const data = this.bookForm.getRawValue();
    const book = new Book(
      0,
      data.category,
      data.title,
      Number(data.cost),
      [],
      Number(data.year),
      data.description
    );

    try {
      const saved = await firstValueFrom(this.service.addBook(book));
      this.savedId = saved.id;

      for (const author of data.authors) {
        const matches = await firstValueFrom(
          this.service.getAuthorsNamed(author.firstName, author.lastName)
        );

        if (matches?.length) {
          await firstValueFrom(
            this.service.updateBookAuthors(saved.id, matches[0].id)
          );
        } else {
          const newAuthor = new Author(0, author.firstName, author.lastName);
          await firstValueFrom(this.service.addBookAuthor(saved.id, newAuthor));
        }
      }
    } catch {
      this.error = this.savedId === null
        ? 'Could not save the book. Please try again.'
        : 'The book was saved, but some authors could not be linked.';
    } finally {
      if (this.savedId !== null) {
        this.authors.clear();
        this.bookForm.reset();
      }
      this.saving = false;
    }
  }
}