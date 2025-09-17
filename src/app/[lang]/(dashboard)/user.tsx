import { Button } from "@/components/ui/button";
import Image from "next/image";
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

export async function User({ dict }: { dict: any }) {
  const session = await auth();
  let user = session?.user;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="overflow-hidden rounded-full"
        >
          <Image
            src={
              user?.image ??
              [process.env.BASE_URL, "user-solid-full.svg"].join("/")
            }
            width={28}
            height={28}
            alt="Avatar"
            className="overflow-hidden rounded-full dark:invert"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>
          {user?.name ?? user?.email ?? "User"}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <Link href="/settings">
          <DropdownMenuItem>{dict["navigation"]["settings"]}</DropdownMenuItem>
        </Link>
        <Link href="/contact">
          <DropdownMenuItem>{dict["navigation"]["contact"]}</DropdownMenuItem>
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
