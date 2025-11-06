import Link from "next/link";
import { GitHubIcon } from "./icons";

export function Footer({ dict }: { dict: any }) {
  return (
    <footer className="border-t bg-background mt-auto select-none">
      <div className="container py-4 md:py-4 sm:pl-16 lg:pl-[84px]">
        <div className="flex flex-col items-center justify-center gap-4 md:flex-row md:justify-center md:gap-8">
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} {dict.footer.company}.{" "}
            {dict.footer.rights}
          </div>
          <div className="flex gap-4">
            <Link
              href="/terms"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {dict.footer.terms}
            </Link>
            <Link
              href="/policy"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {dict.footer.policy}
            </Link>
            {process.env.GITHUB_FLEXIPROXY_REPOSITORY_URL && (
              <a
                href={process.env.GITHUB_FLEXIPROXY_REPOSITORY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                aria-label="GitHub Repository"
              >
                <GitHubIcon className="w-4 h-4" />
                GitHub
              </a>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
