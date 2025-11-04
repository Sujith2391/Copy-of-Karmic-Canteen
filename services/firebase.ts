// This file simulates a Firestore database connection for development purposes.
// To connect to a real Firebase project, you would:
// 1. Install the Firebase SDK: `npm install firebase`
// 2. Create a file in your project with your actual Firebase config.
// 3. Initialize Firebase: `import { initializeApp } from "firebase/app"; ... const app = initializeApp(firebaseConfig);`
// 4. Export the Firestore instance: `export const db = getFirestore(app);`
// 5. The functions in `api.ts` will then work with your live database without any other changes.

import { User, UserRole, DailyMenu, MealType, MealConfirmation } from '../types';

// --- MOCK DATABASE STORE ---
const MOCK_EMPLOYEES: User[] = [
  { id: 'emp123', name: 'Alex Ray', email: 'alex.ray@karmic.com', role: UserRole.EMPLOYEE },
  { id: 'emp124', name: 'Bethany Short', email: 'bethany.short@karmic.com', role: UserRole.EMPLOYEE },
  { id: 'emp125', name: 'Charles Dane', email: 'charles.dane@karmic.com', role: UserRole.EMPLOYEE },
  { id: 'emp126', name: 'Diana Prince', email: 'diana.prince@karmic.com', role: UserRole.EMPLOYEE },
  { id: 'emp127', name: 'Sharath Kumar', email: 'sharath.kumar@karmic.com', role: UserRole.EMPLOYEE },
  { id: 'emp128', name: 'Deekshith Naik', email: 'deekshith.naik@karmic.com', role: UserRole.EMPLOYEE },
  { id: 'emp129', name: 'Sujith D', email: 'sujith.d@karmic.com', role: UserRole.EMPLOYEE },
  { id: 'emp130', name: 'Nandan Naik', email: 'nandan.naik@karmic.com', role: UserRole.EMPLOYEE },
];
const MOCK_ADMIN: User = { id: 'adm456', name: 'Casey Jordan', email: 'casey.jordan@canteen.karmic.com', role: UserRole.ADMIN };
const MOCK_MAIN_ADMIN: User = { id: 'hr001', name: 'Harish Kumar', email: 'harish.kumar@hr.karmic.com', role: UserRole.MAIN_ADMIN };


const getTodaysDateString = () => new Date().toISOString().split('T')[0];

const mockWeeklyMenu: Omit<DailyMenu, 'date'>[] = [
    // Sunday (Day 0)
    {
        [MealType.BREAKFAST]: [{ id: 'b-sun-1', name: 'Pancakes', description: 'With maple syrup' }],
        [MealType.LUNCH]: [{ id: 'l-sun-1', name: 'Roast Chicken', description: 'With vegetables' }],
        [MealType.SNACKS]: [{ id: 's-sun-1', name: 'Brownie', description: 'Fudgy chocolate brownie' }],
    },
    // Monday (Day 1)
    {
        [MealType.BREAKFAST]: [{ id: 'b-mon-1', name: 'Oatmeal Porridge', description: 'With fruits and nuts' }],
        [MealType.LUNCH]: [{ id: 'l-mon-1', name: 'Chicken Curry', description: 'With basmati rice' }],
        [MealType.SNACKS]: [{ id: 's-mon-1', name: 'Vegetable Samosa', description: 'Crispy and spicy' }],
    },
    // Tuesday (Day 2)
    {
        [MealType.BREAKFAST]: [{ id: 'b-tue-1', name: 'Scrambled Eggs', description: 'Served with toast' }],
        [MealType.LUNCH]: [{ id: 'l-tue-1', name: 'Paneer Butter Masala', description: 'Vegetarian option with naan' }],
        [MealType.SNACKS]: [{ id: 's-tue-1', name: 'Fruit Salad', description: 'Fresh seasonal fruits' }],
    },
    // Wednesday (Day 3)
    {
        [MealType.BREAKFAST]: [{ id: 'b-wed-1', name: 'Idli Sambar', description: 'South Indian delight' }],
        [MealType.LUNCH]: [{ id: 'l-wed-1', name: 'Vegetable Biryani', description: 'With raita' }],
        [MealType.SNACKS]: [{ id: 's-wed-1', name: 'Yogurt', description: 'Plain or flavored' }],
    },
    // Thursday (Day 4)
    {
        [MealType.BREAKFAST]: [{ id: 'b-thu-1', name: 'Corn Flakes', description: 'With milk' }],
        [MealType.LUNCH]: [{ id: 'l-thu-1', name: 'Pasta Arrabiata', description: 'Spicy tomato sauce pasta' }],
        [MealType.SNACKS]: [{ id: 's-thu-1', name: 'Cookies', description: 'Chocolate chip cookies' }],
    },
    // Friday (Day 5)
    {
        [MealType.BREAKFAST]: [{ id: 'b-fri-1', name: 'Aloo Paratha', description: 'With curd and pickle' }],
        [MealType.LUNCH]: [{ id: 'l-fri-1', name: 'Fish and Chips', description: 'Classic comfort food' }],
        [MealType.SNACKS]: [{ id: 's-fri-1', name: 'Popcorn', description: 'Salted popcorn' }],
    },
    // Saturday (Day 6)
    {
        [MealType.BREAKFAST]: [{ id: 'b-sat-1', name: 'Dosa', description: 'With chutney and sambar' }],
        [MealType.LUNCH]: [{ id: 'l-sat-1', name: 'Pizza Margherita', description: 'Simple and delicious' }],
        [MealType.SNACKS]: [{ id: 's-sat-1', name: 'Nachos', description: 'With cheese and salsa' }],
    },
];

