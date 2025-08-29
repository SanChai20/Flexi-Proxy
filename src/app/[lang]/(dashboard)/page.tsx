import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { File, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Locale } from '../../../../i18n-config';

export default async function DashBoardHomePage(props: {
    params: Promise<{ lang: Locale }>;
}) {
    return (
        <Tabs defaultValue="all">
            <div className="flex items-center">

            </div>
        </Tabs>
    );
}
