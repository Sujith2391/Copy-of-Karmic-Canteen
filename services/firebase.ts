// This file simulates a Firestore database connection for development purposes.
import { User, UserRole, DailyMenu, MealType, MealConfirmation, Feedback, WorkLocation, Notification } from '../types';

// --- MOCK DATABASE STORE ---
const MOCK_EMPLOYEES: User[] = [
  { id: 'emp123', name: 'Alex Ray', email: 'alex.ray@karmic.co.in', password: 'password', role: UserRole.EMPLOYEE, employeeId: 'K001', mobileNumber: '9876543210', workLocation: WorkLocation.MAIN_OFFICE },
  { id: 'emp124', name: 'Bethany Short', email: 'bethany.short@karmic.co.in', password: 'password', role: UserRole.EMPLOYEE, employeeId: 'K002', mobileNumber: '9876543211', workLocation: WorkLocation.WFH },
  { id: 'emp125', name: 'Charles Dane', email: 'charles.dane@karmic.co.in', password: 'password', role: UserRole.EMPLOYEE, employeeId: 'K003', mobileNumber: '9876543212', workLocation: WorkLocation.MAIN_OFFICE },
  { id: 'emp126', name: 'Diana Prince', email: 'diana.prince@karmic.co.in', password: 'password', role: UserRole.EMPLOYEE, employeeId: 'K004', mobileNumber: '9876543213', workLocation: WorkLocation.OTHER },
  { id: 'emp127', name: 'Sharath Kumar', email: 'sharath.kumar@karmic.co.in', password: 'password', role: UserRole.EMPLOYEE, employeeId: 'K005', mobileNumber: '9876543214', workLocation: WorkLocation.MAIN_OFFICE },
];
const MOCK_ADMIN: User = { id: 'adm456', name: 'Casey Jordan', email: 'casey.jordan@canteen.karmic.com', password: 'password', role: UserRole.ADMIN, employeeId: 'C001', mobileNumber: '8765432109', workLocation: WorkLocation.MAIN_OFFICE };
const MOCK_ADMIN_2: User = { id: 'adm457', name: 'Frank Miller', email: 'frank.miller@canteen.karmic.com', password: 'password', role: UserRole.ADMIN, employeeId: 'C002', mobileNumber: '8765432108', workLocation: WorkLocation.MAIN_OFFICE };
const MOCK_MAIN_ADMIN: User = { id: 'hr001', name: 'Harish Kumar', email: 'harish.kumar@hr.karmic.com', password: 'password', role: UserRole.MAIN_ADMIN, employeeId: 'H001', mobileNumber: '7654321098', workLocation: WorkLocation.MAIN_OFFICE };

const getTodaysDateString = () => new Date().toISOString().split('T')[0];

