# RHF-Jotai Sync

This repository demonstrates a proof-of-concept for bidirectional synchronization between [React Hook Form](https://react-hook-form.com/) and [Jotai](https://jotai.org/) state management.

## Features

- 🔄 Bidirectional sync between React Hook Form state and Jotai atoms
- ⏱️ Debounced updates to optimize performance
- ↩️ Undo/Redo functionality using `jotai-history`
- 🌳 Support for nested form fields
- 🎯 Clean separation of form UI and state management

## How It Works

The implementation uses a two-atom approach:

1. `baseAtom`: A primitive atom that holds the current form state
2. `formValuesAtom`: A derived atom that:
   - Gets values from the base atom
   - Writes values back to React Hook Form when updated

The form state is synchronized:
- From RHF to Jotai: Using a subscription to the `watch` method with debouncing
- From Jotai to RHF: Through the write function in the derived atom

## Implementation Details

```tsx
// Base atom holds form state
const baseAtom = atom(initialFormValues);

// Derived atom provides bidirectional sync
const formValuesAtom = atom(
  (get) => get(baseAtom),
  (_get, _set, values) => {
    // Update RHF when atom changes
    reset(values);
  }
);

// History-enabled atom for undo/redo
const historyAtom = withHistory(formValuesAtom);

// Subscribe to RHF changes
useEffect(() => {
  const debouncedSetBase = debounce(setBase, 50);
  const subscription = watch((_, { values }) => {
    if (values) debouncedSetBase(values);
  });
  
  return () => {
    subscription.unsubscribe();
    debouncedSetBase.cancel();
  };
}, [watch, setBase]);
```

## Technologies Used

- [React](https://reactjs.org/)
- [React Hook Form](https://react-hook-form.com/) - For form management
- [Jotai](https://jotai.org/) - For state management
- [jotai-history](https://github.com/jotai-labs/jotai-history) - For undo/redo functionality
- [Lodash debounce](https://lodash.com/docs/#debounce) - For performance optimization
- [Vite](https://vitejs.dev/) - For development and building
- [TailwindCSS](https://tailwindcss.com/) - For styling

## Getting Started

1. Clone the repository
2. Install dependencies with `npm install` or `yarn install`
3. Start the development server with `npm run dev` or `yarn dev`

## Use Cases

This approach is particularly useful for:

- Complex forms requiring state persistence outside the form
- Forms that need to integrate with global application state
- Implementing advanced features like undo/redo
- Creating reusable form components with complex state management