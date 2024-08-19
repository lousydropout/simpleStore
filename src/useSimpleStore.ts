import { useEffect, useState } from "react";

function useSimpleStore<T>(
  key: string,
  defaultValue: T,
  persist: boolean = true
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const storage = persist ? localStorage : sessionStorage;

  const [value, setValue] = useState<T>(() => {
    const storedValue = storage.getItem(key);
    return storedValue ? JSON.parse(storedValue) : defaultValue;
  });

  useEffect(() => {
    const handleStorageChange = () => {
      const storedValue = storage.getItem(key);
      if (storedValue !== null) {
        setValue(JSON.parse(storedValue));
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => window.removeEventListener("storage", handleStorageChange);
  }, [key, storage]);

  const setStoredValue: React.Dispatch<React.SetStateAction<T>> = (
    valueAction
  ) => {
    const valueToStore =
      valueAction instanceof Function ? valueAction(value) : valueAction;
    setValue(valueToStore);
    storage.setItem(key, JSON.stringify(valueToStore));
  };

  return [value, setStoredValue];
}

export { useSimpleStore };
