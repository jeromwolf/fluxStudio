// Physics debug utilities
export class PhysicsDebug {
  private static enabled = true
  private static prefix = '🔬'

  static log(...args: any[]) {
    if (this.enabled) {
      console.log(`${this.prefix} [Physics]`, ...args)
    }
  }

  static success(...args: any[]) {
    if (this.enabled) {
      console.log(`✅ [Physics]`, ...args)
    }
  }

  static error(...args: any[]) {
    console.error(`❌ [Physics]`, ...args)
  }

  static warn(...args: any[]) {
    if (this.enabled) {
      console.warn(`⚠️ [Physics]`, ...args)
    }
  }

  static info(...args: any[]) {
    if (this.enabled) {
      console.info(`ℹ️ [Physics]`, ...args)
    }
  }

  static setEnabled(enabled: boolean) {
    this.enabled = enabled
  }
}

// Export global for browser console access
if (typeof window !== 'undefined') {
  (window as any).PhysicsDebug = PhysicsDebug
}