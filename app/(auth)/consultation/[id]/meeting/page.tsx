"use client";

import { useEffect, useState } from "react";
import { createJitsiLinkForConsultation } from "@/src/lib/video-service";

export default function ConsultationMeetingPage({ params }: { params: { id: string } }) {
  const [meetingUrl, setMeetingUrl] = useState("");
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch("/api/v1/auth/me");
        const data = await response.json();
        
        if (data.user) {
          setUserName(data.user.name);
          setUserEmail(data.user.email);
          
          const url = createJitsiLinkForConsultation(params.id, data.user.name, data.user.email);
          setMeetingUrl(url);
        }
      } catch (error) {
        console.error("Failed to fetch user info:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-700 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading meeting room...</p>
        </div>
      </div>
    );
  }

  if (!meetingUrl) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 font-semibold mb-4">Failed to load meeting</p>
          <p className="text-gray-600">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto h-screen">
        <iframe
          title="Jitsi Meet Consultation"
          allow="camera; microphone; display-capture"
          allowFullScreen
          src={meetingUrl}
          style={{
            width: "100%",
            height: "100%",
            border: "none",
          }}
        />
      </div>
    </div>
  );
}
