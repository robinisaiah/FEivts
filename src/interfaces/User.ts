export interface Session {
  login_time: string;
  logout_time: string | null;
  duration:string
}

export interface User {
  id: number;
  name: string;
  username: string;
  role: string;
  login_time: string;
  logout_time: string | null;
  duration:string // Make it optional if some users may not have sessions
}
