import styles from "./page.module.css";
import { Turnstile } from "@marsidev/react-turnstile";
import { redirect } from "next/navigation";
import { Locale } from "../../../../i18n-config";
import { getDictionary } from "@/utils/get-dictionary";

export default async function VerificationPage(props: {
  params: Promise<{ lang: Locale }>;
}) {
    const { lang } = await props.params;
    const dictionary = await getDictionary(lang)
    return (
        <div className={styles.verifyContainer}>
            <div className={styles.verifyContent}>
                <div className={styles.verifyHeader}>
                    <h2 className={styles.verifyTitle}>{dictionary.verification.title}</h2>
                    <p className={styles.verifyDescription}>
                        {dictionary.verification.description}
                    </p>
                </div>
                
                <div className={styles.turnstileContainer}>
                    <Turnstile
                        siteKey={process.env.TURNSTILE_SITE_KEY as string}
                        onSuccess={async (token) => {
                            "use server";
                            redirect(`/${lang}/login?from=${token}`);
                        }}
                        options={{
                            theme: 'auto',
                            size: 'normal',
                            language: 'auto',
                            retry: 'auto',
                            refreshExpired: 'auto',
                        }}
                        className={styles.turnstile}
                    />
                </div>
                
                <div className={styles.verifyFooter}>
                    <p className={styles.verifyFooterText}>
                        {dictionary.verification.footer}
                    </p>
                </div>
            </div>
        </div>
    );
}