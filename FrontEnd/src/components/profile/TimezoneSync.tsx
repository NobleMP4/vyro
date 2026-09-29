import { useEffect, useRef } from 'react';
import { useCurrentUser, useUpdateProfile } from '@/hooks/useCurrentUser';
import { deviceTimeZone } from '@/lib/timezone';

/**
 * Keeps the account time zone aligned with the device (e.g. after travelling),
 * so « today » and weeks match what the user sees. Runs at most once per session.
 */
export function TimezoneSync() {
  const { profile } = useCurrentUser();
  const { mutate } = useUpdateProfile();
  const attempted = useRef(false);

  useEffect(() => {
    const timezone = deviceTimeZone();
    if (attempted.current || profile.timezone === timezone) return;
    attempted.current = true;
    mutate({ timezone });
  }, [profile.timezone, mutate]);

  return null;
}
