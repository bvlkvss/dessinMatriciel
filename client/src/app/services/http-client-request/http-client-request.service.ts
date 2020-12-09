import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Drawings } from '@app/components/carrousel/carrousel.component';
import { Observable } from 'rxjs';
@Injectable({
    providedIn: 'root',
})
export class HttpClientRequestService {
    constructor(private http: HttpClient) {}
    getRequest(): Observable<Drawings[]> {
        if (this.http) return this.http.get<Drawings[]>('http://localhost:3000/api/drawings/localServer');
        return new Observable();
    }
    deleteRequest(drawingId: string | undefined): Observable<object> {
        if (this.http) return this.http.delete('http://localhost:3000/api/drawings/' + drawingId);
        return new Observable();
    }
}