const mockWeeklyMenu: Omit<DailyMenu, 'date'>[] = [
    // Sunday (Day 0)
    {
        [MealType.BREAKFAST]: [{ id: 'b-sun-1', name: 'Pancakes', description: 'With maple syrup' }],
        [MealType.LUNCH]: [{ id: 'l-sun-1', name: 'Roast Chicken', description: 'With vegetables' }],
        [MealType.SNACKS]: [{ id: 's-sun-1', name: 'Brownie', description: 'Fudgy chocolate brownie' }],
        [MealType.DINNER]: [{ id: 'd-sun-1', name: 'Mushroom Risotto', description: 'Creamy and savory' }],
    },
    // Monday (Day 1)
    {
        [MealType.BREAKFAST]: [{ id: 'b-mon-1', name: 'Oatmeal Porridge', description: 'With fruits and nuts' }],
        [MealType.LUNCH]: [{ id: 'l-mon-1', name: 'Chicken Curry', description: 'With basmati rice' }],
        [MealType.SNACKS]: [{ id: 's-mon-1', name: 'Vegetable Samosa', description: 'Crispy and spicy' }],
        [MealType.DINNER]: [{ id: 'd-mon-1', name: 'Dal Makhani', description: 'With tandoori roti' }],
    },
    // Tuesday (Day 2)
    {
        [MealType.BREAKFAST]: [{ id: 'b-tue-1', name: 'Scrambled Eggs', description: 'Served with toast' }],
        [MealType.LUNCH]: [{ id: 'l-tue-1', name: 'Paneer Butter Masala', description: 'With naan' }],
        [MealType.SNACKS]: [{ id: 's-tue-1', name: 'Fruit Salad', description: 'Fresh seasonal fruits' }],
        [MealType.DINNER]: [{ id: 'd-tue-1', name: 'Egg Fried Rice', description: 'With chili chicken' }],
    },
    // Wednesday (Day 3)
    {
        [MealType.BREAKFAST]: [{ id: 'b-wed-1', name: 'Idli Sambar', description: 'South Indian delight' }],
        [MealType.LUNCH]: [{ id: 'l-wed-1', name: 'Vegetable Biryani', description: 'With raita' }],
        [MealType.SNACKS]: [{ id: 's-wed-1', name: 'Yogurt', description: 'Plain or flavored' }],
        [MealType.DINNER]: [{ id: 'd-wed-1', name: 'Chicken Noodle Soup', description: 'Hearty and warm' }],
    },
    // Thursday (Day 4)
    {
        [MealType.BREAKFAST]: [{ id: 'b-thu-1', name: 'Corn Flakes', description: 'With milk' }],
        [MealType.LUNCH]: [{ id: 'l-thu-1', name: 'Pasta Arrabiata', description: 'Spicy tomato sauce pasta' }],
        [MealType.SNACKS]: [{ id: 's-thu-1', name: 'Cookies', description: 'Chocolate chip cookies' }],
        [MealType.DINNER]: [{ id: 'd-thu-1', name: 'Vegetable Korma', description: 'With chapati' }],
    },
    // Friday (Day 5)
    {
        [MealType.BREAKFAST]: [{ id: 'b-fri-1', name: 'Aloo Paratha', description: 'With curd and pickle' }],
        [MealType.LUNCH]: [{ id: 'l-fri-1', name: 'Fish and Chips', description: 'Classic comfort food' }],
        [MealType.SNACKS]: [{ id: 's-fri-1', name: 'Popcorn', description: 'Salted popcorn' }],
        [MealType.DINNER]: [{ id: 'd-fri-1', name: 'Mutton Rogan Josh', description: 'Aromatic lamb curry' }],
    },
    // Saturday (Day 6)
    {
        [MealType.BREAKFAST]: [{ id: 'b-sat-1', name: 'Dosa', description: 'With chutney and sambar' }],
        [MealType.LUNCH]: [{ id: 'l-sat-1', name: 'Pizza Margherita', description: 'Simple and delicious' }],
        [MealType.SNACKS]: [{ id: 's-sat-1', name: 'Nachos', description: 'With cheese and salsa' }],
        [MealType.DINNER]: [{ id: 'd-sat-1', name: 'Khichdi', description: 'Light and wholesome' }],
    },
];

let mockConfirmations: MealConfirmation[] = [];

const mockFeedback: Feedback[] = [
    { id: 'fb1', userId: 'emp123', userName: 'Alex Ray', date: getTodaysDateString(), mealType: MealType.LUNCH, rating: 4, comment: 'The chicken curry was great, but a bit too spicy for me.' },
    { id: 'fb2', userId: 'emp125', userName: 'Charles Dane', date: getTodaysDateString(), mealType: MealType.BREAKFAST, rating: 5, comment: 'Loved the oatmeal porridge!' },
];

const mockNotifications: Notification[] = [
    { id: 'notif1', title: 'Diwali Celebration!', message: 'Join us for a special Diwali celebration lunch this Friday. Are you attending?', timestamp: Date.now() - 86400000, requiresAction: true, responses: { 'emp123': 'yes', 'emp124': 'no' } },
];

const dbStore = {
    users: [...MOCK_EMPLOYEES, MOCK_ADMIN, MOCK_ADMIN_2, MOCK_MAIN_ADMIN].map(u => ({ id: u.id, ...u })),
    weeklyMenu: mockWeeklyMenu.map((m, i) => ({ id: String(i), ...m })),
    confirmations: mockConfirmations.map(c => ({ id: `${c.userId}-${c.date}`, ...c })),
    feedback: mockFeedback.map(f => ({ id: f.id, ...f })),
    notifications: mockNotifications.map(n => ({ id: n.id, ...n })),
};

