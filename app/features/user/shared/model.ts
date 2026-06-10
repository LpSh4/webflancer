export type UserRole = 'ADMIN' | 'MODERATOR' | 'CLIENT' | 'DEVELOPER';

export interface UserProfile {
    id: string;
    role: UserRole;
    login: string;
    email: string;
    phoneNumber: string;
    verifiedEmail: boolean;
    displayedName: string;
    name: string;
    surname?: string | null;
    profilePicture?: string;
    profileStatus?: string;
    lastOnline?: Date | null;
    averageRating?: number;
}

// Один в один повторяем структуру UpdateUserData с бэкенда
export interface UpdateUserProfileDto {
    id: string;
    role?: UserRole;
    login?: string;
    phoneNumber?: string;
    name?: string;
    surname?: string;
    displayedName?: string;
    companyName?: string;
    companyLink?: string;
    socialLinkedIn?: string;
    socialX?: string;
    socialGitHub?: string;
    portfolioLinks?: string[];
    bio?: string;
    avgHourlyRate?: number;
}