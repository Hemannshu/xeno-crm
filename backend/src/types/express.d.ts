// src/types/express.d.ts
import { IncomingMessage, ServerResponse } from 'http';
import { AuthUser } from './user';

declare module 'express' {
  export interface Request extends IncomingMessage {
    user?: AuthUser;
    body: any;
    params: any;
    path: string;
    method: string;
    url: string;
    headers: {
      authorization?: string;
      [key: string]: string | undefined;
    };
  }

  export interface Response extends ServerResponse {
    json(body: any): Response;
    status(code: number): Response;
    send(body?: any): Response;
    statusCode: number;
    setHeader(key: string, value: string): Response;
    end(): Response;
    redirect(url: string): void;
  }

  export interface NextFunction {
    (err?: any): void;
  }

  export interface RequestHandler {
    (req: Request, res: Response, next: NextFunction): void;
  }

  export interface ErrorRequestHandler {
    (err: any, req: Request, res: Response, next: NextFunction): void;
  }

  export interface Express {
    (): Application;
    json(): RequestHandler;
    urlencoded(options?: any): RequestHandler;
    static(root: string, options?: any): RequestHandler;
  }

  export interface Application {
    use(handler: RequestHandler | ErrorRequestHandler): Application;
    use(path: string, handler: RequestHandler | ErrorRequestHandler): Application;
    use(path: string, router: Router): Application;
    get(path: string, ...handlers: RequestHandler[]): Application;
    post(path: string, ...handlers: RequestHandler[]): Application;
    put(path: string, ...handlers: RequestHandler[]): Application;
    delete(path: string, ...handlers: RequestHandler[]): Application;
    listen(port: number, callback?: () => void): any;
  }

  export interface Router {
    use(handler: RequestHandler): Router;
    use(path: string, handler: RequestHandler): Router;
    use(path: string, router: Router): Router;
    get(path: string, ...handlers: RequestHandler[]): Router;
    post(path: string, ...handlers: RequestHandler[]): Router;
    put(path: string, ...handlers: RequestHandler[]): Router;
    delete(path: string, ...handlers: RequestHandler[]): Router;
  }

  export function Router(): Router;

  const express: Express;
  export default express;
}