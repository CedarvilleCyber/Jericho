"use client";

import { useEffect, useState } from "react";

export default function WaitForCookie({
  children,
  cookieName,
}: {
  children: React.ReactNode;
  cookieName: string;
}) {
  const [hasCookie, setHasCookie] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line prefer-const
    let interval: NodeJS.Timeout;

    const checkCookie = () => {
      if (document.cookie.split(";").some((item) => item.trim().startsWith(`${cookieName}=`))) {
        setHasCookie(true);
        if (interval) {
          clearInterval(interval);
        }
      }
    };

    interval = setInterval(checkCookie, 300);
    checkCookie();

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [cookieName]);

  return <>{hasCookie ? children : null}</>;
}
