import { inject, Injectable, InjectionToken } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Author, AuthorDetails, Book } from '../model/book';

export const API_URL = new InjectionToken<string>('API URL');

@Injectable({
  providedIn: 'root'
}) 
export class BooksService {
  private readonly apiUrl = inject(API_URL);
  private http = inject(HttpClient);

  public getAuthor(id: number): Observable<AuthorDetails> {
    return this.http.get<AuthorDetails>(this.apiUrl + 'authors/' + id);
  }

  public getBook(id: string): Observable<Book> {
    return this.http.get<Book>(this.apiUrl + 'books/' + id);
  }

  public addBook(book: Book): Observable<Book> {
    return this.http.post<Book>(this.apiUrl + 'books', book);
  }

  public addBookAuthor(id: number, author: Author): Observable<Author> {
    return this.http.post<Author>(
      this.apiUrl + 'books/' + id + '/authors',
      author
    );
  }

  public getAuthorsNamed(
    firstName: string,
    lastName: string
  ): Observable<any> {
    const options = {
      params: new HttpParams()
        .set('firstName', firstName)
        .set('lastName', lastName)
    };

    return this.http.get<any>(this.apiUrl + 'authors', options).pipe(
      map(response =>
        response._embedded ? response._embedded.authors : undefined
      )
    );
  }

  public updateBookAuthors(
    bookId: number,
    authorId: number
  ): Observable<any> {
    return this.http.patch(
      this.apiUrl + 'books/' + bookId + '/authors/' + authorId,
      {}
    );
  }
}