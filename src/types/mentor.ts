export interface Mentor {
  id: number;
  name: string;
  specialization: string;
  designation: string;
  description: string | null;
  rating: number | null;
  yearsOfExperience: number;
  linkedinId: string | null;
  photoUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MentorPayload {
  name: string;
  specialization: string;
  designation: string;
  description?: string;
  rating?: number;
  yearsOfExperience: number;
  linkedinId?: string;
  photoUrl?: string;
  isActive: boolean;
}
