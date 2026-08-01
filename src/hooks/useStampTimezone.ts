import { useEffect } from 'react';
import { useMyProfile, useUpdateProfile } from '@/api/profiles';
import { getDeviceTimeZone } from '@/lib/dates';

// E11 — keep profiles.timezone honest. The column existed since 00001 with a
// hard-coded 'America/New_York' default and nothing ever wrote it; the
// partner's "their time" clock needs the real zone. Stamped once per app
// session (tabs layout) and again whenever the stored value drifts from the
// device (travel, moves). Best-effort — never blocks anything.
export function useStampTimezone() {
  const { data: profile } = useMyProfile();
  const updateProfile = useUpdateProfile();

  const stored = profile?.timezone;
  const profileLoaded = !!profile;

  useEffect(() => {
    if (!profileLoaded) return;
    const device = getDeviceTimeZone();
    if (device && stored !== device) {
      updateProfile.mutate({ timezone: device });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileLoaded, stored]);
}
