export interface JitsiOptions {
  roomName: string;
  displayName: string;
  email?: string;
  avatarUrl?: string;
  password?: string;
}

export function generateJitsiMeetUrl(options: JitsiOptions): string {
  const baseUrl = "https://meet.jit.si";
  const roomName = encodeURIComponent(options.roomName.replace(/\s+/g, "-").toLowerCase());
  
  const params = new URLSearchParams();
  if (options.displayName) {
    params.set("displayName", options.displayName);
  }
  if (options.email) {
    params.set("email", options.email);
  }

  const queryString = params.toString();
  return `${baseUrl}/${roomName}${queryString ? "?" + queryString : ""}`;
}

export function getJitsiIframeConfig(options: JitsiOptions) {
  return {
    roomName: options.roomName.replace(/\s+/g, "-").toLowerCase(),
    parentNode: "jitsi-container",
    configOverwrite: {
      startAudioOnly: false,
      startWithAudioMuted: false,
      startWithVideoMuted: false,
    },
    interfaceConfigOverwrite: {
      DEFAULT_LANGUAGE: "en",
      SHOW_JITSI_WATERMARK: false,
      MOBILE_APP_PROMO: false,
    },
    userInfo: {
      displayName: options.displayName,
      email: options.email,
    },
  };
}

export function createJitsiLinkForConsultation(consultationId: string, userName: string, userEmail: string): string {
  const roomName = `malishaedu-${consultationId}`;
  return generateJitsiMeetUrl({
    roomName,
    displayName: userName,
    email: userEmail,
  });
}
