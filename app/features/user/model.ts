export type UserRole =
    | 'hr'
    | 'teamlead'
    | 'intern';


export interface UserProfile {
    id: string;
    role: string;
    login: string;
    email?: string;
    displayName?: string;
    avatar?: string;
    lastOnline?: Date;
}



