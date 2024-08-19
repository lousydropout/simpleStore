import { useEffect, useState } from "react";

type ChromeStoreSet = {
  [key: string]: any; // To accommodate JSON parsing
};

// Define the function signature with generic type T for the return value.
/**
 * Retrieves a value from Chrome storage based on the provided key.
 * If the value exists in storage, it attempts to parse it into an object of type T.
 * If parsing fails, it resolves with the default value.
 * If the key does not exist in storage, it resolves with the default value.
 *
 * @param {string} key - The key used to retrieve the value from storage.
 * @param {T} defaultValue - The default value to be used if the key does not exist or parsing fails.
 * @param {boolean} [persist=false] - Optional flag indicating whether to use local storage (true) or session storage (false). Default is false.
 * @returns {Promise<T>} A promise that resolves with the retrieved value or the default value.
 */
function getFromChromeStore<T>(
  key: string,
  defaultValue: T,
  persist: boolean = false
): Promise<T> {
  const storage = persist ? chrome.storage.local : chrome.storage.session;

  return new Promise((resolve) => {
    storage.get([key], (result) => {
      if (result[key] !== undefined) {
        try {
          // Attempt to parse the stored JSON string back into an object of type T.
          const value: T = JSON.parse(result[key]);
          resolve(value);
        } catch (error) {
          console.error("[Warning] Error parsing value from storage:", error);
          // Resolve with the default value if parsing fails.
          resolve(defaultValue);
        }
      } else {
        // Resolve with the default value if the key does not exist in storage.
        resolve(defaultValue);
      }
    });
  });
}

/**
 * Custom hook for managing state in Chrome storage.
 *
 * @template T - The type of the value stored in Chrome storage.
 * @param {string} key - The key used to store the value in Chrome storage.
 * @param {T} defaultValue - The default value to be used if no value is found in Chrome storage.
 * @param {boolean} [persist=false] - Determines whether the value should persist in local storage or session storage.
 * @returns {[T, React.Dispatch<React.SetStateAction<T>>, boolean]} - An array containing the current value, a function to update the value, and a boolean indicating whether the value has been loaded from storage.
 */
function useChromeStore<T>(
  key: string,
  defaultValue: T,
  persist: boolean = false
): [T, React.Dispatch<React.SetStateAction<T>>, boolean] {
  const [value, setValue] = useState<T>(defaultValue);
  const [hasLoaded, setHasLoaded] = useState<boolean>(false);

  const storage = persist ? chrome.storage.local : chrome.storage.session;

  useEffect(() => {
    // Asynchronously get the stored value from the appropriate chrome storage
    storage.get([key], (result: ChromeStoreSet) => {
      if (result[key] !== undefined) {
        try {
          setValue(JSON.parse(result[key]) as T);
        } catch (error) {
          console.debug("[Warning] Error parsing value from storage:", error);
          setValue(result[key] as unknown as T);
        }
      }
      setHasLoaded(true); // Update loaded state to true after fetching the value
    });
  }, [key]);

  useEffect(() => {
    // Function to handle changes in the appropriate chrome storage
    const handleStorageChange = (
      changes: { [key: string]: chrome.storage.StorageChange },
      areaName: string
    ) => {
      console.log("Changes in storage: ", changes);
      if (
        (persist && areaName === "local") ||
        (!persist && areaName === "session")
      ) {
        if (changes[key]) {
          try {
            const newValue = changes[key].newValue;
            setValue(JSON.parse(newValue) as T);
          } catch (error) {
            if (error instanceof SyntaxError) {
              setValue(changes[key].newValue as unknown as T);
            } else {
              console.debug(
                "[Warning] Error parsing updated value from storage:",
                error
              );
            }
          }
        }
      }
    };

    // Listen for changes in storage
    chrome.storage.onChanged.addListener(handleStorageChange);

    // Cleanup the listener when the component unmounts or the key or storage changes
    return () => chrome.storage.onChanged.removeListener(handleStorageChange);
  }, [key]);

  const setStoredValue: React.Dispatch<React.SetStateAction<T>> = (
    valueAction
  ) => {
    const valueToStore: T =
      valueAction instanceof Function ? valueAction(value) : valueAction;
    setValue(valueToStore);
    storage.set({ [key]: JSON.stringify(valueToStore) });
  };

  return [value, setStoredValue, hasLoaded];
}

export { getFromChromeStore, useChromeStore };
