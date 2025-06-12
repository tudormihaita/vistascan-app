import { notification } from 'antd';
import { store } from '../store/store';
import { consultationApi } from '../api/consultationApi';
import { adminApi } from '../api/adminApi';
import { LocalStorageKeys } from '../types/enums/LocalStorageKeys';
import { UserRole } from '../types/dtos/UserDto';
import {AppConfig} from "../types/constants/AppConfig.ts";

export interface NotificationEvent {
  event_type: 'consultation_created' | 'consultation_assigned' | 'consultation_status_changed' | 'consultation_completed' | 'consultation_deleted';
  consultation_id: string;
  patient_id: string;
  expert_id?: string;
  old_status?: string;
  new_status?: string;
  timestamp: string;
  message: string;
}

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isManualClose = false;
  private heartbeatInterval: ReturnType<typeof setTimeout> | null = null;
  private userRole: UserRole | null = null;
  private userId: string | null = null;

  constructor() {
    this.updateUserInfo();
  }

  private updateUserInfo(): void {
    this.userRole = localStorage.getItem(LocalStorageKeys.USER_ROLE) as UserRole;
    this.userId = localStorage.getItem(LocalStorageKeys.USER_ID);
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  connect(): void {
    this.updateUserInfo();
    const token = localStorage.getItem(LocalStorageKeys.USER_TOKEN);

    if (!token) {
      console.warn('No token available for WebSocket connection');
      return;
    }

    if (this.isConnected()) {
      console.log('WebSocket already connected');
      return;
    }

    const wsUrl = `${AppConfig.wsUrl}/${token}`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('WebSocket connected successfully');
        this.reconnectAttempts = 0;
        this.setupHeartbeat();
      };

      this.ws.onmessage = (event) => {
        this.handleMessage(event.data);
      };

      this.ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        this.clearHeartbeat();

        if (!this.isManualClose && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.scheduleReconnect();
        } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          notification.warning({
            message: 'Connection Issues',
            description: 'Real-time updates may be delayed. The page will refresh data automatically.',
            placement: 'topRight',
            duration: 6,
          });
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
    }
  }

  disconnect(): void {
    console.log('Manually disconnecting WebSocket');
    this.isManualClose = true;
    this.clearHeartbeat();

    if (this.ws) {
      this.ws.close(1000, 'Manual disconnect');
      this.ws = null;
    }
  }

  private handleMessage(data: string): void {
    try {
      if (data === 'pong' || data.includes('Connected to notifications')) {
        return;
      }

      const event: NotificationEvent = JSON.parse(data);
      console.log('Received notification:', event);
      this.processNotificationEvent(event);
    } catch (error) {
      console.error('Error parsing WebSocket message:', error, 'Data:', data);
    }
  }

  private processNotificationEvent(event: NotificationEvent): void {
    this.invalidateRelevantQueries(event);

    this.showNotification(event);
  }

  private invalidateRelevantQueries(event: NotificationEvent): void {
    const dispatch = store.dispatch;

    switch (event.event_type) {
      case 'consultation_created':
        dispatch(consultationApi.util.invalidateTags([
          'consultationsCache',
          'allConsultationsCache'
        ]));
        break;

      case 'consultation_assigned':
      case 'consultation_status_changed':
      case 'consultation_completed':
        dispatch(consultationApi.util.invalidateTags([
          { type: 'consultationsCache', id: event.consultation_id },
          'consultationsCache',
          'allConsultationsCache'
        ]));

        if (store.getState().api?.queries) {
          dispatch(adminApi.util.invalidateTags(['allConsultationsCache']));
        }
        break;


      case 'consultation_deleted':
        dispatch(consultationApi.util.invalidateTags([
          { type: 'consultationsCache', id: event.consultation_id },
          'consultationsCache',
          'allConsultationsCache'
        ]));

        dispatch(adminApi.util.invalidateTags([
          'allConsultationsCache',
          'usersCache'
        ]));
        break;
    }

    console.log('Cache invalidated for event:', event.event_type);
  }

  private showNotification(event: NotificationEvent): void {
    const isMyConsultation = event.patient_id === this.userId || event.expert_id === this.userId;
    const currentRole = this.userRole;

    switch (event.event_type) {
      case 'consultation_created':
        if (currentRole === UserRole.EXPERT || currentRole === UserRole.ADMIN) {
          notification.info({
            message: 'New consultation available',
            description: 'A new imaging study has been submitted and is ready for review.',
            placement: 'topRight',
            duration: 6,
            key: `new-consultation-${event.consultation_id}`,
          });
        }
        break;

      case 'consultation_assigned':
        if (currentRole === UserRole.PATIENT && isMyConsultation) {
          notification.success({
            message: 'Expert assigned',
            description: 'An expert has been assigned to review your imaging study.',
            placement: 'topRight',
            duration: 6,
            key: `assigned-patient-${event.consultation_id}`,
          });
        } else if ((currentRole === UserRole.EXPERT || currentRole === UserRole.ADMIN) && event.expert_id === this.userId) {
          notification.success({
            message: 'Consultation assigned to you',
            description: 'You have successfully been assigned to this consultation.',
            placement: 'topRight',
            duration: 6,
            key: `assigned-expert-${event.consultation_id}`,
          });
        } else if ((currentRole === UserRole.EXPERT || currentRole === UserRole.ADMIN) && !isMyConsultation) {
          notification.info({
            message: 'Consultation assigned',
            description: 'A consultation has been assigned to another expert.',
            placement: 'topRight',
            duration: 4,
            key: `assigned-other-${event.consultation_id}`,
          });
        }
        break;

      case 'consultation_completed':
        if (currentRole === UserRole.PATIENT && isMyConsultation) {
          notification.success({
            message: 'Report ready!',
            description: 'Your consultation review is complete. You can now view your diagnostic report.',
            placement: 'topRight',
            duration: 8,
            key: `completed-patient-${event.consultation_id}`,
          });
        } else if ((currentRole === UserRole.EXPERT || currentRole === UserRole.ADMIN) && event.expert_id === this.userId) {
          notification.success({
            message: 'Report submitted',
            description: 'Your consultation report has been successfully submitted.',
            placement: 'topRight',
            duration: 6,
            key: `completed-expert-${event.consultation_id}`,
          });
        } else if (currentRole === UserRole.EXPERT || currentRole === UserRole.ADMIN) {
          notification.info({
            message: 'Consultation completed',
            description: 'A consultation review has been completed.',
            placement: 'topRight',
            duration: 4,
            key: `completed-other-${event.consultation_id}`,
          });
        }
        break;

      case 'consultation_status_changed':
        if (isMyConsultation) {
          const statusMessage = this.getStatusChangeMessage(event.old_status, event.new_status);
          notification.info({
            message: 'Status updated',
            description: statusMessage,
            placement: 'topRight',
            duration: 5,
            key: `status-change-${event.consultation_id}`,
          });
        }
        break;
    }
  }

  private getStatusChangeMessage(oldStatus?: string, newStatus?: string): string {
    if (oldStatus === 'PENDING' && newStatus === 'IN_REVIEW') {
      return 'Your consultation is now under review by an expert.';
    }
    if (oldStatus === 'IN_REVIEW' && newStatus === 'COMPLETED') {
      return 'Your consultation review is complete!';
    }
    return `Status changed from ${oldStatus} to ${newStatus}`;
  }

  private scheduleReconnect(): void {
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(`⏳ Scheduling WebSocket reconnect attempt ${this.reconnectAttempts} in ${delay}ms`);

    setTimeout(() => {
      if (!this.isManualClose) {
        this.isManualClose = false; // Reset for reconnection
        this.connect();
      }
    }, delay);
  }

  private setupHeartbeat(): void {
    this.clearHeartbeat();
    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send('ping');
      } else {
        this.clearHeartbeat();
      }
    }, 30000);
  }

  private clearHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }
}

export const websocketService = new WebSocketService();