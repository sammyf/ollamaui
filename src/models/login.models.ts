export class LoginResult {
  public result:boolean = false;
  public csrf_token: string = "";
}

export class LoginData {
  public username: string = "";
  public password: string = "";
}
