import React, { useEffect, useState } from "react";

export default function PersonalInfoForm({ onChange, initialData }: any) {
  const [info, setInfo] = useState(initialData || { name: "", email: "", phone: "" });

  useEffect(() => {
    onChange(info);
  }, [info]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInfo({ ...info, [e.target.name]: e.target.value });
  };

  return (
    <div className="mb-3">
      <h5>Personal Information</h5>
      <input
        className="form-control mb-2"
        name="name"
        placeholder="Full Name"
        value={info.name}
        onChange={handleChange}
      />
      <input
        className="form-control mb-2"
        name="email"
        placeholder="Email"
        value={info.email}
        onChange={handleChange}
      />
      <input
        className="form-control"
        name="phone"
        placeholder="Phone"
        value={info.phone}
        onChange={handleChange}
      />
    </div>
  );
}
