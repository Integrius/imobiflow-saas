type ToastType = 'success' | 'error' | 'info' | 'warning';

class ToastManager {
  private listeners: ((message: string, type: ToastType) => void)[] = [];

  subscribe(listener: (message: string, type: ToastType) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  show(message: string, type: ToastType = 'info') {
    this.listeners.forEach(listener => listener(message, type));
  }

  success(message: string) {
    this.show(message, 'success');
  }

  error(message: string) {
    this.show(message, 'error');
  }

  info(message: string) {
    this.show(message, 'info');
  }

  warning(message: string) {
    this.show(message, 'warning');
  }
}

export const toast = new ToastManager();
