export interface Webinar {
  id: number;
  name: string;
  description: string;
  startTime: string;
  endTime: string;
  webinarDate: string;
  posterUrl: string;
  location: string;
  primaryMentorId: number;
  secondaryMentorId: number | null;
  createdAt: string;
  updatedAt: string;
  primaryMentor?: WebinarMentorSummary | null;
  secondaryMentor?: WebinarMentorSummary | null;
}

export interface WebinarMentorSummary {
  id: number;
  name: string;
  designation?: string | null;
  specialization?: string | null;
}

export interface WebinarDetails extends Webinar {
  primaryMentor: WebinarMentorSummary | null;
  secondaryMentor: WebinarMentorSummary | null;
}

export interface WebinarPayload {
  name: string;
  description: string;
  startTime: string;
  endTime: string;
  webinarDate: string;
  posterUrl: string;
  location: string;
  primaryMentorId: number;
  secondaryMentorId?: number;
}