let mockConfirmations: MealConfirmation[] = MOCK_EMPLOYEES.map(emp => ({
    userId: emp.id,
    date: getTodaysDateString(),
    [MealType.BREAKFAST]: Math.random() > 0.4,
    [MealType.LUNCH]: Math.random() > 0.2,
    [MealType.SNACKS]: Math.random() > 0.6,
    breakfastReconfirmed: false,
    lunchReconfirmed: false,
    snacksReconfirmed: false,
    wfh: false,
}));

// In Firestore, documents have unique IDs. We'll simulate that.
const dbStore = {
    users: [...MOCK_EMPLOYEES, MOCK_ADMIN, MOCK_MAIN_ADMIN].map(u => ({ id: u.id, ...u })),
    weeklyMenu: mockWeeklyMenu.map((m, i) => ({ id: String(i), ...m })),
    confirmations: mockConfirmations.map(c => ({ id: `${c.userId}-${c.date}`, ...c })),
};

// Fix: Define a type for collection names to enforce type safety.
type CollectionName = keyof typeof dbStore;

const listeners: { [key: string]: Function[] } = {
    confirmations: [],
    users: [],
    weeklyMenu: [],
};

const notifyListeners = (collectionName: keyof typeof dbStore) => {
    // A simple way to simulate a query snapshot for onSnapshot listeners
    const snapshot = {
        docs: dbStore[collectionName].map(doc => ({
            id: doc.id,
            data: () => ({...doc})
        }))
    };
    listeners[collectionName].forEach(callback => callback(snapshot));
};

// --- SIMULATED FIRESTORE FUNCTIONS ---

export const db = {}; // Placeholder for the db instance, not used in mock but keeps signature consistent

// Fix: Use the specific CollectionName type instead of a generic string.
export const collection = (db_instance: any, path: CollectionName) => ({ path });

// Fix: Use the specific CollectionName type instead of a generic string.
export const doc = (db_instance: any, collectionPath: CollectionName, docId: string) => ({ collectionPath, docId });

export const getDoc = async (docRef: { collectionPath: keyof typeof dbStore, docId: string }) => {
    await new Promise(res => setTimeout(res, 50)); // Simulate network latency
    const doc = dbStore[docRef.collectionPath].find(d => d.id === docRef.docId);
    return {
        exists: () => !!doc,
        data: () => doc ? { ...doc } : undefined,
    };
};

export const getDocs = async (collectionRef: { path: keyof typeof dbStore }) => {
    await new Promise(res => setTimeout(res, 50));
    const docs = dbStore[collectionRef.path];
    return {
        docs: docs.map(d => ({
            id: d.id,
            data: () => ({ ...d }),
        }))
    };
};

export const updateDoc = async (docRef: { collectionPath: keyof typeof dbStore, docId: string }, data: any) => {
    await new Promise(res => setTimeout(res, 50));
    const collection = dbStore[docRef.collectionPath];
    const docIndex = collection.findIndex(d => d.id === docRef.docId);
    if (docIndex > -1) {
        collection[docIndex] = { ...collection[docIndex], ...data };
    } else {
        // If doc doesn't exist, create it (simulates `setDoc` with merge)
        const newDoc = { id: docRef.docId, ...data };
        collection.push(newDoc as any);
    }
    notifyListeners(docRef.collectionPath);
};

// New mock functions for User CRUD
export const addDoc = async (collectionRef: { path: keyof typeof dbStore }, data: any) => {
    await new Promise(res => setTimeout(res, 50));
    const newId = `${collectionRef.path.slice(0, -1)}${Date.now()}`;
    const newDoc = { id: newId, ...data };
    dbStore[collectionRef.path].push(newDoc as any);
    notifyListeners(collectionRef.path);
    return { id: newId };
};

export const deleteDoc = async (docRef: { collectionPath: keyof typeof dbStore, docId: string }) => {
    await new Promise(res => setTimeout(res, 50));
    const collection = dbStore[docRef.collectionPath];
    const docIndex = collection.findIndex(d => d.id === docRef.docId);
    if (docIndex > -1) {
        collection.splice(docIndex, 1);
    }
    notifyListeners(docRef.collectionPath);
};


// Simplified onSnapshot for real-time updates
export const onSnapshot = (collectionRef: { path: keyof typeof dbStore }, callback: Function) => {
    const listenerList = listeners[collectionRef.path];
    if (!listenerList) return () => {};

    listenerList.push(callback);
    
    // Initial call with current data
    const initialSnapshot = {
        docs: dbStore[collectionRef.path].map(doc => ({
            id: doc.id,
            data: () => ({...doc})
        }))
    };
    callback(initialSnapshot);

    // Return an unsubscribe function
    return () => {
        const index = listenerList.indexOf(callback);
        if (index > -1) {
            listenerList.splice(index, 1);
        }
    };
};