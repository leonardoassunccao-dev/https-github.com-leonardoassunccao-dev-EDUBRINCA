
import { LessonPlan, ActivitySheet, AppState } from '../types';

const DB_NAME = 'EduBrincaDB';
const DB_VERSION = 2; // Versão incrementada para garantir atualização do schema

export const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onupgradeneeded = (event) => {
      const db = request.result;
      // Cria as stores se não existirem
      if (!db.objectStoreNames.contains('plans')) {
        db.createObjectStore('plans', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('activities')) {
        db.createObjectStore('activities', { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => {
      console.error("Erro ao abrir DB:", request.error);
      reject(request.error);
    };
  });
};

export const saveToDB = async (store: 'plans' | 'activities', item: any) => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(store, 'readwrite');
      const objectStore = transaction.objectStore(store);
      const request = objectStore.put(item); // .put atualiza se existir ou cria se novo

      request.onsuccess = () => resolve(true);
      request.onerror = () => {
        console.error(`Erro ao salvar em ${store}:`, request.error);
        reject(request.error);
      };
    });
  } catch (e) {
    console.error("Erro na conexão com DB:", e);
    throw e;
  }
};

export const getAllFromDB = async (store: 'plans' | 'activities'): Promise<any[]> => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(store, 'readonly');
      const objectStore = transaction.objectStore(store);
      const request = objectStore.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    console.error("Erro ao ler DB:", e);
    return [];
  }
};

export const deleteFromDB = async (store: 'plans' | 'activities', id: string) => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(store, 'readwrite');
      const request = transaction.objectStore(store).delete(id);
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    console.error("Erro ao deletar do DB:", e);
    throw e;
  }
};
