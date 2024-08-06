import {HttpRequest, HttpHandler, HttpEvent, HttpHandlerFn} from "@angular/common/http";
import { Observable } from 'rxjs';
import { timeout } from 'rxjs/operators';

export function increaseTimeoutInterceptor(req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
    return next(req).pipe(timeout(600000)); // 600000 ms = 10mn
}

