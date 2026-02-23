// src/utils/resumeStorage.ts
export interface ResumeData {
  id: string;
  personal: { name: string; email: string; phone: string };
  work: { company: string; role: string; start: string; end: string }[];
  achievements: string[];
}

const KEY = "user_resumes";

export function getResumes(): ResumeData[] {
  return JSON.parse(localStorage.getItem(KEY) || "[]");
}

export function saveResume(data: ResumeData) {
  const all = getResumes();
  const existingIndex = all.findIndex(r => r.id === data.id);

  if (existingIndex >= 0) {
    all[existingIndex] = data;
  } else {
    all.push(data);
  }

  localStorage.setItem(KEY, JSON.stringify(all));
}

export function getResumeById(id: string): ResumeData | undefined {
  return getResumes().find(r => r.id === id);
}

export function deleteResume(id: string) {
  const all = getResumes().filter(r => r.id !== id);
  localStorage.setItem(KEY, JSON.stringify(all));
}
