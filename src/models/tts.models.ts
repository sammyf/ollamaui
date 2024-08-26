export class TtsRequest {
  public text: string = "No text was submitted.";
  public voice: string = "p243";
}

export class TtsResponse {
  public url: string = "";
}

export class UrlRequest {
  public url: string = "";
}

export class QueryResponse {
  public query: string = "";
}

export class UrlResponse {
  public content: string = "";
  public returnCode: number = 200;
}
