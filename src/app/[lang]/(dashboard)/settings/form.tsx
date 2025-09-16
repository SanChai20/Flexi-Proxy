"use server";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function SettingsForm({ dict }: { dict: any }) {
  const router = useRouter();
  async function onSubmit(formData: FormData) {
    router.push("/settings");
  }
  return (
    <form
      action={async (formData) => {
        "use server";
        const dataCollection = formData.get("dataCollection") === "on";
        // Here you would typically save the settings to a database or user profile
        console.log("Data Collection setting:", dataCollection);
      }}
      className="mt-6 px-6"
    >
      <div className="flex items-center justify-between py-4">
        <div>
          <h3 className="text-lg font-medium">
            {dict?.settings?.collection || "Data Collection"}
          </h3>
          <p className="text-sm text-muted-foreground">
            {dict?.settings?.collectionSubtitle ||
              "Enable or disable data collection for analytics"}
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            name="dataCollection"
            className="sr-only peer"
            defaultChecked={false}
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
        </label>
      </div>
      <div className="flex justify-end mt-4">
        <Button type="submit">
          {dict?.settings?.apply || "Apply Changes"}
        </Button>
      </div>
    </form>
  );
}
