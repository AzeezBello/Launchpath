"use client";
import { useEffect, useState } from "react";
import type { PersonalInfo } from "@/types/resume";

type Props = {
  initialData?: PersonalInfo;
  onChange?: (value: PersonalInfo) => void;
};

const EMPTY: PersonalInfo = { name: "", email: "", phone: "" };

export default function PersonalInfoForm({ onChange, initialData }: Props) {
  const [info, setInfo] = useState<PersonalInfo>(initialData || EMPTY);

  useEffect(() => {
    setInfo(initialData || EMPTY);
  }, [initialData]);

  useEffect(() => {
    onChange?.(info);
  }, [info, onChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInfo({ ...info, [e.target.name]: e.target.value });
  };

  return (
    <div className="glass-card p-4 rounded-xl shadow-md mb-3 space-y-2">
      <h3 className="text-lg font-semibold">👤 Personal Information</h3>
      <input
        className="border p-2 rounded w-full"
        name="name"
        placeholder="Full Name"
        value={info.name}
        onChange={handleChange}
      />
      <input
        className="border p-2 rounded w-full"
        name="email"
        placeholder="Email"
        value={info.email}
        onChange={handleChange}
      />
      <input
        className="border p-2 rounded w-full"
        name="phone"
        placeholder="Phone"
        value={info.phone}
        onChange={handleChange}
      />
    </div>
  );
}
