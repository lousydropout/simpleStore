# Simple Store

#### Custom React Hooks for Global and Persistent State Management

## Introduction

This repository provides custom React hooks for managing state using different storage mechanisms, specifically localStorage/sessionStorage (`useSimpleStore`) and Chrome's chrome.storage APIs (`useChromeStore`).

## Hooks Included

1. `useSimpleStore`: A `React` hook that synchronizes state with the browser's `localStorage` or `sessionStorage`, depending on the specified option.
2. `useChromeStore`: A React hook that synchronizes state with either `chrome.storage.local` or `chrome.storage.session`, depending on the specified option.

Note: `useChromeStore` is only meant to be used inside Chrome extension projects since, otherwise, you wouldn't have access to Chrome's `chrome.storage APIs`.

## Usage of `useSimpleStore`

This hook is designed to keep your `React` component state in sync with either `localStorage` or `sessionStorage` based on a persist parameter.

```ts
import React from "react";
import { useSimpleStore } from "./useSimpleStore"; // Adjust the path as necessary

function ExampleComponent() {
  const [name, setName] = useSimpleStore("name", "Anonymous", true);

  return (
    <div>
      <input value={name} onChange={(e) => setName(e.target.value)} />
      <p>Hello, {name}!</p>
    </div>
  );
}
```

## Usage of `useChromeStore`

This hook allows you to manage state with Chrome's storage API, using either `chrome.storage.local` or `chrome.storage.session` based on a persist parameter.

```ts
import React from "react";
import { useChromeStore } from "./useChromeStore"; // Adjust the path as necessary

function ExampleComponent() {
  const [data, setData, hasLoaded] = useChromeStore(
    "myKey",
    "defaultValue",
    true
  );

  if (!hasLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <input value={data} onChange={(e) => setData(e.target.value)} />
      <p>Stored data: {data}</p>
    </div>
  );
}
```

## Contributing

Feel free to contribute to this project by opening issues or submitting pull requests. Contributions are always welcome!
