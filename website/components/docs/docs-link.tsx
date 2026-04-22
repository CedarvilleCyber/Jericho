"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface DocsLinkProps {
  href?: string;
  children?: React.ReactNode;
  className?: string;
}

export function DocsLink({ href, children, className }: DocsLinkProps) {
  const pathname = usePathname();

  let resolvedHref = href ?? "#";

  if (href && !href.startsWith("http") && !href.startsWith("/") && !href.startsWith("#") && !href.startsWith("mailto:")) {
    const dir = pathname.endsWith("/")
      ? pathname
      : pathname.lastIndexOf("/") > 0
        ? pathname.slice(0, pathname.lastIndexOf("/") + 1)
        : pathname + "/";
    const url = new URL(href, `http://x${dir}`);
    resolvedHref = url.pathname + url.hash;
  }

  return (
    <Link href={resolvedHref} className={className ?? "link link-primary"}>
      {children}
    </Link>
  );
}
