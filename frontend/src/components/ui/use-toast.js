import { useState, useEffect } from 'react';

const TOAST_LIMIT = 5;

let count = 0;
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

const listeners = [];
let memoryState = { toasts: [] };

function dispatch(action) {
  switch (action.type) {
    case 'ADD_TOAST':
      memoryState = {
        ...memoryState,
        toasts: [action.toast, ...memoryState.toasts].slice(0, TOAST_LIMIT),
      };
      break;
    case 'UPDATE_TOAST':
      memoryState = {
        ...memoryState,
        toasts: memoryState.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      };
      break;
    case 'DISMISS_TOAST': {
      const { toastId } = action;
      memoryState = {
        ...memoryState,
        toasts: memoryState.toasts.filter((t) => t.id !== toastId),
      };
      break;
    }
    default:
      break;
  }

  listeners.forEach((listener) => {
    listener(memoryState);
  });
}

export function toast({ title, description, variant = 'default', duration = 4000 }) {
  const id = genId();

  const update = (props) =>
    dispatch({
      type: 'UPDATE_TOAST',
      toast: { ...props, id },
    });

  const dismiss = () => dispatch({ type: 'DISMISS_TOAST', toastId: id });

  dispatch({
    type: 'ADD_TOAST',
    toast: {
      id,
      title,
      description,
      variant,
    },
  });

  if (duration !== Infinity) {
    setTimeout(() => {
      dismiss();
    }, duration);
  }

  return {
    id,
    dismiss,
    update,
  };
}

toast.success = (title, description) => toast({ title, description, variant: 'success' });
toast.error = (title, description) => toast({ title, description, variant: 'destructive' });

export function useToast() {
  const [state, setState] = useState(memoryState);

  useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, []);

  return {
    ...state,
    toast,
    dismiss: (toastId) => dispatch({ type: 'DISMISS_TOAST', toastId }),
  };
}
