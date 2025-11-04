export enum UserRole {
  EMPLOYEE = 'employee',
  ADMIN = 'admin',
  MAIN_ADMIN = 'main_admin',
}

export enum MealType {
  BREAKFAST = 'Breakfast',
  LUNCH = 'Lunch',
  SNACKS = 'Snacks',
  DINNER = 'Dinner',
}

export enum WorkLocation {
  MAIN_OFFICE = 'Main Office',
  WFH = 'Work From Home',
  OTHER = 'Any other',
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Stored hashed in a real DB
  role: UserRole;
  employeeId: string;
  mobileNumber: string;
  workLocation: WorkLocation;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
}

export interface DailyMenu {
  date: string;
  [MealType.BREAKFAST]: MenuItem[];
  [MealType.LUNCH]: MenuItem[];
  [MealType.SNACKS]: MenuItem[];
  [MealType.DINNER]: MenuItem[];
}

export interface MealConfirmation {
  userId: string;
  date: string;
  [MealType.BREAKFAST]: boolean;
  [MealType.LUNCH]: boolean;
  [MealType.SNACKS]: boolean;
  [MealType.DINNER]: boolean;
}

export interface ConsolidatedReport {
    date: string;
    mealType: MealType;
    confirmed: number; 
}

export interface EmployeeConfirmationDetails extends User {
    confirmation: MealConfirmation;
}

export interface Feedback {
  id: string;
  userId: string;
  userName: string;
  date: string;
  mealType: MealType;
  rating: number; // 1 to 5
  comment: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: number;
  requiresAction: boolean;
  responses?: { [userId: string]: 'yes' | 'no' };
}
