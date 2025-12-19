export interface PersonalInfo {
  name: string;
  email: string;
  phone?: string;
  summary?: string;
}

export interface Education {
  school: string;
  degree: string;
  year?: string;
}

export interface Experience {
  company: string;
  role: string;
  duration: string;
  description?: string;
}

export interface Achievement {
  title: string;
  description?: string;
  date?: string;
}

export interface ResumeFormData {
  personalInfo?: PersonalInfo;
  education?: Education[];
  skills?: string[];
  experience?: Experience[];
  achievements?: Achievement[];
  title?: string;
}
