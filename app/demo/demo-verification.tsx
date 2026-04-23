"use client";

import { VerificationPrompt } from "@/components/chat/verification-prompt";

export function DemoVerification() {
  return (
    <VerificationPrompt
      fact={'אלעד בורשטיין אמר שתקציב השיווק לרבעון עומד על 200K ש"ח.'}
      onApprove={() => {}}
      onReject={() => {}}
    />
  );
}
