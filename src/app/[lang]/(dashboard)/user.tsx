import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { auth, signOut } from "@/auth";
import Link from "next/link";
import { Locale } from "i18n-config";

export async function User({ dict, lang }: { dict: any; lang: Locale }) {
  const session = await auth();
  let user = session?.user;
  const isLoggedIn = !!(session && session.user && session.user.id);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="overflow-hidden rounded-full"
        >
          <img
            src={
              user?.image ??
              [process.env.BASE_URL, "user-solid-full.svg"].join("/")
            }
            alt={user?.name || user?.email || "User"}
            width={28}
            height={28}
            className="overflow-hidden rounded-full dark:invert"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {isLoggedIn ? (
          <>
            <DropdownMenuLabel>
              {user?.name ?? user?.email ?? "User"}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <Link href="/settings">
              <DropdownMenuItem>
                {dict["navigation"]["settings"]}
              </DropdownMenuItem>
            </Link>
            <Link href="/contact">
              <DropdownMenuItem>
                {dict["navigation"]["contact"]}
              </DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <form
                action={async () => {
                  "use server";
                  await signOut();
                }}
                className="w-full"
              >
                <button type="submit" className="w-full text-left">
                  {dict["user"]["signout"]}
                </button>
              </form>
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <Link href={`/${lang}/verification`}>
              <DropdownMenuItem>
                {dict["login"]["signIn"] || "Sign In"}
              </DropdownMenuItem>
            </Link>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
