"use client";

import React from "react";
import { HolisticDashboard } from "./components/HolisticDashboard";

export default function HolisticPage() {
  // In a real app, this would come from auth/session
  const userId = "demo-user";

  return (
    <div className="min-h-screen bg-gray-50">
      <HolisticDashboard userId={userId} />
    </div>
  );
}
