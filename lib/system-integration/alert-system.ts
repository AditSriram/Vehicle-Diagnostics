import type { AlertConfig } from "@/types"

export class AlertSystem {
  private config: AlertConfig

  constructor(config: AlertConfig) {
    this.config = config
  }

  public triggerAlert(alertType: "tire" | "engine", severity: number, message: string): void {
    // Check if severity exceeds threshold
    if (severity < this.config.threshold) {
      return
    }

    // Create alert object
    const alert = {
      type: alertType,
      severity,
      message,
      timestamp: new Date().toISOString(),
    }

    // Trigger appropriate alert types
    if (this.config.visual) {
      this.triggerVisualAlert(alert)
    }

    if (this.config.audio) {
      this.triggerAudioAlert(alert)
    }

    if (this.config.haptic) {
      this.triggerHapticAlert(alert)
    }

    // Log alert
    console.log(`[ALERT] ${alertType.toUpperCase()} - Severity: ${severity} - ${message}`)
  }

  private triggerVisualAlert(alert: any): void {
    // In a real implementation, this would update UI elements
    // For this example, we'll just log the action
    const color = alert.severity >= 90 ? "red" : alert.severity >= 70 ? "orange" : "yellow"

    console.log(`[VISUAL ALERT] Displaying ${color} alert: ${alert.message}`)
  }

  private triggerAudioAlert(alert: any): void {
    // In a real implementation, this would play audio
    // For this example, we'll just log the action
    const volume = alert.severity >= 90 ? "high" : alert.severity >= 70 ? "medium" : "low"

    console.log(`[AUDIO ALERT] Playing ${volume} volume alert`)
  }

  private triggerHapticAlert(alert: any): void {
    // In a real implementation, this would trigger haptic feedback
    // For this example, we'll just log the action
    const intensity = alert.severity >= 90 ? "strong" : alert.severity >= 70 ? "medium" : "light"

    console.log(`[HAPTIC ALERT] Triggering ${intensity} haptic feedback`)
  }
}

