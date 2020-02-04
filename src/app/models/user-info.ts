export interface UserInfo {
    firstName: string;
    lastName: string;
    email: string;
    locations?: {
        key: string;
        label: string;
    }[];
}
