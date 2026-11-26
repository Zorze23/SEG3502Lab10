import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { EMPTY, catchError, switchMap } from 'rxjs';

import { AuthornamesPipe } from '../../pipes/authornames.pipe';
import { Book } from '../model/book';
import { BooksService } from '../service/books.service';

@Component({
  selector: 'app-book',
  standalone: true,
  imports: [AuthornamesPipe],
  templateUrl: './book.component.html',
  styleUrls: ['./book.component.css']
})
export class BookComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private service = inject(BooksService);
  private destroyRef = inject(DestroyRef);

  selectedBook: Book | null = null;
  status = '';

  ngOnInit(): void {
    this.route.paramMap.pipe(
      switchMap(params => {
        const id = params.get('id')!;
        this.selectedBook = null;
        this.status = 'Loading book…';

        return this.service.getBook(id).pipe(
          catchError((error: HttpErrorResponse) => {
            if (error.status === 404) {
              this.status = `No book found with ID ${id}.`;
            } else if (error.status === 0) {
              this.status = 'Couldn’t connect to the server.';
            } else {
              this.status = 'Couldn’t load the book. Please try again.';
            }
            return EMPTY;
          })
        );
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(book => {
      this.selectedBook = book;
      this.status = '';
    });
  }
}