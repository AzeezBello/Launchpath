export interface Scholarship {
  id: string;
  title: string;
  provider: string;
  amount?: string;
  amountMin?: number;
  amountMax?: number;
  deadline: string;
  country: string;
  description: string;
  url: string;
  fields: string[];
  eligibilityLevel: "Undergraduate" | "Postgraduate" | "All";
}


// src/lib/types.ts

export interface AdmissionProgram {
  id: string;
  name: string;
  university: string;
  country: string;
  courses: string[];
}

export interface JobOpportunity {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  url?: string;
}

export interface Grant {
  id: string;
  name: string;
  organization: string;
  fundingAmount: string;
  sector: string;
  country: string;
}