type CollectionName = keyof typeof dbStore;
const listeners: { [key: string]: Function[] } = {
    users: [], weeklyMenu: [], confirmations: [], feedback: [], notifications: [],
};

const notifyListeners = (collectionName: CollectionName) => {
    const snapshot = { docs: dbStore[collectionName].map(doc => ({ id: doc.id, data: () => ({...doc}) })) };
    listeners[collectionName].forEach(callback => callback(snapshot));
};

export const db = {};
export const collection = (db_instance: any, path: CollectionName) => ({ path });
export const doc = (db_instance: any, collectionPath: CollectionName, docId: string) => ({ collectionPath, docId });
export const query = (collectionRef: { path: CollectionName }, ...constraints: any[]) => ({ ...collectionRef, constraints });
export const where = (field: string, op: string, value: any) => ({ type: 'where', field, op, value });

export const getDoc = async (docRef: { collectionPath: CollectionName, docId: string }) => {
    await new Promise(res => setTimeout(res, 50));
    const doc = dbStore[docRef.collectionPath].find(d => d.id === docRef.docId);
    return { exists: () => !!doc, data: () => doc ? { ...doc } : undefined };
};

export const getDocs = async (queryRef: { path: CollectionName, constraints?: any[] }) => {
    await new Promise(res => setTimeout(res, 50));
    let docs = [...dbStore[queryRef.path]];
    if (queryRef.constraints) {
        queryRef.constraints.forEach(c => {
            if (c.type === 'where') {
                docs = docs.filter((d: any) => d[c.field] === c.value);
            }
        });
    }
    return { docs: docs.map(d => ({ id: d.id, data: () => ({ ...d }) })), empty: docs.length === 0 };
};

export const updateDoc = async (docRef: { collectionPath: CollectionName, docId: string }, data: any) => {
    await new Promise(res => setTimeout(res, 50));
    const collection = dbStore[docRef.collectionPath];
    const docIndex = collection.findIndex(d => d.id === docRef.docId);
    if (docIndex > -1) {
        collection[docIndex] = { ...collection[docIndex], ...data };
    }
    notifyListeners(docRef.collectionPath);
};

export const setDoc = async (docRef: { collectionPath: CollectionName, docId: string }, data: any) => {
    await new Promise(res => setTimeout(res, 50));
    const collection = dbStore[docRef.collectionPath];
    const docIndex = collection.findIndex(d => d.id === docRef.docId);
    if (docIndex > -1) {
        collection[docIndex] = { ...data, id: docRef.docId };
    } else {
        collection.push({ ...data, id: docRef.docId } as any);
    }
    notifyListeners(docRef.collectionPath);
};

export const addDoc = async (collectionRef: { path: CollectionName }, data: any) => {
    await new Promise(res => setTimeout(res, 50));
    const newId = `${collectionRef.path.slice(0, -1)}${Date.now()}`;
    const newDoc = { id: newId, ...data };
    dbStore[collectionRef.path].push(newDoc as any);
    notifyListeners(collectionRef.path);
    return { id: newId };
};

export const deleteDoc = async (docRef: { collectionPath: CollectionName, docId: string }) => {
    await new Promise(res => setTimeout(res, 50));
    dbStore[docRef.collectionPath] = dbStore[docRef.collectionPath].filter(d => d.id !== docRef.docId) as any;
    notifyListeners(docRef.collectionPath);
};

export const onSnapshot = (collectionRef: { path: CollectionName }, callback: Function) => {
    listeners[collectionRef.path].push(callback);
    const initialSnapshot = { docs: dbStore[collectionRef.path].map(doc => ({ id: doc.id, data: () => ({...doc}) })) };
    callback(initialSnapshot);

    return () => {
        const index = listeners[collectionRef.path].indexOf(callback);
        if (index > -1) listeners[collectionRef.path].splice(index, 1);
    };
};
