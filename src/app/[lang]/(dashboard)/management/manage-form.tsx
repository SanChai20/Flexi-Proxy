// "use client";

// import { Button } from "@/components/ui/button";
// import { useActionState } from "react";





// export function ManagementForm() {
//   const [icon, setIcon] = useState('');

//   const [state, action, isPending] = useActionState<CreateState, FormData>(
//     createSubdomainAction,
//     {}
//   );

//   return (
//     <form action={action} className="space-y-4">
//       <SubdomainInput defaultValue={state?.subdomain} />

//       <IconPicker icon={icon} setIcon={setIcon} defaultValue={state?.icon} />

//       {state?.error && (
//         <div className="text-sm text-red-500">{state.error}</div>
//       )}

//       <Button type="submit" className="w-full" disabled={isPending || !icon}>
//         {isPending ? 'Creating...' : 'Create Subdomain'}
//       </Button>
//     </form>






//                           <form
//                             action={
//                               async (formData) => {
//                                 "use server";
//                                 const adapter = formData.get("adapter") as string;
//                                 const adapterJSON: {
//                                   provider_id: string;
//                                   provider_url: string;
//                                   base_url: string;
//                                   model_id: string;
//                                   create_time: string;
//                                 } = JSON.parse(adapter);
//                                 redirect(
//                                   `/${lang}/management/modify?baseUrl=${encodeURIComponent(
//                                     adapterJSON.base_url
//                                   )}&modelId=${encodeURIComponent(
//                                     adapterJSON.model_id
//                                   )}&providerId=${encodeURIComponent(
//                                     adapterJSON.provider_id
//                                   )}&createTime=${encodeURIComponent(
//                                     adapterJSON.create_time
//                                   )}`
//                                 );
//                               }}
//                           >
//                             <input
//                               type="hidden"
//                               name="adapter"
//                               value={JSON.stringify(adapter)}
//                             />
//                             <DropdownMenuItem
//                               className="w-full cursor-pointer text-destructive focus:text-destructive text-xs xs:text-sm"
//                               asChild
//                             >
//                               <button type="submit">
//                                 {dict?.management?.getApiKey || "Get API Key"}
//                               </button>
//                             </DropdownMenuItem>
//                           </form>
//   );
// }
