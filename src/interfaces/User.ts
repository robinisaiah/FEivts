export interface Session {
  login_time: string;
  logout_time: string | null;
}

export interface User {
  id: number;
  name: string;
  username: string;
  role: string;
  sessions?: Session[]; // Make it optional if some users may not have sessions
}
